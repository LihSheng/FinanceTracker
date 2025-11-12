import { Decimal } from '@prisma/client/runtime/library';

export interface GoalWithCalculations {
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
}

export function calculateGoalProgress(
  currentAmount: number,
  targetAmount: number
): number {
  if (targetAmount <= 0) return 0;
  const progress = (currentAmount / targetAmount) * 100;
  return Math.min(Math.round(progress * 100) / 100, 100);
}

export function calculateRemainingAmount(
  currentAmount: number,
  targetAmount: number
): number {
  return Math.max(targetAmount - currentAmount, 0);
}

export function calculateProjectedCompletionDate(
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number | null,
  expectedReturn: number | null
): Date | null {
  if (!monthlyContribution || monthlyContribution <= 0) {
    return null;
  }

  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) {
    return new Date(); // Already achieved
  }

  const annualReturn = expectedReturn ? expectedReturn / 100 : 0;
  const monthlyReturn = annualReturn / 12;

  if (monthlyReturn === 0) {
    // Simple calculation without returns
    const monthsNeeded = Math.ceil(remaining / monthlyContribution);
    const projectedDate = new Date();
    projectedDate.setMonth(projectedDate.getMonth() + monthsNeeded);
    return projectedDate;
  }

  // Future value of annuity formula: FV = P * [((1 + r)^n - 1) / r] + PV * (1 + r)^n
  // We need to solve for n (number of months)
  // Using approximation with iterative approach
  let months = 0;
  let futureValue = currentAmount;
  const maxMonths = 1200; // 100 years max

  while (futureValue < targetAmount && months < maxMonths) {
    futureValue = futureValue * (1 + monthlyReturn) + monthlyContribution;
    months++;
  }

  if (months >= maxMonths) {
    return null; // Goal not achievable with current parameters
  }

  const projectedDate = new Date();
  projectedDate.setMonth(projectedDate.getMonth() + months);
  return projectedDate;
}

export function calculateMonthsRemaining(targetDate: Date | null): number | null {
  if (!targetDate) return null;

  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  
  return Math.max(diffMonths, 0);
}

export function isGoalOnTrack(
  currentAmount: number,
  targetAmount: number,
  targetDate: Date | null,
  projectedCompletionDate: Date | null
): boolean {
  // If no target date, check if we're making progress
  if (!targetDate) {
    return currentAmount > 0;
  }

  // If already achieved
  if (currentAmount >= targetAmount) {
    return true;
  }

  // If no projected completion date (no monthly contribution), check progress
  if (!projectedCompletionDate) {
    const monthsRemaining = calculateMonthsRemaining(targetDate);
    if (!monthsRemaining) return false;
    
    const progressPercent = calculateGoalProgress(currentAmount, targetAmount);
    const timeElapsedPercent = 100 - (monthsRemaining / 12) * 100; // Rough estimate
    
    return progressPercent >= timeElapsedPercent * 0.8; // 80% threshold
  }

  // Check if projected completion is before target date
  return projectedCompletionDate <= targetDate;
}

export function enrichGoalWithCalculations(goal: {
  id: string;
  name: string;
  category: string;
  targetAmount: Decimal;
  currentAmount: Decimal;
  currency: string;
  targetDate: Date | null;
  monthlyContribution: Decimal | null;
  expectedReturn: Decimal | null;
}): GoalWithCalculations {
  const targetAmount = Number(goal.targetAmount);
  const currentAmount = Number(goal.currentAmount);
  const monthlyContribution = goal.monthlyContribution ? Number(goal.monthlyContribution) : null;
  const expectedReturn = goal.expectedReturn ? Number(goal.expectedReturn) : null;

  const progressPercent = calculateGoalProgress(currentAmount, targetAmount);
  const remainingAmount = calculateRemainingAmount(currentAmount, targetAmount);
  const projectedCompletionDate = calculateProjectedCompletionDate(
    currentAmount,
    targetAmount,
    monthlyContribution,
    expectedReturn
  );
  const monthsRemaining = calculateMonthsRemaining(goal.targetDate);
  const isOnTrack = isGoalOnTrack(
    currentAmount,
    targetAmount,
    goal.targetDate,
    projectedCompletionDate
  );

  return {
    id: goal.id,
    name: goal.name,
    category: goal.category,
    targetAmount,
    currentAmount,
    currency: goal.currency,
    targetDate: goal.targetDate,
    monthlyContribution,
    expectedReturn,
    progressPercent,
    remainingAmount,
    projectedCompletionDate,
    isOnTrack,
    monthsRemaining,
  };
}
