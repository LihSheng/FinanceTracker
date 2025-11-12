'use client';

import { useEffect, useState } from 'react';

interface AIInsight {
  type: 'summary' | 'rebalancing' | 'risk' | 'opportunity';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export default function InsightsDashboard() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const url = refresh ? '/api/insights/summary?refresh=true' : '/api/insights/summary';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      
      const data = await response.json();
      setInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded bg-gray-200"></div>
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
          onClick={() => fetchInsights()}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'summary':
        return '📊';
      case 'rebalancing':
        return '⚖️';
      case 'risk':
        return '⚠️';
      case 'opportunity':
        return '💡';
      default:
        return '📌';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'summary':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'rebalancing':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'risk':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'opportunity':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">AI Insights</h2>
          <p className="mt-1 text-sm text-gray-600">
            Personalized recommendations based on your financial data
          </p>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Refresh Insights
        </button>
      </div>

      {insights.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>No insights available yet.</p>
          <p className="mt-2 text-sm">Add more financial data to get personalized insights.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`rounded-lg border p-4 ${getTypeColor(insight.type)}`}
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(insight.type)}</span>
                  <div>
                    <h3 className="font-medium">{insight.title}</h3>
                    <span className="text-xs capitalize text-gray-600">{insight.type}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getPriorityBadge(insight.priority)}`}
                  >
                    {insight.priority}
                  </span>
                  {insight.actionable && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                      Actionable
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm leading-relaxed">{insight.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <p className="text-xs text-gray-600">
          <strong>Powered by AI:</strong> These insights are generated using advanced AI analysis 
          of your financial data. Always consult with a financial advisor for major decisions.
        </p>
      </div>
    </div>
  );
}
