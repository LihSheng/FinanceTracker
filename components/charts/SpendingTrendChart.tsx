'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendData {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

interface SpendingTrendChartProps {
  data: TrendData[];
}

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => `$${value.toFixed(2)}`}
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="income" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Income"
          dot={{ r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#ef4444" 
          strokeWidth={2}
          name="Expenses"
          dot={{ r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="net" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Net"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
