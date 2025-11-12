import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const forecasts = await prisma.forecast.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
    });

    return NextResponse.json(forecasts);
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forecasts' },
      { status: 500 }
    );
  }
}
