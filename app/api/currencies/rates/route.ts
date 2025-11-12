import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllRatesForCurrency, SUPPORTED_CURRENCIES, type Currency } from '@/lib/utils/currency';

/**
 * GET /api/currencies/rates
 * Get current exchange rates for a base currency
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const baseCurrency = (searchParams.get('base') || 'MYR') as Currency;

    if (!SUPPORTED_CURRENCIES.includes(baseCurrency)) {
      return NextResponse.json(
        { error: 'Invalid base currency' },
        { status: 400 }
      );
    }

    const rates = await getAllRatesForCurrency(baseCurrency);

    return NextResponse.json({
      baseCurrency,
      rates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    );
  }
}
