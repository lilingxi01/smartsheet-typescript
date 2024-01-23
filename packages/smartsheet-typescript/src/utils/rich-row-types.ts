import { z, ZodArray, ZodEnum, ZodOptional } from 'zod';
import { SmartsheetColumn, SmartsheetColumnType } from '@/columns';
import { SmartsheetColumnDefinition, SmartsheetSchema } from '@/schema/schema-definitions';
import { CellFormatter } from '@/cells';
import { SmartsheetSheet } from '@/sheets';

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
  'TEXT_NUMBER': () => z.string().or(z.number()),
};
export type RowTypeMap = typeof rowTypeMap;

export type ExtractPicklistReturnType<T extends SmartsheetColumnType, Options extends [string, ...string[]]> = RowTypeMap[T] extends (def: any) => infer R
  ? R extends ZodEnum<any>
    ? ZodEnum<Options>
    : R extends ZodArray<ZodEnum<any>>
      ? ZodArray<ZodEnum<Options>>
      : never
  : never;

export type FunctionTypeByInputType<
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

export type RowFormatWithActions = CellFormatter & {
  /**
   * Apply the default format (of this column) that is defined in the Smartsheet local schema to this cell.
   */
  applyDefaultFormat: () => void;
};

export type RowFormatsWithActions<Schema extends SmartsheetSchema> = {
  [K in keyof Schema]: RowFormatWithActions;
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
  formats: RowFormatsWithActions<Schema>;
  update: () => Promise<void>;
};

export type PreparedSheet<Schema extends SmartsheetSchema> = {
  getSheet: () => Promise<SmartsheetSheet>;
  getColumns: () => Promise<SmartsheetColumn[]>;
  getRows: () => Promise<PreparedRow<Schema>[]>;
  insertRow: (row: NewRow<Schema>) => Promise<PreparedRow<Schema>>;
  // TODO: Implement the function below.
  // insertRowAt: (row: NewRow<Schema>, index: number) => Promise<PreparedRow<Schema>>;
  getRow: (rowId: number) => Promise<PreparedRow<Schema>>;
};
