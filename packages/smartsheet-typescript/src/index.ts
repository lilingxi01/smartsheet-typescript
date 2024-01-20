import { sheets, SmartsheetSheet } from '@/sheets';
import { rows } from '@/rows';
import {
  SmartsheetColumnDefinition,
  SmartsheetSchema,
} from '@/schema/schema-definitions';
import { SmartsheetColumn, SmartsheetColumnType } from '@/columns';
import { z, ZodArray, ZodEnum, ZodOptional } from 'zod';
import { compareItems } from '@/utils/compare-items';
import { mapColumnsToFormats, mapColumnsToObject, mapObjectToColumns } from '@/utils/mapping';
import { getCombinedZodSchema } from '@/utils/combined-schema';
import { errorHandler } from '@/utils/error-handler';
import { CellFormatter } from '@/cells';

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

/**
 * The schema map for all data types within a sheet.
 */
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
  [K in keyof Schema]?: z.infer<ZodOptional<ReturnType<FunctionTypeByInputType<Schema, K>>>>;
};

export type RowFormats<Schema extends SmartsheetSchema> = {
  [K in keyof Schema]: CellFormatter;
};

/**
 * This type is used to hold the row data that is being processed. But this is not the final form of the row data.
 * It will be converted to `PreparedRow` before being returned to the user and the `formats` property will be added.
 */
export type ProcessingRow<Schema extends SmartsheetSchema> = {
  [K in keyof Schema]: z.infer<ZodOptional<ReturnType<FunctionTypeByInputType<Schema, K>>>>;
} & {
  id: number;
}
export type PreparedRow<Schema extends SmartsheetSchema> = ProcessingRow<Schema> & {
  formats: RowFormats<Schema>;
  update: () => Promise<void>;
};

type PreparedSheet<Schema extends SmartsheetSchema> = {
  getSheet: () => Promise<SmartsheetSheet>;
  getColumns: () => Promise<SmartsheetColumn[]>;
  getRows: () => Promise<PreparedRow<Schema>[]>;
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
    console.log('sheet:', sheet);
    const columnsMatchedWithSchema: Record<number, string> = {}; // Key: column id, value: column title.
    for (const column of sheet.columns) {
      const columnKey = Object.keys(schema).find((key) => schema[key].columnName === column.title);
      if (!columnKey) {
        continue;
      }
      const columnDefinition = schema[columnKey];
      // Check if the type matches.
      if (column.type !== columnDefinition.columnType) {
        throw new Error(`Column "${column.title}" type mismatch. Expected "${columnDefinition.columnType}", but got "${column.type}".`);
      }
      if ('options' in columnDefinition && (!column.options || !compareItems(columnDefinition.options?._def.values, column.options))) {
        throw new Error(`Column "${column.title}" options mismatch. Expected "${columnDefinition.options?._def.values}", but got "${column.options}".`);
      }
      columnsMatchedWithSchema[column.id] = columnKey;
    }

    const combinedSchema = getCombinedZodSchema(schema);
    const preparedRowSchema = z.object(combinedSchema).merge(z.object({
      id: z.number(),
    })) as z.ZodType<ProcessingRow<Schema>>;

    function updateRow(row: PreparedRow<Schema>) {
      return SmartsheetAPI.rows.updateRow({
        sheetId: sheetId,
        rowId: row.id,
        data: {
          cells: mapObjectToColumns(sheet, schema, row, row.formats),
        },
      });
    }

    return {
      getSheet: async () => sheet,
      getColumns: async () => sheet.columns,
      getRows: async () => {
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
          return {
            ...preparedRowSchema.parse(obj),
            formats: mapColumnsToFormats(row, columnsMatchedWithSchema),
            update: async function() {
              await updateRow(this);
            },
          } satisfies PreparedRow<Schema>;
        });
      },
      insertRow: async (row: NewRow<Schema>) => {
        const createdRow = await SmartsheetAPI.rows.insertRow({
          sheetId: sheetId,
          row: {
            cells: mapObjectToColumns(sheet, schema, row),
          },
        });
        return {
          ...mapColumnsToObject(createdRow, preparedRowSchema, columnsMatchedWithSchema),
          update: async function() {
            await updateRow(this);
          },
        } satisfies PreparedRow<Schema>;
      },
      getRow: async (rowId: number) => {
        const row = await SmartsheetAPI.rows.getRow({
          sheetId: sheetId,
          rowId: rowId,
        });
        if (!row) {
          throw new Error(`Row "${rowId}" not found.`);
        }
        return {
          ...mapColumnsToObject(row, preparedRowSchema, columnsMatchedWithSchema),
          update: async function() {
            await updateRow(this);
          },
        } satisfies PreparedRow<Schema>;
      },
    } satisfies PreparedSheet<Schema>;
  });
}

export const SmartsheetAPI = {
  sheets,
  rows,
  prepareSheet,
};

// Export the rest of the exported classes, functions, and types from the other files.
export * from '@/sheets';
export * from '@/rows';
export * from '@/columns';
export * from '@/cells';
export * from '@/schema/schema-definitions';
