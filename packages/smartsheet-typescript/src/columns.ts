import { z } from 'zod';

export const SystemColumnTypeSchema = z.enum([
  'AUTO_NUMBER',
  'CREATED_BY',
  'CREATED_DATE',
  'MODIFIED_BY',
  'MODIFIED_DATE',
]);
export type SmartsheetSystemColumnType = z.infer<typeof SystemColumnTypeSchema>;

export enum SmartsheetColumnType {
  ABSTRACT_DATETIME = 'ABSTRACT_DATETIME',
  CHECKBOX = 'CHECKBOX',
  CONTACT_LIST = 'CONTACT_LIST',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  DURATION = 'DURATION',
  MULTI_CONTACT_LIST = 'MULTI_CONTACT_LIST',
  MULTI_PICKLIST = 'MULTI_PICKLIST',
  PICKLIST = 'PICKLIST',
  PREDECESSOR = 'PREDECESSOR',
  TEXT_NUMBER = 'TEXT_NUMBER',
}
export const ColumnTypeSchema = z.nativeEnum(SmartsheetColumnType);

export const NewColumnSchema = z.object({
  title: z.string(),
  type: ColumnTypeSchema,
  systemColumnType: SystemColumnTypeSchema.optional(),
  /**
   * Must be true or undefined.
   */
  primary: z.boolean().optional(),
  options: z.array(z.string()).optional(),
});
export type SmartsheetNewColumn = z.infer<typeof NewColumnSchema>;

export const ColumnSchema = NewColumnSchema.merge(z.object({
  id: z.number(),
}));
export type SmartsheetColumn = z.infer<typeof ColumnSchema>;
