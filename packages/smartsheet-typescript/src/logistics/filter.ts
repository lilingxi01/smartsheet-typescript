import { z } from 'zod';

export const SmartsheetFilterOptionsSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  includeAll: z.boolean().optional(),
});
export type SmartsheetFilterOptions = z.infer<typeof SmartsheetFilterOptionsSchema>;
