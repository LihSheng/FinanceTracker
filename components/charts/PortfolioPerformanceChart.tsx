'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface PerformanceData {
  date: string;
  totalValue: number;
  totalInvested: number;
  unrealizedGain: number;
}

interface PortfolioPerformanceChartProps {
  data: PerformanceData[];
}

export function PortfolioPerformanceChart({ data }: PortfolioPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => `$${value.toFixed(2)}`}
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="totalInvested" 
          stroke="#10b981" 
          fillOpacity={1}
          fill="url(#colorInvested)"
          name="Total Invested"
        />
        <Area 
          type="monotone" 
          dataKey="totalValue" 
          stroke="#3b82f6" 
          fillOpacity={1}
          fill="url(#colorValue)"
          name="Total Value"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
