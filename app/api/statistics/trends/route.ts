import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // month, 3months, 6months, year
    const granularity = searchParams.get('granularity') || 'day'; // day, month

    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case '3months':
        startDate = subMonths(endDate, 3);
        break;
      case '6months':
        startDate = subMonths(endDate, 6);
        break;
      case 'year':
        startDate = subMonths(endDate, 12);
        break;
      default:
        startDate = subMonths(endDate, 1);
    }

    // Get all transactions in the period
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Generate date intervals
    let intervals: Date[];
    let dateFormat: string;

    if (granularity === 'month') {
      intervals = eachMonthOfInterval({ start: startDate, end: endDate });
      dateFormat = 'yyyy-MM';
    } else {
      intervals = eachDayOfInterval({ start: startDate, end: endDate });
      dateFormat = 'yyyy-MM-dd';
    }

    // Group transactions by interval
    const trends = intervals.map(intervalDate => {
      const dateKey = format(intervalDate, dateFormat);
      
      let intervalStart: Date;
      let intervalEnd: Date;

      if (granularity === 'month') {
        intervalStart = startOfMonth(intervalDate);
        intervalEnd = endOfMonth(intervalDate);
      } else {
        intervalStart = startOfDay(intervalDate);
        intervalEnd = endOfDay(intervalDate);
      }

      const intervalTransactions = transactions.filter((t: any) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= intervalStart && transactionDate <= intervalEnd;
      });

      const income = intervalTransactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

      const expenses = intervalTransactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

      return {
        date: dateKey,
        income,
        expenses,
        net: income - expenses,
      };
    });

    return NextResponse.json({
      trends,
      period,
      granularity,
    });
  } catch (error) {
    console.error('Error fetching spending trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spending trends' },
      { status: 500 }
    );
  }
}
