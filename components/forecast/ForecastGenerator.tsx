'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

function Label({ htmlFor, children, className = '' }: { htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium leading-none ${className}`}>
      {children}
    </label>
  );
}
import { ForecastParameters, PlannedExpense } from '@/lib/utils/forecasting';
import { Plus, Trash2 } from 'lucide-react';

interface ForecastGeneratorProps {
  onGenerate: (parameters: ForecastParameters, name?: string) => void;
  isLoading?: boolean;
}

export function ForecastGenerator({
  onGenerate,
  isLoading = false,
}: ForecastGeneratorProps) {
  const [periodMonths, setPeriodMonths] = useState<number>(6);
  const [expectedIncomeChange, setExpectedIncomeChange] = useState<number>(0);
  const [expectedReturn, setExpectedReturn] = useState<number>(0);
  const [forecastName, setForecastName] = useState<string>('');
  const [plannedExpenses, setPlannedExpenses] = useState<PlannedExpense[]>([]);

  const handleAddPlannedExpense = () => {
    setPlannedExpenses([
      ...plannedExpenses,
      {
        name: '',
        amount: 0,
        date: new Date(),
      },
    ]);
  };

  const handleRemovePlannedExpense = (index: number) => {
    setPlannedExpenses(plannedExpenses.filter((_, i) => i !== index));
  };

  const handlePlannedExpenseChange = (
    index: number,
    field: keyof PlannedExpense,
    value: string | number | Date
  ) => {
    const updated = [...plannedExpenses];
    updated[index] = { ...updated[index], [field]: value };
    setPlannedExpenses(updated);
  };

  const handleGenerate = () => {
    const parameters: ForecastParameters = {
      periodMonths,
      expectedIncomeChange: expectedIncomeChange || undefined,
      expectedReturn: expectedReturn || undefined,
      plannedExpenses:
        plannedExpenses.length > 0 ? plannedExpenses : undefined,
    };

    onGenerate(parameters, forecastName || undefined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="forecastName">Forecast Name (Optional)</Label>
          <Input
            id="forecastName"
            placeholder="e.g., Q1 2024 Forecast"
            value={forecastName}
            onChange={(e) => setForecastName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="period">Forecast Period</Label>
          <Select
            id="period"
            value={periodMonths.toString()}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPeriodMonths(parseInt(e.target.value))}
          >
            <option value="1">1 Month</option>
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="12">1 Year</option>
            <option value="24">2 Years</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="incomeChange">
            Expected Income Change (%)
          </Label>
          <Input
            id="incomeChange"
            type="number"
            placeholder="0"
            value={expectedIncomeChange}
            onChange={(e) =>
              setExpectedIncomeChange(parseFloat(e.target.value) || 0)
            }
          />
          <p className="text-sm text-muted-foreground">
            Positive for increase, negative for decrease
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedReturn">
            Expected Portfolio Return (% per year)
          </Label>
          <Input
            id="expectedReturn"
            type="number"
            placeholder="0"
            value={expectedReturn}
            onChange={(e) =>
              setExpectedReturn(parseFloat(e.target.value) || 0)
            }
          />
          <p className="text-sm text-muted-foreground">
            Annual return rate for portfolio projections
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Planned Expenses</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPlannedExpense}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>

          {plannedExpenses.map((expense, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-4 gap-2 p-4 border rounded-lg"
            >
              <div className="md:col-span-2">
                <Input
                  placeholder="Expense name"
                  value={expense.name}
                  onChange={(e) =>
                    handlePlannedExpenseChange(index, 'name', e.target.value)
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={expense.amount || ''}
                  onChange={(e) =>
                    handlePlannedExpenseChange(
                      index,
                      'amount',
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={
                    expense.date instanceof Date
                      ? expense.date.toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    handlePlannedExpenseChange(
                      index,
                      'date',
                      new Date(e.target.value)
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePlannedExpense(index)}
                  className="px-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Generating...' : 'Generate Forecast'}
        </Button>
      </CardContent>
    </Card>
  );
}
