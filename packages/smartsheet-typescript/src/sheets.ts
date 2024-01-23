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
    action: async ({ input, fetcher }) => {
      // TODO.
      const response = await fetcher.get('/sheets');
      return response.data?.data ?? [];
    },
  }),
  getSheet: defineProcedure({
    input: z.object({
      sheetId: z.number(),
    }).merge(SmartsheetFilterOptionsSchema),
    output: SheetSchema,
    action: async ({ input, fetcher }) => {
      // TODO.
      const response = await fetcher.get<SmartsheetSheet>(`/sheets/${input.sheetId}`, {
        params: {
          include: 'format',
        },
      });
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
    action: async ({ input, fetcher }) => {
      // TODO.
      const response = await fetcher.post('/sheets', input);
      return response.data?.result;
    },
  }),
};
