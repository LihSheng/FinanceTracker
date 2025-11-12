import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const date = searchParams.get('date') ? new Date(searchParams.get('date')!) : new Date();

    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'month':
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
        break;
      case 'year':
        startDate = startOfYear(date);
        endDate = endOfYear(date);
        break;
      default:
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
    }

    // Get transactions grouped by category
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    // Calculate category breakdown
    const categoryMap = new Map<string, { 
      categoryId: string;
      categoryName: string;
      amount: number;
      color?: string;
    }>();

    let totalAmount = 0;

    transactions.forEach((transaction: any) => {
      if (transaction.type === 'expense') {
        const categoryId = transaction.categoryId || 'uncategorized';
        const categoryName = transaction.category?.name || 'Uncategorized';
        const color = transaction.category?.color;
        const amount = Number(transaction.amount);

        if (categoryMap.has(categoryId)) {
          const existing = categoryMap.get(categoryId)!;
          existing.amount += amount;
        } else {
          categoryMap.set(categoryId, {
            categoryId,
            categoryName,
            amount,
            color,
          });
        }

        totalAmount += amount;
      }
    });

    // Convert to array and add percentages
    const categoryBreakdown = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      percentage: totalAmount > 0 ? (cat.amount / totalAmount) * 100 : 0,
    }));

    // Sort by amount descending
    categoryBreakdown.sort((a, b) => b.amount - a.amount);

    return NextResponse.json({
      categoryBreakdown,
      totalAmount,
    });
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category breakdown' },
      { status: 500 }
    );
  }
}
