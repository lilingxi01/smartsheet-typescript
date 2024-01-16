import { SmartsheetColumnDefinition, SmartsheetSchema } from '@/schema/schema-definitions';
import { RowTypeDefineFunction, rowTypeMap } from '@/index';
import { z } from 'zod';

/**
 * Convert raw schema into an object of keys with corresponding Zod schemas for safe parsing.
 * @param schema - The raw schema of a sheet.
 */
export function getCombinedZodSchema<Schema extends SmartsheetSchema>(schema: Schema) {
  return Object.fromEntries(Object.entries(schema).map(([columnName, columnDefinition]) => {
    const rowTypeBuilder = rowTypeMap[columnDefinition.columnType] as RowTypeDefineFunction<typeof columnDefinition.columnType, z.ZodSchema> | undefined;
    if (!rowTypeBuilder) {
      throw new Error(`Row type builder for "${columnDefinition.columnType}" not found.`);
    }
    return [columnName, rowTypeBuilder(columnDefinition as SmartsheetColumnDefinition<typeof columnDefinition.columnType>)];
  }));
}
