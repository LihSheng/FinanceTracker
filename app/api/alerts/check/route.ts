import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkAlertCondition, createNotification } from '@/lib/utils/alert-checker';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch all active alerts for the user
    const alerts = await prisma.alert.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    const triggeredAlerts = [];

    for (const alert of alerts) {
      const condition = alert.condition as any;
      const isTriggered = await checkAlertCondition(
        user.id,
        alert.type,
        condition
      );

      if (isTriggered) {
        // Create notification
        const relatedId = condition.goalId || condition.ticker || null;
        await createNotification(user.id, alert.type, condition, relatedId);

        // Update lastTriggered timestamp
        await prisma.alert.update({
          where: { id: alert.id },
          data: { lastTriggered: new Date() },
        });

        triggeredAlerts.push(alert);
      }
    }

    return NextResponse.json({
      message: 'Alert check completed',
      triggeredCount: triggeredAlerts.length,
      triggeredAlerts,
    });
  } catch (error) {
    console.error('Error checking alerts:', error);
    return NextResponse.json(
      { error: 'Failed to check alerts' },
      { status: 500 }
    );
  }
}
