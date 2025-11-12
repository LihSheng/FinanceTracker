import { z } from 'zod';

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100),
  category: z.string().min(1, 'Category is required'),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().min(0, 'Current amount cannot be negative').optional().default(0),
  currency: z.enum(['MYR', 'SGD', 'USD']).default('MYR'),
  targetDate: z.string().datetime().optional(),
  monthlyContribution: z.number().positive('Monthly contribution must be positive').optional(),
  expectedReturn: z.number().min(0).max(100, 'Expected return must be between 0 and 100').optional(),
});

export const updateGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  currentAmount: z.number().min(0).optional(),
  currency: z.enum(['MYR', 'SGD', 'USD']).optional(),
  targetDate: z.string().datetime().optional().nullable(),
  monthlyContribution: z.number().positive().optional().nullable(),
  expectedReturn: z.number().min(0).max(100).optional().nullable(),
});

export const createContributionSchema = z.object({
  amount: z.number().positive('Contribution amount must be positive'),
  date: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CreateContributionInput = z.infer<typeof createContributionSchema>;
