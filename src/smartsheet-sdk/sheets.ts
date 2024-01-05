import { smartsheetFetcher } from '@/smartsheet-sdk/utils/fetcher';
import { SmartsheetFilterOptionsSchema } from '@/smartsheet-sdk/logistics/filter';
import { defineProcedure } from '@/smartsheet-sdk/utils/procedure-core';
import { z } from 'zod';
import { ColumnSchema } from '@/smartsheet-sdk/columns';
import { RowSchema } from '@/smartsheet-sdk/rows';

export const SheetSchema = z.object({
  id: z.number(),
  name: z.string(),
  permalink: z.string(),
  columns: ColumnSchema.array(),
  rows: RowSchema.array(),
});
export type SmartsheetSheet = z.infer<typeof SheetSchema>;

export const sheets = {
  listSheets: defineProcedure({
    input: SmartsheetFilterOptionsSchema.optional(),
    output: z.object({
      id: z.number(),
      accessLevel: z.string(),
      createdAt: z.string(),
      modifiedAt: z.string(),
      name: z.string(),
      permalink: z.string(),
      version: z.number().optional(),
    }).array(),
    action: async ({ input }) => {
      // TODO.
      const response = await smartsheetFetcher.get('/sheets');
      return response.data?.data ?? [];
    },
  }),
  getSheet: defineProcedure({
    input: z.object({
      sheetId: z.number(),
    }).merge(SmartsheetFilterOptionsSchema),
    output: SheetSchema,
    action: async ({ input }) => {
      // TODO.
      const response = await smartsheetFetcher.get<SmartsheetSheet>(`/sheets/${input.sheetId}`);
      return response.data;
    },
  }),
  createSheetIntoSheets: defineProcedure({
    input: z.object({
      name: z.string(),
      columns: ColumnSchema.array(),
    }),
    output: z.object({
      id: z.number(),
      accessLevel: z.string(),
      name: z.string(),
      permalink: z.string(),
    }),
    action: async ({ input }) => {
      // TODO.
      const response = await smartsheetFetcher.post('/sheets', input);
      return response.data?.result;
    },
  }),
};
