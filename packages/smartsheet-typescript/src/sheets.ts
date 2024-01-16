import { smartsheetFetcher } from './utils/fetcher';
import { SmartsheetFilterOptionsSchema } from './logistics/filter';
import { defineProcedure } from './utils/procedure-core';
import { z } from 'zod';
import { ColumnSchema, NewColumnSchema } from './columns';
import { RowSchema } from './rows';

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
      columns: NewColumnSchema.array(),
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
