'use client';

import { useState } from 'react';
import Button from '../ui/Button';

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

interface AssetCardProps {
  asset: Asset;
  onUpdate: () => void;
}

export default function AssetCard({ asset, onUpdate }: AssetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/portfolio/assets/${asset.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      } else {
        alert('Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: asset.currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const assetTypeColors: Record<string, string> = {
    stock: 'bg-blue-100 text-blue-800',
    crypto: 'bg-purple-100 text-purple-800',
    gold: 'bg-yellow-100 text-yellow-800',
    cash: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{asset.name}</h3>
            {asset.ticker && (
              <span className="text-sm text-gray-500">({asset.ticker})</span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <span
              className={`text-xs px-2 py-1 rounded ${
                assetTypeColors[asset.assetType] || assetTypeColors.other
              }`}
            >
              {asset.assetType}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
              {asset.platform}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Units:</span>
          <span className="font-medium">{asset.units.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Buy Price:</span>
          <span className="font-medium">{formatCurrency(asset.buyPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current Price:</span>
          <span className="font-medium">
            {formatCurrency(asset.currentPrice || asset.buyPrice)}
          </span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-gray-600">Current Value:</span>
          <span className="font-semibold">{formatCurrency(asset.currentValue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">P/L:</span>
          <span
            className={`font-semibold ${
              asset.unrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(asset.unrealizedGain)} ({asset.unrealizedGainPercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {asset.goal && (
        <div className="mb-4 p-2 bg-blue-50 rounded text-sm">
          <span className="text-gray-600">Goal: </span>
          <span className="font-medium text-blue-700">{asset.goal.name}</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => (window.location.href = `/dashboard/portfolio/${asset.id}`)}
        >
          View Details
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={handleDelete}
          isLoading={isDeleting}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
