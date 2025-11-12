import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticker } = params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker is required' },
        { status: 400 }
      );
    }

    // Find assets with this ticker for the user
    const assets = await prisma.asset.findMany({
      where: {
        userId: session.user.id,
        ticker,
      },
      select: {
        id: true,
      },
    });

    if (assets.length === 0) {
      return NextResponse.json(
        { error: 'No assets found with this ticker' },
        { status: 404 }
      );
    }

    // Get price history for the first matching asset
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const priceHistory = await prisma.priceHistory.findMany({
      where: {
        assetId: assets[0].id,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
      select: {
        price: true,
        date: true,
      },
    });

    return NextResponse.json({
      ticker,
      history: priceHistory.map((h: { price: any; date: Date }) => ({
        price: Number(h.price),
        date: h.date.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Price history fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch price history',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
