import { z } from 'zod';

export const SystemColumnTypeSchema = z.enum([
  'AUTO_NUMBER',
  'CREATED_BY',
  'CREATED_DATE',
  'MODIFIED_BY',
  'MODIFIED_DATE',
]);
export type SmartsheetSystemColumnType = z.infer<typeof SystemColumnTypeSchema>;

export const ColumnTypeSchema = z.enum([
  'ABSTRACT_DATETIME',
  'CHECKBOX',
  'CONTACT_LIST',
  'DATE',
  'DATETIME',
  'DURATION',
  'MULTI_CONTACT_LIST',
  'MULTI_PICKLIST',
  'PICKLIST',
  'PREDECESSOR',
  'TEXT_NUMBER',
]);
export type SmartsheetColumnType = z.infer<typeof ColumnTypeSchema>;

export const ColumnSchema = z.object({
  title: z.string(),
  type: ColumnTypeSchema,
  systemColumnType: SystemColumnTypeSchema.optional(),
  /**
   * Must be true or undefined.
   */
  primary: z.boolean().optional(),
});
export type SmartsheetColumn = z.infer<typeof ColumnSchema>;
