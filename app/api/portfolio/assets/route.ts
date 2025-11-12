import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { assetSchema } from '@/lib/validations/asset';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const assetType = searchParams.get('assetType');
    const goalId = searchParams.get('goalId');

    const where: any = {
      userId: session.user.id,
      ...(platform && { platform }),
      ...(assetType && { assetType }),
      ...(goalId && { goalId }),
    };

    const assets = await prisma.asset.findMany({
      where,
      include: {
        goal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        purchaseDate: 'desc',
      },
    });

    // Calculate unrealized gain for each asset
    const assetsWithGains = assets.map((asset: any) => {
      const currentPrice = asset.currentPrice?.toNumber() || asset.buyPrice.toNumber();
      const buyPrice = asset.buyPrice.toNumber();
      const units = asset.units.toNumber();
      
      const currentValue = currentPrice * units;
      const investedValue = buyPrice * units;
      const unrealizedGain = currentValue - investedValue;
      const unrealizedGainPercent = (unrealizedGain / investedValue) * 100;

      return {
        ...asset,
        units: asset.units.toNumber(),
        buyPrice: asset.buyPrice.toNumber(),
        currentPrice: asset.currentPrice?.toNumber() || null,
        unrealizedGain,
        unrealizedGainPercent,
        currentValue,
        investedValue,
      };
    });

    return NextResponse.json(assetsWithGains);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = assetSchema.parse(body);

    const asset = await prisma.asset.create({
      data: {
        userId: session.user.id,
        platform: validatedData.platform,
        assetType: validatedData.assetType,
        ticker: validatedData.ticker,
        name: validatedData.name,
        units: validatedData.units,
        buyPrice: validatedData.buyPrice,
        currentPrice: validatedData.currentPrice,
        currency: validatedData.currency,
        purchaseDate: new Date(validatedData.purchaseDate),
        notes: validatedData.notes,
        goalId: validatedData.goalId,
      },
      include: {
        goal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create initial price history entry
    if (asset.currentPrice) {
      await prisma.priceHistory.create({
        data: {
          assetId: asset.id,
          price: asset.currentPrice,
          date: new Date(),
        },
      });
    }

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}
