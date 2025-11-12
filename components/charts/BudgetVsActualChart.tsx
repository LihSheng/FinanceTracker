'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BudgetVsActualData {
  categoryName: string;
  budgeted: number;
  actualSpent: number;
  isOverBudget: boolean;
}

interface BudgetVsActualChartProps {
  data: BudgetVsActualData[];
}

export function BudgetVsActualChart({ data }: BudgetVsActualChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="categoryName" />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => `$${value.toFixed(2)}`}
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
        />
        <Legend />
        <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
        <Bar 
          dataKey="actualSpent" 
          fill="#10b981" 
          name="Actual Spent"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
