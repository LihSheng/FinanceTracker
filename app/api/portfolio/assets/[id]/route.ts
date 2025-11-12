import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateAssetSchema } from '@/lib/validations/asset';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const asset = await prisma.asset.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        goal: {
          select: {
            id: true,
            name: true,
          },
        },
        priceHistory: {
          orderBy: {
            date: 'desc',
          },
          take: 30,
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const currentPrice = asset.currentPrice?.toNumber() || asset.buyPrice.toNumber();
    const buyPrice = asset.buyPrice.toNumber();
    const units = asset.units.toNumber();
    
    const currentValue = currentPrice * units;
    const investedValue = buyPrice * units;
    const unrealizedGain = currentValue - investedValue;
    const unrealizedGainPercent = (unrealizedGain / investedValue) * 100;

    return NextResponse.json({
      ...asset,
      units: asset.units.toNumber(),
      buyPrice: asset.buyPrice.toNumber(),
      currentPrice: asset.currentPrice?.toNumber() || null,
      unrealizedGain,
      unrealizedGainPercent,
      currentValue,
      investedValue,
      priceHistory: asset.priceHistory.map((ph: any) => ({
        ...ph,
        price: ph.price.toNumber(),
      })),
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateAssetSchema.parse(body);

    // Check if asset exists and belongs to user
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const updateData: any = {
      ...(validatedData.platform && { platform: validatedData.platform }),
      ...(validatedData.assetType && { assetType: validatedData.assetType }),
      ...(validatedData.ticker !== undefined && { ticker: validatedData.ticker }),
      ...(validatedData.name && { name: validatedData.name }),
      ...(validatedData.units !== undefined && { units: validatedData.units }),
      ...(validatedData.buyPrice !== undefined && { buyPrice: validatedData.buyPrice }),
      ...(validatedData.currentPrice !== undefined && { currentPrice: validatedData.currentPrice }),
      ...(validatedData.currency && { currency: validatedData.currency }),
      ...(validatedData.purchaseDate && { purchaseDate: new Date(validatedData.purchaseDate) }),
      ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
      ...(validatedData.goalId !== undefined && { goalId: validatedData.goalId }),
    };

    const asset = await prisma.asset.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        goal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Add price history if current price was updated
    if (validatedData.currentPrice !== undefined && validatedData.currentPrice !== existingAsset.currentPrice?.toNumber()) {
      await prisma.priceHistory.create({
        data: {
          assetId: asset.id,
          price: validatedData.currentPrice,
          date: new Date(),
        },
      });
    }

    return NextResponse.json(asset);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.error('Error updating asset:', error);
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if asset exists and belongs to user
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    await prisma.asset.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
