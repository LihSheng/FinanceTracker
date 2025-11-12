import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createContributionSchema } from '@/lib/validations/goal';

export async function POST(
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

    const body = await request.json();
    const validatedData = createContributionSchema.parse(body);

    // Create contribution and update goal's current amount in a transaction
    const [contribution, updatedGoal] = await prisma.$transaction([
      prisma.goalContribution.create({
        data: {
          goalId: params.id,
          amount: validatedData.amount,
          date: new Date(validatedData.date),
          notes: validatedData.notes,
        },
      }),
      prisma.goal.update({
        where: {
          id: params.id,
        },
        data: {
          currentAmount: {
            increment: validatedData.amount,
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        contribution,
        updatedGoal: {
          id: updatedGoal.id,
          currentAmount: updatedGoal.currentAmount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contribution:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create contribution' },
      { status: 500 }
    );
  }
}

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

    // Verify goal ownership
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

    const contributions = await prisma.goalContribution.findMany({
      where: {
        goalId: params.id,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(contributions);
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}
