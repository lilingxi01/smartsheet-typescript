import { SmartsheetAutoNumberFormat, SmartsheetColumnType, SmartsheetSystemColumnType } from '@/columns';
import { ZodEnum } from 'zod';
import { CellFormatter } from '@/cells';

export type ColumnTypesRequiringOptions = 'MULTI_PICKLIST' | 'PICKLIST';

export enum SmartsheetSymbol {
  STAR_RATING = 'STAR_RATING',
}

export type SmartsheetColumnDefinition<T extends SmartsheetColumnType, Options extends [string, ...string[]]> = {
  columnName: string;
  columnType: T;
  systemColumnType?: SmartsheetSystemColumnType;
  primary?: boolean;
  validation?: boolean;
  defaultFormat?: Partial<CellFormatter>;
  autoNumberFormat?: SmartsheetAutoNumberFormat;
} & (T extends ColumnTypesRequiringOptions ? {
  options: ZodEnum<Options>;
  symbol?: SmartsheetSymbol | null;
} : {
  options?: never;
});

export type SmartsheetSchema = {
  [columnName: string]: SmartsheetColumnDefinition<SmartsheetColumnType, [string, ...string[]]>;
};

export function defineColumn<
  T extends SmartsheetColumnType,
  Options extends [string, ...string[]],
>(
  def: SmartsheetColumnDefinition<T, Options>,
): SmartsheetColumnDefinition<T, Options> {
  return def;
}
