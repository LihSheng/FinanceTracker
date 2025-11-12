import { generateStructuredInsights } from './gemini';
import { prisma } from '@/lib/prisma';

export interface AIInsight {
  type: 'summary' | 'rebalancing' | 'risk' | 'opportunity';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  relatedData?: any;
}

export interface FinancialHealthScore {
  overall: number;
  components: {
    liquidityRatio: number;
    diversificationScore: number;
    savingsRate: number;
    debtToIncomeRatio: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

export interface RebalancingRecommendation {
  assetClass: string;
  currentAllocation: number;
  targetAllocation: number;
  difference: number;
  suggestedAction: string;
  estimatedImpact: string;
}

export async function generateFinancialHealthScore(
  userId: string
): Promise<FinancialHealthScore> {
  // Fetch user data
  const [assets, transactions, goals] = await Promise.all([
    prisma.asset.findMany({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 90, // Last 90 days
    }),
    prisma.goal.findMany({ where: { userId } }),
  ]);

  // Calculate metrics
  const totalAssets = assets.reduce((sum: number, asset: any) => {
    const currentValue = (asset.currentPrice || asset.buyPrice) * Number(asset.units);
    return sum + currentValue;
  }, 0);

  const cashAssets = assets
    .filter((a: any) => a.assetType === 'cash')
    .reduce((sum: number, asset: any) => sum + Number(asset.buyPrice) * Number(asset.units), 0);

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const recentTransactions = transactions.filter((t: any) => t.date >= last30Days);
  const totalIncome = recentTransactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const totalExpenses = recentTransactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const liquidityRatio = totalIncome > 0 ? (cashAssets / totalIncome) * 100 : 0;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Calculate diversification score
  const assetTypeCount = new Set(assets.map((a: any) => a.assetType)).size;
  const platformCount = new Set(assets.map((a: any) => a.platform)).size;
  const diversificationScore = Math.min(
    ((assetTypeCount * 20 + platformCount * 10) / 100) * 100,
    100
  );

  // Debt to income (placeholder - would need debt data)
  const debtToIncomeRatio = 0;

  const components = {
    liquidityRatio: Math.min(liquidityRatio, 100),
    diversificationScore,
    savingsRate: Math.max(0, Math.min(savingsRate, 100)),
    debtToIncomeRatio,
  };

  const overall = Math.round(
    (components.liquidityRatio * 0.25 +
      components.diversificationScore * 0.3 +
      components.savingsRate * 0.35 +
      (100 - components.debtToIncomeRatio) * 0.1)
  );

  // Generate AI recommendations
  const prompt = `Analyze this financial health data and provide 3-5 specific, actionable recommendations:
  
Overall Score: ${overall}/100
Liquidity Ratio: ${components.liquidityRatio.toFixed(1)}%
Diversification Score: ${components.diversificationScore.toFixed(1)}%
Savings Rate: ${components.savingsRate.toFixed(1)}%
Total Assets: $${totalAssets.toFixed(2)}
Monthly Income: $${totalIncome.toFixed(2)}
Monthly Expenses: $${totalExpenses.toFixed(2)}
Number of Goals: ${goals.length}

Provide recommendations as a JSON array of strings.`;

  const schema = `["recommendation 1", "recommendation 2", ...]`;

  let recommendations: string[] = [];
  try {
    recommendations = await generateStructuredInsights<string[]>(prompt, schema);
  } catch (error) {
    // Fallback recommendations
    recommendations = [
      'Continue monitoring your spending patterns',
      'Consider diversifying your investment portfolio',
      'Review your financial goals regularly',
    ];
  }

  // Determine trend (would need historical data)
  const trend = 'stable';

  return {
    overall,
    components,
    trend,
    recommendations,
  };
}

export async function generateRebalancingRecommendations(
  userId: string
): Promise<RebalancingRecommendation[]> {
  const assets = await prisma.asset.findMany({ where: { userId } });

  if (assets.length === 0) {
    return [];
  }

  // Calculate current allocation
  const totalValue = assets.reduce((sum: number, asset: any) => {
    const currentValue = (asset.currentPrice || asset.buyPrice) * Number(asset.units);
    return sum + currentValue;
  }, 0);

  const allocationByType = assets.reduce((acc: Record<string, number>, asset: any) => {
    const currentValue = (asset.currentPrice || asset.buyPrice) * Number(asset.units);
    const percentage = (currentValue / totalValue) * 100;
    acc[asset.assetType] = (acc[asset.assetType] || 0) + percentage;
    return acc;
  }, {} as Record<string, number>);

  // Define target allocations (could be user-configurable)
  const targetAllocations: Record<string, number> = {
    stock: 40,
    crypto: 10,
    gold: 10,
    cash: 30,
    other: 10,
  };

  const recommendations: RebalancingRecommendation[] = [];

  for (const [assetClass, currentAllocation] of Object.entries(allocationByType)) {
    const targetAllocation = targetAllocations[assetClass] || 10;
    const currentAlloc = currentAllocation as number;
    const difference = currentAlloc - targetAllocation;

    if (Math.abs(difference) > 5) {
      // Only recommend if difference > 5%
      const action =
        difference > 0
          ? `Reduce ${assetClass} allocation by ${Math.abs(difference).toFixed(1)}%`
          : `Increase ${assetClass} allocation by ${Math.abs(difference).toFixed(1)}%`;

      const impact =
        Math.abs(difference) > 15
          ? 'High impact on portfolio balance'
          : Math.abs(difference) > 10
          ? 'Moderate impact on portfolio balance'
          : 'Low impact on portfolio balance';

      recommendations.push({
        assetClass,
        currentAllocation: Math.round(currentAlloc * 10) / 10,
        targetAllocation,
        difference: Math.round(difference * 10) / 10,
        suggestedAction: action,
        estimatedImpact: impact,
      });
    }
  }

  // Check for missing asset classes
  for (const [assetClass, targetAllocation] of Object.entries(targetAllocations)) {
    if (!allocationByType[assetClass]) {
      recommendations.push({
        assetClass,
        currentAllocation: 0,
        targetAllocation,
        difference: -targetAllocation,
        suggestedAction: `Consider adding ${assetClass} to your portfolio (target: ${targetAllocation}%)`,
        estimatedImpact: 'Improves diversification',
      });
    }
  }

  return recommendations.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
}

export async function generateAIInsights(userId: string): Promise<AIInsight[]> {
  const [assets, transactions, goals, healthScore] = await Promise.all([
    prisma.asset.findMany({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 90,
    }),
    prisma.goal.findMany({ where: { userId } }),
    generateFinancialHealthScore(userId),
  ]);

  const totalAssets = assets.reduce((sum: number, asset: any) => {
    const currentValue = (asset.currentPrice || asset.buyPrice) * Number(asset.units);
    return sum + currentValue;
  }, 0);

  const totalIncome = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const totalExpenses = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const assetTypes = Array.from(new Set(assets.map((a: any) => a.assetType)));
  
  const prompt = `As a financial advisor, analyze this user's financial situation and provide 3-5 specific insights:

Portfolio Value: $${totalAssets.toFixed(2)}
Number of Assets: ${assets.length}
Asset Types: ${assetTypes.join(', ')}
Recent Income (90 days): $${totalIncome.toFixed(2)}
Recent Expenses (90 days): $${totalExpenses.toFixed(2)}
Savings Rate: ${healthScore.components.savingsRate.toFixed(1)}%
Financial Health Score: ${healthScore.overall}/100
Active Goals: ${goals.length}

Provide insights about spending patterns, investment opportunities, risks, or portfolio optimization.`;

  const schema = `[
  {
    "type": "summary" | "rebalancing" | "risk" | "opportunity",
    "title": "string",
    "message": "string",
    "priority": "high" | "medium" | "low",
    "actionable": boolean
  }
]`;

  try {
    const insights = await generateStructuredInsights<AIInsight[]>(prompt, schema);
    return insights;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    // Return fallback insights
    return [
      {
        type: 'summary',
        title: 'Financial Overview',
        message: `Your portfolio is valued at $${totalAssets.toFixed(2)} with a financial health score of ${healthScore.overall}/100.`,
        priority: 'medium',
        actionable: false,
      },
    ];
  }
}
