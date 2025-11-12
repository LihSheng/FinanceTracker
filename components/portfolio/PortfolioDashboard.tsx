'use client';

import { useEffect, useState } from 'react';
import AssetCard from '@/components/portfolio/AssetCard';
import { PriceSyncButton } from '@/components/portfolio/PriceSyncButton';
import { CurrencyToggle } from '@/components/ui/currency-toggle';
import { ExchangeRateWidget } from '@/components/ui/exchange-rate-widget';
import { Currency } from '@/lib/utils/currency';

interface PortfolioSummary {
  totalNetWorth: number;
  totalInvested: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  currency: string;
  assetClassBreakdown: Array<{
    assetType: string;
    value: number;
    percentage: number;
    count: number;
  }>;
  currencyExposure: Array<{
    currency: string;
    value: number;
    percentage: number;
  }>;
  platformDistribution: Array<{
    platform: string;
    value: number;
    percentage: number;
    assetCount: number;
  }>;
}

interface Asset {
  id: string;
  platform: string;
  assetType: string;
  ticker?: string;
  name: string;
  units: number;
  buyPrice: number;
  currentPrice?: number;
  currency: string;
  purchaseDate: string;
  notes?: string;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  currentValue: number;
  investedValue: number;
  goal?: {
    id: string;
    name: string;
  };
}

export default function PortfolioDashboard() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<Currency>('MYR');

  useEffect(() => {
    fetchData();
  }, [currency]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, assetsRes] = await Promise.all([
        fetch(`/api/portfolio/summary?currency=${currency}`),
        fetch('/api/portfolio/assets'),
      ]);

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }

      if (assetsRes.ok) {
        const assetsData = await assetsRes.json();
        setAssets(assetsData);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Currency Toggle and Price Sync */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <div className="flex gap-4 items-center">
          <PriceSyncButton
            onSyncComplete={(result) => {
              console.log('Sync completed:', result);
              fetchData(); // Refresh data after sync
            }}
          />
          <CurrencyToggle value={currency} onChange={setCurrency} />
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Net Worth</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalNetWorth)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Invested Capital</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalInvested)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Unrealized P/L</p>
            <p
              className={`text-2xl font-bold ${
                summary.unrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(summary.unrealizedGain)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Return</p>
            <p
              className={`text-2xl font-bold ${
                summary.unrealizedGainPercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {summary.unrealizedGainPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {/* Breakdown Charts and Exchange Rate Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Asset Class Breakdown */}
        {summary && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Asset Class</h3>
            <div className="space-y-2">
              {summary.assetClassBreakdown.map((item) => (
                <div key={item.assetType}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{item.assetType}</span>
                    <span>{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Currency Exposure */}
        {summary && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Currency Exposure</h3>
            <div className="space-y-2">
              {summary.currencyExposure.map((item) => (
                <div key={item.currency}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.currency}</span>
                    <span>{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform Distribution */}
        {summary && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
            <div className="space-y-2">
              {summary.platformDistribution.map((item) => (
                <div key={item.platform}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.platform}</span>
                    <span>{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exchange Rate Widget */}
        <ExchangeRateWidget baseCurrency={currency} />
      </div>

      {/* Assets List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Assets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} onUpdate={fetchData} />
          ))}
        </div>
        {assets.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No assets yet. Add your first asset to get started.
          </p>
        )}
      </div>
    </div>
  );
}
