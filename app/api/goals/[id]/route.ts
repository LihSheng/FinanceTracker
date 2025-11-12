import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateGoalSchema } from '@/lib/validations/goal';
import { enrichGoalWithCalculations } from '@/lib/utils/goal-calculations';

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
      include: {
        contributions: {
          orderBy: {
            date: 'desc',
          },
        },
        assets: {
          select: {
            id: true,
            name: true,
            ticker: true,
            currentPrice: true,
            buyPrice: true,
            units: true,
            currency: true,
            purchaseDate: true,
          },
        },
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    const enrichedGoal = enrichGoalWithCalculations(goal);

    return NextResponse.json({
      ...enrichedGoal,
      contributions: goal.contributions,
      assets: goal.assets,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Verify goal ownership
    const existingGoal = await prisma.goal.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateGoalSchema.parse(body);

    const updateData: any = {};
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.targetAmount !== undefined) updateData.targetAmount = validatedData.targetAmount;
    if (validatedData.currentAmount !== undefined) updateData.currentAmount = validatedData.currentAmount;
    if (validatedData.currency !== undefined) updateData.currency = validatedData.currency;
    if (validatedData.targetDate !== undefined) {
      updateData.targetDate = validatedData.targetDate ? new Date(validatedData.targetDate) : null;
    }
    if (validatedData.monthlyContribution !== undefined) {
      updateData.monthlyContribution = validatedData.monthlyContribution;
    }
    if (validatedData.expectedReturn !== undefined) {
      updateData.expectedReturn = validatedData.expectedReturn;
    }

    const goal = await prisma.goal.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        contributions: {
          orderBy: {
            date: 'desc',
          },
        },
        assets: true,
      },
    });

    const enrichedGoal = enrichGoalWithCalculations(goal);

    return NextResponse.json({
      ...enrichedGoal,
      contributions: goal.contributions,
      assets: goal.assets,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify goal ownership
    const existingGoal = await prisma.goal.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    await prisma.goal.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(
      { message: 'Goal deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
