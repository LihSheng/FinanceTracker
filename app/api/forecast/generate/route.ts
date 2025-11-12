import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generateForecast,
  validateForecastParameters,
  ForecastParameters,
} from '@/lib/utils/forecasting';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, parameters, saveToDatabase } = body as {
      name?: string;
      parameters: ForecastParameters;
      saveToDatabase?: boolean;
    };

    // Validate parameters
    const validation = validateForecastParameters(parameters);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.errors },
        { status: 400 }
      );
    }

    // Fetch historical transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'asc' },
    });

    // Calculate current balance
    const currentBalance = transactions.reduce((sum, t) => {
      return sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount));
    }, 0);

    // Get current portfolio value if exists
    const assets = await prisma.asset.findMany({
      where: { userId: session.user.id },
    });

    const currentPortfolioValue = assets.reduce((sum, asset) => {
      const currentPrice = asset.currentPrice || asset.buyPrice;
      return sum + Number(asset.units) * Number(currentPrice);
    }, 0);

    // Generate forecast
    const forecastResult = generateForecast(
      transactions,
      currentBalance,
      parameters,
      currentPortfolioValue > 0 ? currentPortfolioValue : undefined
    );

    // Save to database if requested
    let savedForecast = null;
    if (saveToDatabase) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + parameters.periodMonths);

      savedForecast = await prisma.forecast.create({
        data: {
          userId: session.user.id,
          name: name || `Forecast ${new Date().toLocaleDateString()}`,
          startDate,
          endDate,
          projectedData: forecastResult as any,
          parameters: parameters as any,
        },
      });
    }

    return NextResponse.json({
      forecast: forecastResult,
      savedForecast,
    });
  } catch (error) {
    console.error('Error generating forecast:', error);
    return NextResponse.json(
      { error: 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}
