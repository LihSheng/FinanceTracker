'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ForecastResult } from '@/lib/utils/forecasting';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/Alert';

interface ForecastSummaryProps {
  forecast: ForecastResult;
}

export function ForecastSummary({ forecast }: ForecastSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const isNegativeTrend = forecast.finalBalance < 0;
  const savingsRate =
    forecast.averageMonthlyIncome > 0
      ? ((forecast.averageMonthlyIncome - forecast.averageMonthlyExpenses) /
          forecast.averageMonthlyIncome) *
        100
      : 0;

  return (
    <div className="space-y-4">
      {forecast.hasInsufficientData && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Limited historical data available. Forecast accuracy may be reduced.
            Consider adding more transaction history for better projections.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Monthly Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(forecast.averageMonthlyIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Monthly Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(forecast.averageMonthlyExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projected Final Balance
            </CardTitle>
            <DollarSign
              className={`h-4 w-4 ${
                isNegativeTrend ? 'text-red-600' : 'text-green-600'
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                isNegativeTrend ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {formatCurrency(forecast.finalBalance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <TrendingUp
              className={`h-4 w-4 ${
                savingsRate > 20 ? 'text-green-600' : 'text-yellow-600'
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {savingsRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Forecast Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Projected Income
              </p>
              <p className="text-lg font-semibold">
                {formatCurrency(forecast.totalProjectedIncome)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Projected Expenses
              </p>
              <p className="text-lg font-semibold">
                {formatCurrency(forecast.totalProjectedExpenses)}
              </p>
            </div>
          </div>

          {isNegativeTrend && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Warning: Your projected balance is negative. Consider reducing
                expenses or increasing income to avoid financial difficulties.
              </AlertDescription>
            </Alert>
          )}

          {!isNegativeTrend && savingsRate < 10 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your savings rate is below 10%. Consider increasing your savings
                to build a stronger financial cushion.
              </AlertDescription>
            </Alert>
          )}

          {!isNegativeTrend && savingsRate >= 20 && (
            <Alert className="border-green-200 bg-green-50">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Great job! Your savings rate is healthy. Keep up the good work!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
