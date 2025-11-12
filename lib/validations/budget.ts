import { z } from "zod";

export const budgetCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  allocatedAmount: z.number().positive("Amount must be positive"),
  color: z.string().optional(),
});

export const createBudgetSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  totalAmount: z.number().positive("Total amount must be positive"),
  period: z.enum(["monthly", "yearly"], {
    message: "Period must be either monthly or yearly",
  }),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  categories: z.array(budgetCategorySchema).min(1, "At least one category is required"),
});

export const updateBudgetSchema = z.object({
  name: z.string().min(1, "Budget name is required").optional(),
  totalAmount: z.number().positive("Total amount must be positive").optional(),
  period: z.enum(["monthly", "yearly"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional().nullable(),
});

export const updateBudgetCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").optional(),
  allocatedAmount: z.number().positive("Amount must be positive").optional(),
  color: z.string().optional().nullable(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type BudgetCategoryInput = z.infer<typeof budgetCategorySchema>;
export type UpdateBudgetCategoryInput = z.infer<typeof updateBudgetCategorySchema>;
