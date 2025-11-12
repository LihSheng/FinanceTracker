import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { convertCurrency, SUPPORTED_CURRENCIES, type Currency } from '@/lib/utils/currency';

/**
 * GET /api/currencies/convert
 * Convert amount between currencies
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const amount = parseFloat(searchParams.get('amount') || '0');
    const fromCurrency = searchParams.get('from') as Currency;
    const toCurrency = searchParams.get('to') as Currency;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!fromCurrency || !toCurrency) {
      return NextResponse.json(
        { error: 'Missing from or to currency' },
        { status: 400 }
      );
    }

    if (
      !SUPPORTED_CURRENCIES.includes(fromCurrency) ||
      !SUPPORTED_CURRENCIES.includes(toCurrency)
    ) {
      return NextResponse.json(
        { error: 'Invalid currency' },
        { status: 400 }
      );
    }

    const convertedAmount = await convertCurrency(amount, fromCurrency, toCurrency);

    return NextResponse.json({
      amount,
      fromCurrency,
      toCurrency,
      convertedAmount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    return NextResponse.json(
      { error: 'Failed to convert currency' },
      { status: 500 }
    );
  }
}
