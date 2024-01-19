import { sheets, SmartsheetSheet } from '@/sheets';
import { rows } from '@/rows';
import {
  SmartsheetColumnDefinition,
  SmartsheetSchema,
} from '@/schema/schema-definitions';
import { SmartsheetColumn, SmartsheetColumnType } from '@/columns';
import { z, ZodArray, ZodEnum } from 'zod';
import { compareItems } from '@/utils/compare-items';
import { mapColumnsToObject, mapObjectToColumns } from '@/utils/mapping';
import { getCombinedZodSchema } from '@/utils/combined-schema';
import { errorHandler } from '@/utils/error-handler';

export type ConditionalRowValue<
  T extends SmartsheetColumnType,
  OutputType,
> = <
  Options extends [string, ...string[]],
>(def: SmartsheetColumnDefinition<T, Options>) => OutputType;

function defineRowValueSchema<
  T extends SmartsheetColumnType,
  OutputType,
  Func extends ConditionalRowValue<T, OutputType>,
>(columnType: T, func: Func) {
  return func;
}

export const rowTypeMap = {
  'ABSTRACT_DATETIME': () => z.string(),
  'CHECKBOX': () => z.boolean(),
  'CONTACT_LIST': () => z.array(z.string()),
  'DATE': () => z.date(),
  'DATETIME': () => z.date(),
  'DURATION': () => z.number(),
  'MULTI_CONTACT_LIST': () => z.array(z.string()),
  'MULTI_PICKLIST': defineRowValueSchema(SmartsheetColumnType.MULTI_PICKLIST, (def) => {
    return z.array(def.options);
  }),
  'PICKLIST': defineRowValueSchema(SmartsheetColumnType.PICKLIST, (def) => {
    return def.options;
  }),
  'PREDECESSOR': () => z.string(),
  'TEXT_NUMBER': () => z.string(),
};
type RowTypeMap = typeof rowTypeMap;

type ExtractPicklistReturnType<T extends SmartsheetColumnType, Options extends [string, ...string[]]> = RowTypeMap[T] extends (def: any) => infer R
  ? R extends ZodEnum<any>
    ? ZodEnum<Options>
    : R extends ZodArray<ZodEnum<any>>
      ? ZodArray<ZodEnum<Options>>
      : never
  : never;

type FunctionTypeByInputType<
  Schema extends SmartsheetSchema,
  K extends keyof Schema,
> = Schema[K]['options'] extends z.ZodEnum<infer Options>
  ? (def: SmartsheetColumnDefinition<Schema[K]['columnType'], Options>) => ExtractPicklistReturnType<Schema[K]['columnType'], Options>
  : RowTypeMap[Schema[K]['columnType']];

export type NewRow<Schema extends SmartsheetSchema> = {
  [K in keyof Schema]?: z.infer<ReturnType<FunctionTypeByInputType<Schema, K>>>;
};

export type PreparedRow<Schema extends SmartsheetSchema> = {
  [K in keyof Schema]: z.infer<ReturnType<FunctionTypeByInputType<Schema, K>>>;
} & {
  id: number;
}

type PreparedSheet<Schema extends SmartsheetSchema> = {
  getSheet: () => SmartsheetSheet;
  getColumns: () => SmartsheetColumn[];
  getRows: () => PreparedRow<Schema>[];
  insertRow: (row: NewRow<Schema>) => Promise<PreparedRow<Schema>>;
  // TODO: Implement the function below.
  // insertRowAt: (row: NewRow<Schema>, index: number) => Promise<PreparedRow<Schema>>;
  getRow: (rowId: number) => Promise<PreparedRow<Schema>>;
};

/**
 * Check if the schema is valid (has exactly one primary column).
 * @param schema - The schema to check.
 */
function checkSchemaValidity(schema: SmartsheetSchema): void {
  const columnNames = Object.keys(schema);
  const primaryColumnNames = columnNames.filter((columnName) => schema[columnName].primary);
  if (primaryColumnNames.length !== 1) {
    throw new Error(`Schema must have exactly one primary column, but got ${primaryColumnNames.length}.`);
  }
}

type PrepareSheetOptions<Schema extends SmartsheetSchema> = {
  name: string;
  schema: Schema;
  createIfNotExist?: boolean;
}

async function prepareSheet<Schema extends SmartsheetSchema>(sheetSetup: PrepareSheetOptions<Schema>): Promise<PreparedSheet<Schema>> {
  return await errorHandler(async () => {
    const {
      name,
      schema,
      ...options
    } = sheetSetup;
    checkSchemaValidity(schema);
    const sheets = await SmartsheetAPI.sheets.listSheets();
    const foundSheet = sheets.find((sheet) => sheet.name === name);
    if (!foundSheet && !options.createIfNotExist) {
      throw new Error(`Sheet "${name}" not found.`);
    }

    let sheetId: number;
    if (!foundSheet) {
      const createdSheet = await SmartsheetAPI.sheets.createSheetIntoSheets({
        name: name,
        columns: Object.entries(schema).map(([_, columnDefinition]) => {
          const columnName = columnDefinition.columnName;
          return {
            title: columnName,
            type: columnDefinition.columnType,
            options: 'options' in columnDefinition ? columnDefinition.options?._def.values : undefined,
            primary: columnDefinition.primary,
          };
        }),
      });
      sheetId = createdSheet.id;
    } else {
      sheetId = foundSheet.id;
    }

    const sheet = await SmartsheetAPI.sheets.getSheet({ sheetId: sheetId });
    const columnsMatchedWithSchema: Record<number, string> = {}; // Key: column id, value: column title.
    for (const column of sheet.columns) {
      const columnDefinition = Object.values(schema).find((columnDefinition) => columnDefinition.columnName === column.title);
      if (!columnDefinition) {
        continue;
      }
      // Check if the type matches.
      if (column.type !== columnDefinition.columnType) {
        throw new Error(`Column "${column.title}" type mismatch. Expected "${columnDefinition.columnType}", but got "${column.type}".`);
      }
      if ('options' in columnDefinition && (!column.options || !compareItems(columnDefinition.options?._def.values, column.options))) {
        throw new Error(`Column "${column.title}" options mismatch. Expected "${columnDefinition.options?._def.values}", but got "${column.options}".`);
      }
      columnsMatchedWithSchema[column.id] = column.title;
    }

    const combinedSchema = getCombinedZodSchema(schema);
    const preparedRowSchema = z.object(combinedSchema).merge(z.object({
      id: z.number(),
    })) as z.ZodType<PreparedRow<Schema>>;

    return {
      getSheet: () => sheet,
      getColumns: () => sheet.columns,
      getRows: () => {
        return sheet.rows.map((row) => {
          const obj: Record<string, unknown> = {};
          for (const cell of row.cells) {
            const columnName = columnsMatchedWithSchema[cell.columnId];
            if (!columnName) {
              continue;
            }
            obj[columnName] = cell.value;
          }
          obj.id = row.id;
          return preparedRowSchema.parse(obj);
        });
      },
      insertRow: async (row: NewRow<Schema>) => {
        const createdRow = await SmartsheetAPI.rows.insertRow({
          sheetId: sheetId,
          row: {
            cells: mapObjectToColumns(sheet, schema, row),
          },
        });
        return mapColumnsToObject(createdRow, preparedRowSchema, columnsMatchedWithSchema);
      },
      getRow: async (rowId: number) => {
        const row = await SmartsheetAPI.rows.getRow({
          sheetId: sheetId,
          rowId: rowId,
        });
        if (!row) {
          throw new Error(`Row "${rowId}" not found.`);
        }
        return mapColumnsToObject(row, preparedRowSchema, columnsMatchedWithSchema);
      },
    };
  });
}

export const SmartsheetAPI = {
  sheets,
  rows,
  prepareSheet,
};
