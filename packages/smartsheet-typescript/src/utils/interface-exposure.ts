import { FinalizedCallerWithFetcher, TransformedFinalizedCaller } from '@/utils/procedure-core';
import { AxiosInstance } from 'axios';

export type FinalizedSmartsheetProcedureMap<OriginalProcedureMap> = {
  [K in keyof OriginalProcedureMap]: TransformedFinalizedCaller<OriginalProcedureMap[K]>;
};

export function _mixFetcherIntoAPI<OriginalProcedureMap extends {
  [key: string]: FinalizedCallerWithFetcher<any, any>
}>(
  origin: OriginalProcedureMap,
  fetcher: AxiosInstance,
): FinalizedSmartsheetProcedureMap<OriginalProcedureMap> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(origin)) {
    result[key] = value(fetcher);
  }
  return result as FinalizedSmartsheetProcedureMap<OriginalProcedureMap>;
}
