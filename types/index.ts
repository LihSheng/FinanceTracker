// Type definitions for the Finance Tracker application

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  totalAmount: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  id: string;
  budgetId: string;
  name: string;
  allocatedAmount: number;
  spentAmount?: number;
  color?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId?: string;
  category?: BudgetCategory;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: Date;
}

export interface Asset {
  id: string;
  userId: string;
  platform: string;
  assetType: 'stock' | 'crypto' | 'gold' | 'cash' | 'other';
  ticker?: string;
  name: string;
  units: number;
  buyPrice: number;
  currentPrice?: number;
  currency: 'MYR' | 'SGD' | 'USD';
  purchaseDate: Date;
  notes?: string;
  goalId?: string;
  unrealizedGain?: number;
  unrealizedGainPercent?: number;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate?: Date;
  monthlyContribution?: number;
  expectedReturn?: number;
  progressPercent: number;
  projectedCompletionDate?: Date;
  remainingAmount: number;
}

export interface AlertCondition {
  ticker?: string;
  threshold?: number;
  direction?: 'above' | 'below';
  currencyPair?: string;
  goalId?: string;
  milestonePercent?: number;
  driftPercent?: number;
  assetType?: string;
  billName?: string;
  amount?: number;
  dueDate?: string;
  reminderDaysBefore?: number;
}

export interface Alert {
  id: string;
  userId: string;
  type: 'price' | 'exchange_rate' | 'milestone' | 'allocation_drift' | 'bill_reminder';
  condition: AlertCondition;
  isActive: boolean;
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: Date;
}
