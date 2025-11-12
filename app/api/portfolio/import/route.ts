import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { csvImportSchema } from '@/lib/validations/asset';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = csvImportSchema.parse(body);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
    };

    for (let i = 0; i < validatedData.data.length; i++) {
      const row = validatedData.data[i];
      
      try {
        // Validate asset type
        const validAssetTypes = ['stock', 'crypto', 'gold', 'cash', 'other'];
        if (!validAssetTypes.includes(row.assetType)) {
          throw new Error(`Invalid asset type: ${row.assetType}`);
        }

        // Validate currency
        const validCurrencies = ['MYR', 'SGD', 'USD'];
        if (!validCurrencies.includes(row.currency)) {
          throw new Error(`Invalid currency: ${row.currency}`);
        }

        // Parse numeric values
        const units = typeof row.units === 'string' ? parseFloat(row.units) : row.units;
        const buyPrice = typeof row.buyPrice === 'string' ? parseFloat(row.buyPrice) : row.buyPrice;
        const currentPrice = row.currentPrice 
          ? (typeof row.currentPrice === 'string' ? parseFloat(row.currentPrice) : row.currentPrice)
          : undefined;

        if (isNaN(units) || units <= 0) {
          throw new Error('Invalid units value');
        }

        if (isNaN(buyPrice) || buyPrice <= 0) {
          throw new Error('Invalid buy price value');
        }

        if (currentPrice !== undefined && (isNaN(currentPrice) || currentPrice <= 0)) {
          throw new Error('Invalid current price value');
        }

        // Parse date
        const purchaseDate = new Date(row.purchaseDate);
        if (isNaN(purchaseDate.getTime())) {
          throw new Error('Invalid purchase date');
        }

        // Create asset
        const asset = await prisma.asset.create({
          data: {
            userId: session.user.id,
            platform: row.platform,
            assetType: row.assetType,
            ticker: row.ticker || null,
            name: row.name,
            units,
            buyPrice,
            currentPrice,
            currency: row.currency,
            purchaseDate,
            notes: row.notes || null,
          },
        });

        // Create initial price history if current price exists
        if (currentPrice) {
          await prisma.priceHistory.create({
            data: {
              assetId: asset.id,
              price: currentPrice,
              date: new Date(),
            },
          });
        }

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      message: `Import completed: ${results.success} successful, ${results.failed} failed`,
      results,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.error('Error importing assets:', error);
    return NextResponse.json(
      { error: 'Failed to import assets' },
      { status: 500 }
    );
  }
}
