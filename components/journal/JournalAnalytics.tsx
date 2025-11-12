'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, BookOpen, Target } from 'lucide-react';

interface JournalAnalyticsProps {
  analytics: {
    totalEntries: number;
    emotionDistribution: Array<{
      emotion: string;
      count: number;
      percentage: number;
    }>;
    successRateByEmotion: Array<{
      emotion: string;
      successRate: number;
      failureRate: number;
      neutralRate: number;
      totalTrades: number;
    }>;
    averageReturnByEmotion: Array<{
      emotion: string;
      avgReturn: number;
      tradeCount: number;
    }>;
    tradeTypeDistribution: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    outcomeDistribution: Array<{
      outcome: string;
      count: number;
      percentage: number;
    }>;
  };
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function JournalAnalytics({ analytics }: JournalAnalyticsProps) {
  const topEmotions = analytics.emotionDistribution.slice(0, 6);
  const topSuccessRates = analytics.successRateByEmotion
    .filter((e) => e.totalTrades >= 3)
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 5);

  const topReturns = analytics.averageReturnByEmotion
    .filter((e) => e.tradeCount >= 3)
    .sort((a, b) => b.avgReturn - a.avgReturn)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEntries}</div>
          </CardContent>
        </Card>

        {analytics.outcomeDistribution.map((outcome) => {
          if (outcome.outcome === 'pending') return null;
          const Icon = outcome.outcome === 'success' ? TrendingUp : outcome.outcome === 'failure' ? TrendingDown : Target;
          const color = outcome.outcome === 'success' ? 'text-green-600' : outcome.outcome === 'failure' ? 'text-red-600' : 'text-gray-600';
          
          return (
            <Card key={outcome.outcome}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">{outcome.outcome}</CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{outcome.count}</div>
                <p className="text-xs text-muted-foreground">
                  {outcome.percentage.toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Emotion Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Emotion Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topEmotions}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.emotion} (${entry.percentage.toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {topEmotions.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Success Rate by Emotion */}
      {topSuccessRates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Success Rate by Emotion</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing emotions with at least 3 trades
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSuccessRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="emotion" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="successRate" fill="#10b981" name="Success %" />
                <Bar dataKey="failureRate" fill="#ef4444" name="Failure %" />
                <Bar dataKey="neutralRate" fill="#6b7280" name="Neutral %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Average Return by Emotion */}
      {topReturns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Average Return by Emotion</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing emotions with at least 3 trades
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topReturns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="emotion" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                <Legend />
                <Bar dataKey="avgReturn" fill="#3b82f6" name="Avg Return %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Trade Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.tradeTypeDistribution.map((trade) => (
              <div key={trade.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {trade.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {trade.count} trades
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {trade.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topSuccessRates.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Best performing emotion:</span>{' '}
                  <Badge variant="secondary">{topSuccessRates[0].emotion}</Badge> with{' '}
                  {topSuccessRates[0].successRate.toFixed(1)}% success rate
                </p>
              </div>
            )}
            {topReturns.length > 0 && topReturns[0].avgReturn > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Highest average return:</span>{' '}
                  <Badge variant="secondary">{topReturns[0].emotion}</Badge> with{' '}
                  {topReturns[0].avgReturn.toFixed(2)}% average return
                </p>
              </div>
            )}
            {analytics.totalEntries < 10 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm">
                  Keep journaling! More entries will provide better insights into your trading patterns.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
