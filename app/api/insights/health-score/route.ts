import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateFinancialHealthScore } from '@/lib/ai/insights';
import { getCachedHealthScore, setCachedHealthScore } from '@/lib/ai/cache';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Check cache first
    if (!forceRefresh) {
      const cached = getCachedHealthScore(session.user.id);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    const healthScore = await generateFinancialHealthScore(session.user.id);

    // Cache for 1 hour
    setCachedHealthScore(session.user.id, healthScore, 60);

    return NextResponse.json(healthScore);
  } catch (error) {
    console.error('Error fetching health score:', error);
    return NextResponse.json(
      { error: 'Failed to generate health score' },
      { status: 500 }
    );
  }
}
