import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateAIInsights } from '@/lib/ai/insights';
import { getCachedInsights, setCachedInsights } from '@/lib/ai/cache';

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
      const cached = getCachedInsights(session.user.id);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    const insights = await generateAIInsights(session.user.id);

    // Cache for 1 hour
    setCachedInsights(session.user.id, insights, 60);

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    );
  }
}
