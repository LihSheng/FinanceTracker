'use client';

import { useEffect, useState } from 'react';

interface FinancialHealthScore {
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

export default function FinancialHealthScore() {
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthScore = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const url = refresh ? '/api/insights/health-score?refresh=true' : '/api/insights/health-score';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch health score');
      }
      
      const data = await response.json();
      setHealthScore(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthScore();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-gray-200"></div>
          <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto"></div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-full rounded bg-gray-200"></div>
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
          onClick={() => fetchHealthScore()}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!healthScore) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return '↗';
    if (trend === 'declining') return '↘';
    return '→';
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Financial Health Score</h2>
        <button
          onClick={() => fetchHealthScore(true)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Overall Score */}
      <div className="mb-8 text-center">
        <div
          className={`mx-auto flex h-32 w-32 items-center justify-center rounded-full ${getScoreBgColor(healthScore.overall)}`}
        >
          <div>
            <div className={`text-4xl font-bold ${getScoreColor(healthScore.overall)}`}>
              {healthScore.overall}
            </div>
            <div className="text-sm text-gray-600">/ 100</div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">Trend:</span>
          <span className="text-lg">{getTrendIcon(healthScore.trend)}</span>
          <span className="text-sm capitalize text-gray-600">{healthScore.trend}</span>
        </div>
      </div>

      {/* Component Scores */}
      <div className="mb-6 space-y-4">
        <h3 className="font-medium text-gray-700">Components</h3>
        
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Liquidity Ratio</span>
            <span className="font-medium">{healthScore.components.liquidityRatio.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${Math.min(healthScore.components.liquidityRatio, 100)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Diversification Score</span>
            <span className="font-medium">{healthScore.components.diversificationScore.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-purple-600"
              style={{ width: `${Math.min(healthScore.components.diversificationScore, 100)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Savings Rate</span>
            <span className="font-medium">{healthScore.components.savingsRate.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-green-600"
              style={{ width: `${Math.min(healthScore.components.savingsRate, 100)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Debt to Income</span>
            <span className="font-medium">{healthScore.components.debtToIncomeRatio.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-orange-600"
              style={{ width: `${Math.min(healthScore.components.debtToIncomeRatio, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {healthScore.recommendations.length > 0 && (
        <div>
          <h3 className="mb-3 font-medium text-gray-700">Recommendations</h3>
          <ul className="space-y-2">
            {healthScore.recommendations.map((rec, index) => (
              <li key={index} className="flex gap-2 text-sm text-gray-600">
                <span className="text-blue-600">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
