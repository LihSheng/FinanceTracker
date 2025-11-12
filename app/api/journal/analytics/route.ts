import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all journal entries with asset data
    const entries = await prisma.journalEntry.findMany({
      where: { userId: session.user.id },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            ticker: true,
            buyPrice: true,
            currentPrice: true,
            units: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const totalEntries = entries.length;

    // Calculate emotion distribution
    const emotionCount: Record<string, number> = {};
    entries.forEach((entry: any) => {
      entry.emotionTags.forEach((emotion: string) => {
        emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
      });
    });

    const emotionDistribution = Object.entries(emotionCount).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: totalEntries > 0 ? (count / totalEntries) * 100 : 0,
    }));

    // Calculate success rate by emotion
    const emotionOutcomes: Record<string, { success: number; failure: number; neutral: number; total: number }> = {};
    
    entries.forEach((entry: any) => {
      if (entry.outcome) {
        entry.emotionTags.forEach((emotion: string) => {
          if (!emotionOutcomes[emotion]) {
            emotionOutcomes[emotion] = { success: 0, failure: 0, neutral: 0, total: 0 };
          }
          emotionOutcomes[emotion][entry.outcome as 'success' | 'failure' | 'neutral']++;
          emotionOutcomes[emotion].total++;
        });
      }
    });

    const successRateByEmotion = Object.entries(emotionOutcomes).map(([emotion, outcomes]) => ({
      emotion,
      successRate: outcomes.total > 0 ? (outcomes.success / outcomes.total) * 100 : 0,
      failureRate: outcomes.total > 0 ? (outcomes.failure / outcomes.total) * 100 : 0,
      neutralRate: outcomes.total > 0 ? (outcomes.neutral / outcomes.total) * 100 : 0,
      totalTrades: outcomes.total,
    }));

    // Calculate average return by emotion
    const emotionReturns: Record<string, { totalReturn: number; count: number }> = {};
    
    entries.forEach((entry: any) => {
      if (entry.asset && entry.asset.buyPrice && entry.asset.currentPrice) {
        const buyPrice = parseFloat(entry.asset.buyPrice.toString());
        const currentPrice = parseFloat(entry.asset.currentPrice.toString());
        const returnPercent = ((currentPrice - buyPrice) / buyPrice) * 100;

        entry.emotionTags.forEach((emotion: string) => {
          if (!emotionReturns[emotion]) {
            emotionReturns[emotion] = { totalReturn: 0, count: 0 };
          }
          emotionReturns[emotion].totalReturn += returnPercent;
          emotionReturns[emotion].count++;
        });
      }
    });

    const averageReturnByEmotion = Object.entries(emotionReturns).map(([emotion, data]) => ({
      emotion,
      avgReturn: data.count > 0 ? data.totalReturn / data.count : 0,
      tradeCount: data.count,
    }));

    // Calculate trade type distribution
    const tradeTypeCount: Record<string, number> = {
      buy: 0,
      sell: 0,
      hold: 0,
    };

    entries.forEach((entry: any) => {
      if (entry.tradeType) {
        tradeTypeCount[entry.tradeType]++;
      }
    });

    const tradeTypeDistribution = Object.entries(tradeTypeCount).map(([type, count]) => ({
      type,
      count,
      percentage: totalEntries > 0 ? (count / totalEntries) * 100 : 0,
    }));

    // Calculate outcome distribution
    const outcomeCount: Record<string, number> = {
      success: 0,
      failure: 0,
      neutral: 0,
      pending: 0,
    };

    entries.forEach((entry: any) => {
      if (entry.outcome) {
        outcomeCount[entry.outcome]++;
      } else {
        outcomeCount.pending++;
      }
    });

    const outcomeDistribution = Object.entries(outcomeCount).map(([outcome, count]) => ({
      outcome,
      count,
      percentage: totalEntries > 0 ? (count / totalEntries) * 100 : 0,
    }));

    // Get recent entries
    const recentEntries = entries.slice(0, 5).map((entry: any) => ({
      id: entry.id,
      title: entry.title,
      date: entry.date,
      emotionTags: entry.emotionTags,
      tradeType: entry.tradeType,
      outcome: entry.outcome,
      assetName: entry.asset?.name,
    }));

    return NextResponse.json({
      totalEntries,
      emotionDistribution,
      successRateByEmotion,
      averageReturnByEmotion,
      tradeTypeDistribution,
      outcomeDistribution,
      recentEntries,
    });
  } catch (error) {
    console.error('Error fetching journal analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal analytics' },
      { status: 500 }
    );
  }
}
