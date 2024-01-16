import { SmartsheetColumnType } from '../columns';

type SmartsheetColumnConfigParams<T extends SmartsheetColumnType> = T extends keyof ColumnTypeDefinitionMap
  ? ColumnTypeDefinitionMap[T]
  : {/* No additional config available */};
export type SmartsheetColumnDefinition<T extends SmartsheetColumnType, K extends SmartsheetColumnConfigParams<T> = SmartsheetColumnConfigParams<T>> = {
  columnName: string;
  columnType: T;
  primary?: boolean;
} & K;

export type SmartsheetSchema = {
  [columnName: string]: SmartsheetColumnDefinition<SmartsheetColumnType>;
};

type ColumnTypeDefinitionMap = {
  'PICKLIST': {
    options: [string, ...string[]];
  },
  'MULTI_PICKLIST': {
    options: [string, ...string[]];
  },
};

export function defineColumn<T extends SmartsheetColumnType>(def: SmartsheetColumnDefinition<T>): SmartsheetColumnDefinition<T> {
  return def;
}
