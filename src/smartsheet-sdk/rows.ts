import { z } from 'zod';
import { defineProcedure } from '@/smartsheet-sdk/utils/procedure-core';
import { smartsheetFetcher } from '@/smartsheet-sdk/utils/fetcher';

const NewCellSharedSchema = z.object({
  columnId: z.number(),
  format: z.string().optional(),
});
export const NewCellSchema = z.union([
  z.object({
    value: z.string().or(z.number()).or(z.boolean()).or(z.null()),
  }).merge(NewCellSharedSchema),
  z.object({
    formula: z.string(),
  }).merge(NewCellSharedSchema),
]);

export const NewRowSchema = z.object({
  expanded: z.boolean().optional(),
  locked: z.boolean().optional(),
  cells: NewCellSchema.array(),
});

// TODO: Add the rest of the cell types.
export const CellSchema = z.object({
  columnId: z.number(),
  value: z.unknown(),
  displayValue: z.unknown(),
  columnType: z.unknown(),
  strict: z.boolean().optional(),
});

export const RowSchema = z.object({
  id: z.number(),
  rowNumber: z.number(),
  expanded: z.boolean(),
  createdAt: z.string(),
  modifiedAt: z.string(),
  cells: CellSchema.array(),
});
export type SmartsheetRow = z.infer<typeof RowSchema>;

export const rows = {
  insertRow: defineProcedure({
    input: z.object({
      sheetId: z.number(),
      row: NewRowSchema,
    }),
    output: RowSchema,
    action: async ({ input }) => {
      // TODO.
      const response = await smartsheetFetcher.post(`/sheets/${input.sheetId}/rows`, input.row);
      const createdRows = response.data?.result;
      if (!createdRows) {
        throw new Error('Failed to create the row.');
      }
      if (Array.isArray(createdRows)) {
        return createdRows[0];
      }
      return createdRows;
    },
  }),
  insertRows: defineProcedure({
    input: z.object({
      sheetId: z.number(),
      rows: NewRowSchema.array(),
    }),
    output: RowSchema.array(),
    action: async ({ input }) => {
      // TODO.
      const response = await smartsheetFetcher.post(`/sheets/${input.sheetId}/rows`, input.rows);
      const createdRows = response.data?.result;
      if (!createdRows || !Array.isArray(createdRows)) {
        throw new Error('Failed to create the rows.');
      }
      return createdRows;
    },
  }),
  getRow: defineProcedure({
    input: z.object({
      sheetId: z.number(),
      rowId: z.number(),
    }),
    output: RowSchema,
    action: async ({ input }) => {
      // TODO.
      const response = await smartsheetFetcher.get<SmartsheetRow>(`/sheets/${input.sheetId}/rows/${input.rowId}`);
      return response.data;
    },
  }),
  updateRow: defineProcedure({
    input: z.object({
      sheetId: z.number(),
      rowId: z.number(),
      data: NewRowSchema.partial(),
    }),
    output: RowSchema,
    action: async ({ input }) => {
      // TODO.
      const response = await smartsheetFetcher.put(`/sheets/${input.sheetId}/rows`, {
        id: input.rowId,
        ...input.data,
      });
      const updatedRows = response.data?.result;
      if (!updatedRows) {
        throw new Error('Failed to create the row.');
      }
      if (Array.isArray(updatedRows)) {
        return updatedRows[0];
      }
      return updatedRows;
    },
  }),
  updateRows: defineProcedure({
    input: z.object({
      sheetId: z.number(),
      rows: z.array(NewRowSchema.partial().merge(z.object({
        id: z.number(),
      }))),
    }),
    output: RowSchema.array(),
    action: async ({ input }) => {
      // TODO.
      const response = await smartsheetFetcher.put(`/sheets/${input.sheetId}/rows`, input.rows);
      const updatedRows = response.data?.result;
      if (!updatedRows || !Array.isArray(updatedRows)) {
        throw new Error('Failed to create the row.');
      }
      return updatedRows;
    },
  }),
};