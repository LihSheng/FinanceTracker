'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ForecastProjection } from '@/lib/utils/forecasting';

interface ForecastChartProps {
  projections: ForecastProjection[];
  historicalData?: Array<{
    date: string;
    income: number;
    expenses: number;
    balance: number;
  }>;
}

export function ForecastChart({
  projections,
  historicalData = [],
}: ForecastChartProps) {
  // Combine historical and projected data
  const chartData = [
    ...historicalData.map((d) => ({
      date: new Date(d.date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      income: d.income,
      expenses: d.expenses,
      balance: d.balance,
      type: 'historical',
    })),
    ...projections.map((p) => ({
      date: new Date(p.date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      projectedIncome: p.projectedIncome,
      projectedExpenses: p.projectedExpenses,
      projectedBalance: p.projectedBalance,
      projectedPortfolioValue: p.projectedPortfolioValue,
      type: 'projected',
    })),
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forecast Projection</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <Legend />

            {/* Historical data */}
            {historicalData.length > 0 && (
              <>
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Historical Income"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Historical Expenses"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Historical Balance"
                  dot={false}
                />
              </>
            )}

            {/* Projected data */}
            <Line
              type="monotone"
              dataKey="projectedIncome"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Projected Income"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="projectedExpenses"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Projected Expenses"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="projectedBalance"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Projected Balance"
              dot={false}
            />

            {projections[0]?.projectedPortfolioValue && (
              <Line
                type="monotone"
                dataKey="projectedPortfolioValue"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Projected Portfolio"
                dot={false}
              />
            )}

            {/* Reference line at zero */}
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500" />
            <span>Solid lines: Historical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500 border-dashed border-t-2" />
            <span>Dashed lines: Projected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
