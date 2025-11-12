import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  calculateProjectedCompletionDate,
  calculateGoalProgress,
  calculateRemainingAmount,
  isGoalOnTrack,
  calculateMonthsRemaining,
} from '@/lib/utils/goal-calculations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const goal = await prisma.goal.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    const currentAmount = Number(goal.currentAmount);
    const targetAmount = Number(goal.targetAmount);
    const monthlyContribution = goal.monthlyContribution ? Number(goal.monthlyContribution) : null;
    const expectedReturn = goal.expectedReturn ? Number(goal.expectedReturn) : null;

    const progressPercent = calculateGoalProgress(currentAmount, targetAmount);
    const remainingAmount = calculateRemainingAmount(currentAmount, targetAmount);
    const projectedCompletionDate = calculateProjectedCompletionDate(
      currentAmount,
      targetAmount,
      monthlyContribution,
      expectedReturn
    );
    const monthsRemaining = calculateMonthsRemaining(goal.targetDate);
    const onTrack = isGoalOnTrack(
      currentAmount,
      targetAmount,
      goal.targetDate,
      projectedCompletionDate
    );

    // Generate monthly projection data
    const projectionData = [];
    if (monthlyContribution && monthlyContribution > 0) {
      const annualReturn = expectedReturn ? expectedReturn / 100 : 0;
      const monthlyReturn = annualReturn / 12;
      
      let projectedAmount = currentAmount;
      const maxMonths = 120; // 10 years max
      const today = new Date();

      for (let month = 0; month <= maxMonths && projectedAmount < targetAmount; month++) {
        const projectionDate = new Date(today);
        projectionDate.setMonth(projectionDate.getMonth() + month);

        projectionData.push({
          month,
          date: projectionDate.toISOString(),
          projectedAmount: Math.round(projectedAmount * 100) / 100,
          contributions: month * monthlyContribution,
          growth: Math.round((projectedAmount - currentAmount - (month * monthlyContribution)) * 100) / 100,
        });

        if (projectedAmount < targetAmount) {
          projectedAmount = projectedAmount * (1 + monthlyReturn) + monthlyContribution;
        }
      }
    }

    return NextResponse.json({
      goalId: goal.id,
      currentAmount,
      targetAmount,
      progressPercent,
      remainingAmount,
      projectedCompletionDate,
      monthsRemaining,
      onTrack,
      monthlyContribution,
      expectedReturn,
      projectionData,
    });
  } catch (error) {
    console.error('Error calculating projection:', error);
    return NextResponse.json(
      { error: 'Failed to calculate projection' },
      { status: 500 }
    );
  }
}
