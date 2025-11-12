import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface AlertCondition {
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

export async function checkPriceAlert(
  userId: string,
  condition: AlertCondition
): Promise<boolean> {
  if (!condition.ticker || !condition.threshold || !condition.direction) {
    return false;
  }

  const asset = await prisma.asset.findFirst({
    where: {
      userId,
      ticker: condition.ticker,
    },
  });

  if (!asset || !asset.currentPrice) {
    return false;
  }

  const currentPrice = Number(asset.currentPrice);
  const threshold = condition.threshold;

  if (condition.direction === 'above') {
    return currentPrice > threshold;
  } else {
    return currentPrice < threshold;
  }
}

export async function checkExchangeRateAlert(
  condition: AlertCondition
): Promise<boolean> {
  if (!condition.currencyPair || !condition.threshold || !condition.direction) {
    return false;
  }

  const [fromCurrency, toCurrency] = condition.currencyPair.split('/');

  const latestRate = await prisma.exchangeRate.findFirst({
    where: {
      fromCurrency,
      toCurrency,
    },
    orderBy: {
      date: 'desc',
    },
  });

  if (!latestRate) {
    return false;
  }

  const rate = Number(latestRate.rate);
  const threshold = condition.threshold;

  if (condition.direction === 'above') {
    return rate > threshold;
  } else {
    return rate < threshold;
  }
}

export async function checkMilestoneAlert(
  userId: string,
  condition: AlertCondition
): Promise<boolean> {
  if (!condition.goalId || condition.milestonePercent === undefined) {
    return false;
  }

  const goal = await prisma.goal.findFirst({
    where: {
      id: condition.goalId,
      userId,
    },
  });

  if (!goal) {
    return false;
  }

  const progressPercent =
    (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;

  return progressPercent >= condition.milestonePercent;
}

export async function checkAllocationDriftAlert(
  userId: string,
  condition: AlertCondition
): Promise<boolean> {
  if (condition.driftPercent === undefined) {
    return false;
  }

  const assets = await prisma.asset.findMany({
    where: {
      userId,
      ...(condition.assetType && { assetType: condition.assetType }),
    },
  });

  if (assets.length === 0) {
    return false;
  }

  // Calculate total portfolio value
  const totalValue = assets.reduce((sum: number, asset: any) => {
    const value = Number(asset.currentPrice || asset.buyPrice) * Number(asset.units);
    return sum + value;
  }, 0);

  // Calculate asset type distribution
  const assetTypeValues = new Map<string, number>();
  assets.forEach((asset: any) => {
    const value = Number(asset.currentPrice || asset.buyPrice) * Number(asset.units);
    const currentValue = assetTypeValues.get(asset.assetType) || 0;
    assetTypeValues.set(asset.assetType, currentValue + value);
  });

  // Check if any asset type has drifted more than threshold
  const entries = Array.from(assetTypeValues.entries());
  for (const [, value] of entries) {
    const percentage = (value / totalValue) * 100;
    // Assuming target allocation is equal distribution
    const targetPercentage = 100 / assetTypeValues.size;
    const drift = Math.abs(percentage - targetPercentage);

    if (drift > condition.driftPercent) {
      return true;
    }
  }

  return false;
}

export async function checkBillReminderAlert(
  condition: AlertCondition
): Promise<boolean> {
  if (!condition.dueDate || condition.reminderDaysBefore === undefined) {
    return false;
  }

  const dueDate = new Date(condition.dueDate);
  const today = new Date();
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - condition.reminderDaysBefore);

  return today >= reminderDate && today <= dueDate;
}

export async function checkAlertCondition(
  userId: string,
  alertType: string,
  condition: AlertCondition
): Promise<boolean> {
  switch (alertType) {
    case 'price':
      return checkPriceAlert(userId, condition);
    case 'exchange_rate':
      return checkExchangeRateAlert(condition);
    case 'milestone':
      return checkMilestoneAlert(userId, condition);
    case 'allocation_drift':
      return checkAllocationDriftAlert(userId, condition);
    case 'bill_reminder':
      return checkBillReminderAlert(condition);
    default:
      return false;
  }
}

export async function createNotification(
  userId: string,
  alertType: string,
  condition: AlertCondition,
  relatedId?: string
): Promise<void> {
  let title = '';
  let message = '';

  switch (alertType) {
    case 'price':
      title = 'Price Alert Triggered';
      message = `${condition.ticker} has crossed ${condition.direction} ${condition.threshold}`;
      break;
    case 'exchange_rate':
      title = 'Exchange Rate Alert';
      message = `${condition.currencyPair} has crossed ${condition.direction} ${condition.threshold}`;
      break;
    case 'milestone':
      title = 'Goal Milestone Reached';
      message = `You've reached ${condition.milestonePercent}% of your goal!`;
      break;
    case 'allocation_drift':
      title = 'Portfolio Allocation Drift';
      message = `Your portfolio allocation has drifted more than ${condition.driftPercent}%`;
      break;
    case 'bill_reminder':
      title = 'Bill Payment Reminder';
      message = `${condition.billName} payment of ${condition.amount} is due soon`;
      break;
  }

  await prisma.notification.create({
    data: {
      userId,
      type: alertType,
      title,
      message,
      relatedId,
      isRead: false,
    },
  });
}
