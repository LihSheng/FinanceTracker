import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { priceService } from '@/lib/market-data';

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
    const assetType = searchParams.get('assetType') || 'stock';
    const currency = searchParams.get('currency') || 'USD';

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker is required' },
        { status: 400 }
      );
    }

    const priceData = await priceService.getPrice(
      ticker,
      assetType as 'stock' | 'crypto' | 'gold' | 'cash',
      currency
    );

    if (!priceData) {
      return NextResponse.json(
        { error: 'Price not found', ticker },
        { status: 404 }
      );
    }

    return NextResponse.json(priceData);
  } catch (error) {
    console.error('Price fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch price',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
