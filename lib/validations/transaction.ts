import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["income", "expense"], {
    message: "Type must be either income or expense",
  }),
  description: z.string().min(1, "Description is required"),
  date: z.string().or(z.date()),
  categoryId: z.string().optional().nullable(),
});

export const updateTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive").optional(),
  type: z.enum(["income", "expense"]).optional(),
  description: z.string().min(1, "Description is required").optional(),
  date: z.string().or(z.date()).optional(),
  categoryId: z.string().optional().nullable(),
});

export const transactionFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(["income", "expense"]).optional(),
  sortBy: z.enum(["date", "amount", "description"]).optional().default("date"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
