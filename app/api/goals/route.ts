import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createGoalSchema } from '@/lib/validations/goal';
import { enrichGoalWithCalculations } from '@/lib/utils/goal-calculations';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        contributions: {
          orderBy: {
            date: 'desc',
          },
          take: 5,
        },
        assets: {
          select: {
            id: true,
            name: true,
            currentPrice: true,
            units: true,
            currency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Enrich goals with calculations
    const enrichedGoals = goals.map((goal: any) => {
      const enriched = enrichGoalWithCalculations(goal);
      return {
        ...enriched,
        contributions: goal.contributions,
        assets: goal.assets,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      };
    });

    return NextResponse.json(enrichedGoals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createGoalSchema.parse(body);

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        category: validatedData.category,
        targetAmount: validatedData.targetAmount,
        currentAmount: validatedData.currentAmount,
        currency: validatedData.currency,
        targetDate: validatedData.targetDate ? new Date(validatedData.targetDate) : null,
        monthlyContribution: validatedData.monthlyContribution ?? null,
        expectedReturn: validatedData.expectedReturn ?? null,
      },
      include: {
        contributions: true,
        assets: true,
      },
    });

    const enrichedGoal = enrichGoalWithCalculations(goal);

    return NextResponse.json(
      {
        ...enrichedGoal,
        contributions: goal.contributions,
        assets: goal.assets,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating goal:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
