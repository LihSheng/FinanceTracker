import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateRebalancingRecommendations } from '@/lib/ai/insights';
import { getCachedRebalancing, setCachedRebalancing } from '@/lib/ai/cache';

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
      const cached = getCachedRebalancing(session.user.id);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    const recommendations = await generateRebalancingRecommendations(session.user.id);

    // Cache for 1 hour
    setCachedRebalancing(session.user.id, recommendations, 60);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error generating rebalancing recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate rebalancing recommendations' },
      { status: 500 }
    );
  }
}
