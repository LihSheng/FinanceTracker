import { z } from 'zod';

export const journalEntrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  emotionTags: z.array(z.string()).default([]),
  tradeType: z.enum(['buy', 'sell', 'hold']).optional(),
  outcome: z.enum(['success', 'failure', 'neutral']).optional(),
  date: z.string().or(z.date()),
  assetId: z.string().optional(),
});

export const updateJournalEntrySchema = journalEntrySchema.partial();

export const journalSearchSchema = z.object({
  search: z.string().optional(),
  emotionTag: z.string().optional(),
  tradeType: z.enum(['buy', 'sell', 'hold']).optional(),
  outcome: z.enum(['success', 'failure', 'neutral']).optional(),
  assetId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>;
export type JournalSearchParams = z.infer<typeof journalSearchSchema>;
