import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { priceService } from '@/lib/market-data';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get optional asset IDs from request body
    const body = await request.json().catch(() => ({}));
    const assetIds: string[] | undefined = body.assetIds;

    // Fetch user's assets
    const assets = await prisma.asset.findMany({
      where: {
        userId: session.user.id,
        ...(assetIds && assetIds.length > 0 ? { id: { in: assetIds } } : {}),
        ticker: { not: null },
        assetType: { in: ['stock', 'crypto', 'gold'] },
      },
      select: {
        id: true,
        ticker: true,
        assetType: true,
        currency: true,
        currentPrice: true,
      },
    });

    if (assets.length === 0) {
      return NextResponse.json({
        message: 'No assets to sync',
        updated: 0,
        failed: 0,
      });
    }

    const results = {
      updated: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Fetch prices for all assets
    const pricePromises = assets.map(async (asset: { id: string; ticker: string | null; assetType: string; currency: string }) => {
      if (!asset.ticker) return;

      try {
        const priceData = await priceService.getPrice(
          asset.ticker,
          asset.assetType as 'stock' | 'crypto' | 'gold',
          asset.currency
        );

        if (priceData) {
          // Update asset current price
          await prisma.asset.update({
            where: { id: asset.id },
            data: { currentPrice: priceData.price },
          });

          // Create price history record
          await prisma.priceHistory.create({
            data: {
              assetId: asset.id,
              price: priceData.price,
              date: new Date(),
            },
          });

          results.updated++;
        } else {
          results.failed++;
          results.errors.push(`Failed to fetch price for ${asset.ticker}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Error updating ${asset.ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });

    await Promise.all(pricePromises);

    return NextResponse.json({
      message: 'Price sync completed',
      updated: results.updated,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Price sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync prices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
