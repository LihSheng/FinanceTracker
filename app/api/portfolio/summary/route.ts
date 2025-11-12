import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getLatestExchangeRate, type Currency } from '@/lib/utils/currency';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const baseCurrency = (searchParams.get('currency') || 'MYR') as Currency;

    // Fetch all assets for the user
    const assets = await prisma.asset.findMany({
      where: {
        userId: session.user.id,
      },
    });

    if (assets.length === 0) {
      return NextResponse.json({
        totalNetWorth: 0,
        totalInvested: 0,
        unrealizedGain: 0,
        unrealizedGainPercent: 0,
        currency: baseCurrency,
        assetClassBreakdown: [],
        currencyExposure: [],
        platformDistribution: [],
      });
    }

    // Helper function to convert currency using our utility
    const convertToBase = async (amount: number, fromCurrency: string): Promise<number> => {
      if (fromCurrency === baseCurrency) return amount;
      
      try {
        const rate = await getLatestExchangeRate(fromCurrency as Currency, baseCurrency);
        return amount * rate;
      } catch (error) {
        console.error(`Failed to convert ${fromCurrency} to ${baseCurrency}:`, error);
        return amount; // Fallback to original amount
      }
    };

    let totalNetWorth = 0;
    let totalInvested = 0;

    const assetClassMap: Record<string, { value: number; count: number }> = {};
    const currencyMap: Record<string, number> = {};
    const platformMap: Record<string, { value: number; count: number }> = {};

    // Process assets with async currency conversion
    for (const asset of assets) {
      const currentPrice = asset.currentPrice?.toNumber() || asset.buyPrice.toNumber();
      const buyPrice = asset.buyPrice.toNumber();
      const units = asset.units.toNumber();
      
      const currentValue = currentPrice * units;
      const investedValue = buyPrice * units;

      // Convert to base currency
      const currentValueBase = await convertToBase(currentValue, asset.currency);
      const investedValueBase = await convertToBase(investedValue, asset.currency);

      totalNetWorth += currentValueBase;
      totalInvested += investedValueBase;

      // Asset class breakdown
      if (!assetClassMap[asset.assetType]) {
        assetClassMap[asset.assetType] = { value: 0, count: 0 };
      }
      assetClassMap[asset.assetType].value += currentValueBase;
      assetClassMap[asset.assetType].count += 1;

      // Currency exposure
      if (!currencyMap[asset.currency]) {
        currencyMap[asset.currency] = 0;
      }
      currencyMap[asset.currency] += currentValueBase;

      // Platform distribution
      if (!platformMap[asset.platform]) {
        platformMap[asset.platform] = { value: 0, count: 0 };
      }
      platformMap[asset.platform].value += currentValueBase;
      platformMap[asset.platform].count += 1;
    }

    const unrealizedGain = totalNetWorth - totalInvested;
    const unrealizedGainPercent = totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0;

    // Format breakdowns
    const assetClassBreakdown = Object.entries(assetClassMap).map(([assetType, data]) => ({
      assetType,
      value: data.value,
      percentage: (data.value / totalNetWorth) * 100,
      count: data.count,
    }));

    const currencyExposure = Object.entries(currencyMap).map(([currency, value]) => ({
      currency,
      value,
      percentage: (value / totalNetWorth) * 100,
    }));

    const platformDistribution = Object.entries(platformMap).map(([platform, data]) => ({
      platform,
      value: data.value,
      percentage: (data.value / totalNetWorth) * 100,
      assetCount: data.count,
    }));

    return NextResponse.json({
      totalNetWorth,
      totalInvested,
      unrealizedGain,
      unrealizedGainPercent,
      currency: baseCurrency,
      assetClassBreakdown,
      currencyExposure,
      platformDistribution,
    });
  } catch (error) {
    console.error('Error calculating portfolio summary:', error);
    return NextResponse.json(
      { error: 'Failed to calculate portfolio summary' },
      { status: 500 }
    );
  }
}
