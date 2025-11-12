'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

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
  priceHistory: Array<{
    id: string;
    price: number;
    date: string;
  }>;
}

export default function AssetDetailView() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAsset();
    }
  }, [params.id]);

  const fetchAsset = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/portfolio/assets/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAsset(data);
      } else {
        alert('Asset not found');
        router.push('/dashboard/portfolio');
      }
    } catch (error) {
      console.error('Error fetching asset:', error);
      alert('Failed to fetch asset');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (!asset) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: asset.currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!asset) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" onClick={() => router.push('/dashboard/portfolio')}>
            ← Back to Portfolio
          </Button>
          <h1 className="text-3xl font-bold mt-2">{asset.name}</h1>
          {asset.ticker && <p className="text-gray-600">Ticker: {asset.ticker}</p>}
        </div>
      </div>

      {/* Asset Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Current Value</p>
          <p className="text-2xl font-bold">{formatCurrency(asset.currentValue)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Invested Value</p>
          <p className="text-2xl font-bold">{formatCurrency(asset.investedValue)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Unrealized P/L</p>
          <p
            className={`text-2xl font-bold ${
              asset.unrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(asset.unrealizedGain)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Return</p>
          <p
            className={`text-2xl font-bold ${
              asset.unrealizedGainPercent >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {asset.unrealizedGainPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Asset Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Asset Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Platform</p>
            <p className="font-medium">{asset.platform}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Asset Type</p>
            <p className="font-medium capitalize">{asset.assetType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Units</p>
            <p className="font-medium">{asset.units.toFixed(8)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Buy Price</p>
            <p className="font-medium">{formatCurrency(asset.buyPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Price</p>
            <p className="font-medium">
              {formatCurrency(asset.currentPrice || asset.buyPrice)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Currency</p>
            <p className="font-medium">{asset.currency}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Purchase Date</p>
            <p className="font-medium">{formatDate(asset.purchaseDate)}</p>
          </div>
          {asset.goal && (
            <div>
              <p className="text-sm text-gray-600">Linked Goal</p>
              <p className="font-medium text-blue-600">{asset.goal.name}</p>
            </div>
          )}
        </div>
        {asset.notes && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Notes</p>
            <p className="font-medium">{asset.notes}</p>
          </div>
        )}
      </div>

      {/* Price History */}
      {asset.priceHistory && asset.priceHistory.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Price History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {asset.priceHistory.map((history) => (
                  <tr key={history.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(history.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(history.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
