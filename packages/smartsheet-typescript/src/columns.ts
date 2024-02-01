import { z } from 'zod';

/**
 * System column type is in addition to the regular column type.
 * It contains some additional system functionalities such as auto-numbering, created by, created date, modified by, and modified date.
 * It needs to be used in conjunction with the regular column type (e.g. TEXT_NUMBER for auto-numbering, DATE / DATETIME for created date, etc.).
 * If you are familiar with SQL, it is similar to the concept of a primary key, created_at, updated_at, auto-increment, etc.
 */
export enum SmartsheetSystemColumnType {
  AUTO_NUMBER = 'AUTO_NUMBER',
  CREATED_BY = 'CREATED_BY',
  CREATED_DATE = 'CREATED_DATE',
  MODIFIED_BY = 'MODIFIED_BY',
  MODIFIED_DATE = 'MODIFIED_DATE',
}
export const SystemColumnTypeSchema = z.nativeEnum(SmartsheetSystemColumnType);

/**
 * Column type is the main type of the column. It is required for creating a new column.
 */
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

export const AutoNumberFormatSchema = z.object({
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  fill: z.string().optional().describe('The fill will be a string of 0s, e.g. "0000"'),
});
export type SmartsheetAutoNumberFormat = z.infer<typeof AutoNumberFormatSchema>;

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
