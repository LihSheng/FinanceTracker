import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SUPPORTED_CURRENCIES, type Currency } from '@/lib/utils/currency';

/**
 * GET /api/currencies/history
 * Get historical exchange rates
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fromCurrency = searchParams.get('from') as Currency;
    const toCurrency = searchParams.get('to') as Currency;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    const whereClause: any = {
      fromCurrency,
      toCurrency,
    };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate);
      }
    }

    const rates = await prisma.exchangeRate.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc',
      },
      select: {
        rate: true,
        date: true,
      },
    });

    return NextResponse.json({
      fromCurrency,
      toCurrency,
      rates: rates.map((r: { rate: any; date: Date }) => ({
        rate: r.rate.toNumber(),
        date: r.date.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical rates' },
      { status: 500 }
    );
  }
}
