import { SmartsheetSheet } from '@/sheets';
import { SmartsheetRow } from '@/rows';
import { SmartsheetSchema } from '@/schema/schema-definitions';
import { NewRow, PreparedRow, ProcessingRow, RowFormats, SmartsheetAPI } from '@/index';
import { z } from 'zod';
import { getCombinedZodSchema } from '@/utils/combined-schema';
import { CellFormatter, SmartsheetNewCell } from '@/cells';

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
    console.log('stringify:', formats?.[key]?.stringify());
    cells.push({
      columnId: column.id,
      value: mapObjectValueToSmartsheetValue(value),
      format: formats?.[key]?.stringify() ?? undefined,
    });
  }
  return cells;
}

/**
 * Map a row to an ProcessingRow object.
 * @param row
 * @param rowSchema
 * @param columnsMatchedWithSchema
 */
export function mapColumnsToObject<Schema extends SmartsheetSchema>(
  row: SmartsheetRow,
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
    formats: mapColumnsToFormats(row, columnsMatchedWithSchema),
    update: async () => {
      // This is a placeholder function. This will be implemented at a higher level with more context.
      throw new Error('Not implemented properly. This is probably caused by an internal error of the SDK.');
    },
  };
}

/**
 * Map a row to a RowFormats object.
 * @param row
 * @param columnsMatchedWithSchema
 */
export function mapColumnsToFormats<Schema extends SmartsheetSchema>(
  row: SmartsheetRow,
  columnsMatchedWithSchema: Record<number, string>,
): RowFormats<Schema> {
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
  // When all keys are populated, it is safe to cast the object to RowFormats<Schema>.
  return obj as RowFormats<Schema>;
}
