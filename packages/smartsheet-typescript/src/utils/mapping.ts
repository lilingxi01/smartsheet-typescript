import { SmartsheetSheet } from '@/sheets';
import { SmartsheetRow } from '@/rows';
import { SmartsheetSchema } from '@/schema/schema-definitions';
import { z } from 'zod';
import { getCombinedZodSchema } from '@/utils/schema/get-combined-zod-schema';
import { CellFormatter, SmartsheetNewCell } from '@/cells';
import { NewRow, PreparedRow, ProcessingRow, RowFormats, RowFormatsWithActions } from '@/utils/rich-row-types';

type ObjectValueType<Schema extends SmartsheetSchema> = NewRow<Schema>[keyof Schema];
function mapObjectValueToSmartsheetValue<Schema extends SmartsheetSchema>(
  value: ObjectValueType<Schema>,
): string | string[] | number | boolean | null {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value ?? null;
}

/**
 * Map an object to a list of cells.
 * @param sheet
 * @param schema
 * @param obj
 * @param formats
 */
export function mapObjectToColumns<Schema extends SmartsheetSchema>(
  sheet: SmartsheetSheet,
  schema: Schema,
  obj: NewRow<Schema>,
  formats?: RowFormats<Schema>,
) {
  const defaultFormats: RowFormats<Schema> = Object.fromEntries(Object.keys(schema).map((key) => {
    const columnName = schema[key as keyof Schema].columnName;
    const currDefaultFormat = schema[key as keyof Schema].defaultFormat;
    if (!currDefaultFormat) {
      return [columnName, CellFormatter.defaultFormatter];
    }
    return [columnName, CellFormatter.parse(currDefaultFormat)];
  })) as RowFormats<Schema>;
  const combinedFormats = { ...defaultFormats, ...formats };
  const columns = sheet.columns;
  const combinedZodSchema = getCombinedZodSchema(schema);
  const cells: SmartsheetNewCell[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (!((key as keyof Schema) in schema)) {
      continue;
    }
    const columnName = schema[key as keyof Schema].columnName;
    const typeEnforcement = combinedZodSchema[key];
    if (!typeEnforcement) {
      throw new Error(`Type enforcement for "${key}" not found.`);
    }
    const column = columns.find((column) => column.title === columnName);
    if (!column) {
      throw new Error(`Column name "${columnName}" not found in sheet.`);
    }
    if (!typeEnforcement.safeParse(value).success) {
      throw new Error(`Value "${value}" for column "${columnName}" does not match the type enforcement.`);
    }
    cells.push({
      columnId: column.id,
      value: mapObjectValueToSmartsheetValue(value),
      format: combinedFormats[key].stringify(),
    });
  }
  return cells;
}

/**
 * Map a row to an ProcessingRow object.
 * @param row
 * @param schema
 * @param rowSchema
 * @param columnsMatchedWithSchema
 */
export function mapColumnsToObject<Schema extends SmartsheetSchema>(
  row: SmartsheetRow,
  schema: Schema,
  rowSchema: z.ZodType<ProcessingRow<Schema>>,
  columnsMatchedWithSchema: Record<number, string>,
): PreparedRow<Schema> {
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
    ...rowSchema.parse(obj),
    formats: mapColumnsToFormats(row, schema, columnsMatchedWithSchema),
    update: async () => {
      // This is a placeholder function. This will be implemented at a higher level with more context.
      throw new Error('Not implemented properly. This is probably caused by an internal error of the SDK.');
    },
  };
}

/**
 * Map a row to a RowFormats object.
 * @param row
 * @param schema
 * @param columnsMatchedWithSchema
 */
export function mapColumnsToFormats<Schema extends SmartsheetSchema>(
  row: SmartsheetRow,
  schema: Schema,
  columnsMatchedWithSchema: Record<number, string>,
): RowFormatsWithActions<Schema> {
  const obj: Record<string, CellFormatter> = {};
  for (const cell of row.cells) {
    const columnName = columnsMatchedWithSchema[cell.columnId];
    if (!columnName) {
      continue;
    }
    obj[columnName] = CellFormatter.parse(cell.format ?? '');
  }
  for (const columnName of Object.values(columnsMatchedWithSchema)) {
    if (!obj[columnName]) {
      obj[columnName] = CellFormatter.parse('');
    }
  }
  for (const [key, value] of Object.entries(obj)) {
    obj[key] = Object.assign(value, {
      applyDefaultFormat: function() {
        Object.assign(this, {
          ...CellFormatter.defaultFormatter,
          ...schema[key].defaultFormat,
        });
      },
    });
  }
  // When all keys are populated, it is safe to cast the object to RowFormats<Schema>.
  return obj as RowFormatsWithActions<Schema>;
}
