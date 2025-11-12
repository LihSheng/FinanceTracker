import { z } from 'zod';

export const assetSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  assetType: z.enum(['stock', 'crypto', 'gold', 'cash', 'other'], {
    errorMap: () => ({ message: 'Invalid asset type' }),
  }),
  ticker: z.string().optional(),
  name: z.string().min(1, 'Asset name is required'),
  units: z.number().positive('Units must be positive'),
  buyPrice: z.number().positive('Buy price must be positive'),
  currentPrice: z.number().positive('Current price must be positive').optional(),
  currency: z.enum(['MYR', 'SGD', 'USD'], {
    errorMap: () => ({ message: 'Invalid currency' }),
  }),
  purchaseDate: z.string().or(z.date()),
  notes: z.string().optional(),
  goalId: z.string().optional(),
});

export const updateAssetSchema = assetSchema.partial();

export const csvImportSchema = z.object({
  data: z.array(
    z.object({
      platform: z.string(),
      assetType: z.string(),
      ticker: z.string().optional(),
      name: z.string(),
      units: z.string().or(z.number()),
      buyPrice: z.string().or(z.number()),
      currentPrice: z.string().or(z.number()).optional(),
      currency: z.string(),
      purchaseDate: z.string(),
      notes: z.string().optional(),
    })
  ),
});

export type AssetInput = z.infer<typeof assetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type CSVImportInput = z.infer<typeof csvImportSchema>;
