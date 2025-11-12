'use client';

import { useEffect, useState } from 'react';

interface RebalancingRecommendation {
  assetClass: string;
  currentAllocation: number;
  targetAllocation: number;
  difference: number;
  suggestedAction: string;
  estimatedImpact: string;
}

export default function RebalancingRecommendations() {
  const [recommendations, setRecommendations] = useState<RebalancingRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const url = refresh ? '/api/insights/rebalancing?refresh=true' : '/api/insights/rebalancing';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={() => fetchRecommendations()}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const getDifferenceColor = (difference: number) => {
    const abs = Math.abs(difference);
    if (abs > 15) return 'text-red-600';
    if (abs > 10) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const getImpactBadge = (impact: string) => {
    if (impact.includes('High')) {
      return 'bg-red-100 text-red-700';
    }
    if (impact.includes('Moderate')) {
      return 'bg-orange-100 text-orange-700';
    }
    if (impact.includes('diversification')) {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Rebalancing Recommendations</h2>
        <button
          onClick={() => fetchRecommendations(true)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>Your portfolio is well balanced!</p>
          <p className="mt-2 text-sm">No rebalancing needed at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-medium capitalize">{rec.assetClass}</h3>
                  <p className="mt-1 text-sm text-gray-600">{rec.suggestedAction}</p>
                </div>
                <span className={`font-semibold ${getDifferenceColor(rec.difference)}`}>
                  {rec.difference > 0 ? '+' : ''}
                  {rec.difference.toFixed(1)}%
                </span>
              </div>

              <div className="mb-3 flex gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Current:</span>
                  <span className="ml-1 font-medium">{rec.currentAllocation.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Target:</span>
                  <span className="ml-1 font-medium">{rec.targetAllocation.toFixed(1)}%</span>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex h-3 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="bg-blue-600"
                    style={{ width: `${rec.currentAllocation}%` }}
                  ></div>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span className="text-gray-400">Target: {rec.targetAllocation}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getImpactBadge(rec.estimatedImpact)}`}>
                  {rec.estimatedImpact}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> These recommendations are based on a balanced portfolio strategy. 
            Adjust according to your risk tolerance and investment goals.
          </p>
        </div>
      )}
    </div>
  );
}
