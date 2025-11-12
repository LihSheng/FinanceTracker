import { z } from 'zod';

// Alert condition schemas for different alert types
export const priceAlertConditionSchema = z.object({
  ticker: z.string().min(1),
  threshold: z.number().positive(),
  direction: z.enum(['above', 'below']),
});

export const exchangeRateAlertConditionSchema = z.object({
  currencyPair: z.string().regex(/^[A-Z]{3}\/[A-Z]{3}$/),
  threshold: z.number().positive(),
  direction: z.enum(['above', 'below']),
});

export const milestoneAlertConditionSchema = z.object({
  goalId: z.string().cuid(),
  milestonePercent: z.number().min(0).max(100),
});

export const allocationDriftAlertConditionSchema = z.object({
  driftPercent: z.number().min(0).max(100),
  assetType: z.string().optional(),
});

export const billReminderAlertConditionSchema = z.object({
  billName: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  reminderDaysBefore: z.number().int().min(0).default(3),
});

export const createAlertSchema = z.object({
  type: z.enum(['price', 'exchange_rate', 'milestone', 'allocation_drift', 'bill_reminder']),
  condition: z.union([
    priceAlertConditionSchema,
    exchangeRateAlertConditionSchema,
    milestoneAlertConditionSchema,
    allocationDriftAlertConditionSchema,
    billReminderAlertConditionSchema,
  ]),
  isActive: z.boolean().default(true),
});

export const updateAlertSchema = z.object({
  type: z.enum(['price', 'exchange_rate', 'milestone', 'allocation_drift', 'bill_reminder']).optional(),
  condition: z.union([
    priceAlertConditionSchema,
    exchangeRateAlertConditionSchema,
    milestoneAlertConditionSchema,
    allocationDriftAlertConditionSchema,
    billReminderAlertConditionSchema,
  ]).optional(),
  isActive: z.boolean().optional(),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
