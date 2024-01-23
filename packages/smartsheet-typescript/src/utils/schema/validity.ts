import { SmartsheetSchema } from '@/schema/schema-definitions';

/**
 * Check if the schema is valid (has exactly one primary column).
 * @param schema - The schema to check.
 * @private
 */
export function _checkSchemaValidity(schema: SmartsheetSchema): void {
  const columnNames = Object.keys(schema);
  const primaryColumnNames = columnNames.filter((columnName) => schema[columnName].primary);
  if (primaryColumnNames.length !== 1) {
    throw new Error(`Schema must have exactly one primary column, but got ${primaryColumnNames.length}.`);
  }
}
