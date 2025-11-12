import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get('budgetId');
    const date = searchParams.get('date') ? new Date(searchParams.get('date')!) : new Date();

    if (!budgetId) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 });
    }

    // Get budget with categories
    const budget = await prisma.budget.findUnique({
      where: {
        id: budgetId,
        userId: session.user.id,
      },
      include: {
        categories: true,
      },
    });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // Determine the period to analyze
    let startDate: Date;
    let endDate: Date;

    if (budget.period === 'monthly') {
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
    } else {
      // For yearly budgets, use the budget's date range
      startDate = new Date(budget.startDate);
      endDate = budget.endDate ? new Date(budget.endDate) : endOfMonth(date);
    }

    // Get transactions for each category
    const comparison = await Promise.all(
      budget.categories.map(async (category: any) => {
        const transactions = await prisma.transaction.findMany({
          where: {
            userId: session.user.id,
            categoryId: category.id,
            type: 'expense',
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        const actualSpent = transactions.reduce(
          (sum: number, t: any) => sum + Number(t.amount),
          0
        );

        const budgeted = Number(category.allocatedAmount);
        const remaining = budgeted - actualSpent;
        const percentageUsed = budgeted > 0 ? (actualSpent / budgeted) * 100 : 0;
        const isOverBudget = actualSpent > budgeted;

        return {
          categoryId: category.id,
          categoryName: category.name,
          budgeted,
          actualSpent,
          remaining,
          percentageUsed,
          isOverBudget,
          color: category.color,
        };
      })
    );

    // Calculate totals
    const totalBudgeted = comparison.reduce((sum: number, c) => sum + c.budgeted, 0);
    const totalSpent = comparison.reduce((sum: number, c) => sum + c.actualSpent, 0);
    const totalRemaining = totalBudgeted - totalSpent;

    return NextResponse.json({
      budgetId: budget.id,
      budgetName: budget.name,
      period: budget.period,
      startDate,
      endDate,
      comparison,
      totals: {
        budgeted: totalBudgeted,
        spent: totalSpent,
        remaining: totalRemaining,
        percentageUsed: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching budget comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget comparison' },
      { status: 500 }
    );
  }
}
