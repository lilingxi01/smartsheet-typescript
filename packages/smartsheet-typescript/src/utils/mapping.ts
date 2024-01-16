import { SmartsheetSheet } from '@/sheets';
import { SmartsheetNewCell, SmartsheetRow } from '@/rows';
import { SmartsheetSchema } from '@/schema/schema-definitions';
import { NewRow, PreparedRow } from '@/index';
import { z } from 'zod';
import { getCombinedZodSchema } from '@/utils/combined-schema';

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
 */
export function mapObjectToColumns<Schema extends SmartsheetSchema>(
  sheet: SmartsheetSheet,
  schema: Schema,
  obj: NewRow<Schema>,
) {
  const columns = sheet.columns;
  const combinedZodSchema = getCombinedZodSchema(schema);
  const cells: SmartsheetNewCell[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (!((key as keyof Schema) in schema)) {
      throw new Error(`Column "${key}" is defined in the object but not in the schema.`);
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
    });
  }
  return cells;
}

/**
 * Map a row to an object.
 * @param row
 * @param preparedRowSchema
 * @param columnsMatchedWithSchema
 */
export function mapColumnsToObject<Schema extends SmartsheetSchema>(
  row: SmartsheetRow,
  preparedRowSchema: z.ZodType<PreparedRow<Schema>>,
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
  return preparedRowSchema.parse(obj);
}
