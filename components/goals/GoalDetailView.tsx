'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, TrendingUp, Calendar, DollarSign, Target } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';
import Badge from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

interface Contribution {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

interface Asset {
  id: string;
  name: string;
  ticker?: string;
  currentPrice?: number;
  buyPrice: number;
  units: number;
  currency: string;
  purchaseDate: string;
}

interface GoalDetailViewProps {
  goal: {
    id: string;
    name: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    currency: string;
    targetDate: Date | null;
    monthlyContribution: number | null;
    expectedReturn: number | null;
    progressPercent: number;
    remainingAmount: number;
    projectedCompletionDate: Date | null;
    isOnTrack: boolean;
    monthsRemaining: number | null;
  };
  contributions: Contribution[];
  assets: Asset[];
  onAddContribution: () => void;
}

export function GoalDetailView({
  goal,
  contributions,
  assets,
  onAddContribution,
}: GoalDetailViewProps) {
  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || goal.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalFromAssets = assets.reduce((sum, asset) => {
    const value = (asset.currentPrice || asset.buyPrice) * asset.units;
    return sum + value;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{goal.name}</h1>
          <p className="text-muted-foreground mt-1">{goal.category}</p>
        </div>
        <Badge variant={goal.isOnTrack ? 'default' : 'destructive'} className="text-sm">
          {goal.isOnTrack ? 'On Track' : 'Behind Schedule'}
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{goal.progressPercent}%</span>
            </div>
            <Progress value={goal.progressPercent} className="h-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Current Amount</p>
              <p className="text-xl font-bold">{formatCurrency(goal.currentAmount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Target Amount</p>
              <p className="text-xl font-bold">{formatCurrency(goal.targetAmount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-xl font-bold text-orange-600">
                {formatCurrency(goal.remainingAmount)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">From Assets</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(totalFromAssets)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline & Projections */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goal.targetDate && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Target Date</span>
                <span className="font-medium">
                  {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
            {goal.monthsRemaining !== null && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Months Remaining</span>
                <span className="font-medium">{goal.monthsRemaining} months</span>
              </div>
            )}
            {goal.projectedCompletionDate && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Projected Completion</span>
                <span className="font-medium">
                  {format(new Date(goal.projectedCompletionDate), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Savings Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goal.monthlyContribution && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monthly Contribution</span>
                <span className="font-medium">
                  {formatCurrency(goal.monthlyContribution)}
                </span>
              </div>
            )}
            {goal.expectedReturn && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Expected Return</span>
                <span className="font-medium">{goal.expectedReturn}% p.a.</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Contributions</span>
              <span className="font-medium">
                {contributions.length} contribution{contributions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contribution History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contribution History</CardTitle>
            <Button onClick={onAddContribution} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Contribution
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {contributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No contributions yet</p>
              <p className="text-sm">Start tracking your progress by adding contributions</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell>
                      {format(new Date(contribution.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(contribution.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contribution.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Linked Assets */}
      {assets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Linked Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Buy Price</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => {
                  const currentValue = (asset.currentPrice || asset.buyPrice) * asset.units;
                  return (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          {asset.ticker && (
                            <p className="text-xs text-muted-foreground">{asset.ticker}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{asset.units}</TableCell>
                      <TableCell>{formatCurrency(asset.buyPrice, asset.currency)}</TableCell>
                      <TableCell>
                        {asset.currentPrice
                          ? formatCurrency(asset.currentPrice, asset.currency)
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(currentValue, asset.currency)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
