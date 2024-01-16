import { sheets, SmartsheetSheet } from './sheets';
import { rows } from './rows';
import { SmartsheetColumnDefinition, SmartsheetSchema } from './schema/schema-definitions';
import { SmartsheetColumn, SmartsheetColumnType } from './columns';
import { z } from 'zod';
import { compareItems } from './utils/compare-items';
import { mapColumnsToObject, mapObjectToColumns } from '@/utils/mapping';
import { getCombinedZodSchema } from '@/utils/combined-schema';

export type RowTypeDefineFunction<T extends SmartsheetColumnType, OutputType extends z.ZodSchema> = (def: SmartsheetColumnDefinition<T>) => OutputType;
function defineRowType<T extends SmartsheetColumnType, OutputType extends z.ZodSchema>(
  def: OutputType | RowTypeDefineFunction<T, OutputType>,
): RowTypeDefineFunction<T, OutputType> {
  if (typeof def === 'function') {
    return def;
  }
  return () => def;
}

type AbstractedRowTypeMap = {
  [K in SmartsheetColumnType]: RowTypeDefineFunction<K, z.ZodSchema>;
}
function defineRowTypeMap<Map extends AbstractedRowTypeMap>(map: Map): Map {
  return map;
}

export const rowTypeMap = defineRowTypeMap({
  'ABSTRACT_DATETIME': () => z.string(),
  'CHECKBOX': defineRowType(z.boolean()),
  'CONTACT_LIST': defineRowType(z.array(z.string())),
  'DATE': defineRowType(z.date()),
  'DATETIME': defineRowType(z.date()),
  'DURATION': defineRowType(z.number()),
  'MULTI_CONTACT_LIST': defineRowType(z.array(z.string())),
  'MULTI_PICKLIST': (def) => {
    return z.array(z.enum(def.options));
  },
  'PICKLIST': (def) => {
    return z.enum(def.options);
  },
  'PREDECESSOR': defineRowType(z.string()),
  'TEXT_NUMBER': defineRowType(z.string()),
});
type RowTypeMap = typeof rowTypeMap;

export type NewRow<Schema extends SmartsheetSchema> = Partial<{
  [K in keyof Schema]: z.infer<ReturnType<RowTypeMap[Schema[K]['columnType']]>>;
}>;

export type PreparedRow<Schema extends SmartsheetSchema> = {
  [K in keyof Schema]: z.infer<ReturnType<RowTypeMap[Schema[K]['columnType']]>>;
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

type PrepareSheetOptions = {
  createIfNotExist?: boolean;
}

async function prepareSheet<Schema extends SmartsheetSchema>(
  name: string,
  schema: Schema,
  options: PrepareSheetOptions = {},
): Promise<PreparedSheet<Schema>> {
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
          options: 'options' in columnDefinition ? columnDefinition.options : undefined,
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
    const columnDefinition = schema[column.title];
    if (!columnDefinition) {
      continue;
    }
    // Check if the type matches.
    if (column.type !== columnDefinition.columnType) {
      throw new Error(`Column "${column.title}" type mismatch. Expected "${columnDefinition.columnType}", but got "${column.type}".`);
    }
    if ('options' in columnDefinition && (!column.options || !compareItems(columnDefinition.options, column.options))) {
      throw new Error(`Column "${column.title}" options mismatch. Expected "${columnDefinition.options}", but got "${column.options}".`);
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
}

export const SmartsheetAPI = {
  sheets,
  rows,
  prepareSheet,
};
