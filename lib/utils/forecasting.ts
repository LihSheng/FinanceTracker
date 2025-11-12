type Transaction = {
  id: string;
  userId: string;
  categoryId: string | null;
  amount: any; // Decimal
  type: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

export interface ForecastParameters {
  periodMonths: number;
  expectedIncomeChange?: number; // percentage change
  plannedExpenses?: PlannedExpense[];
  expectedReturn?: number; // annual return percentage for portfolio
}

export interface PlannedExpense {
  name: string;
  amount: number;
  date: Date;
}

export interface ForecastProjection {
  date: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  projectedPortfolioValue?: number;
}

export interface ForecastResult {
  projections: ForecastProjection[];
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  totalProjectedIncome: number;
  totalProjectedExpenses: number;
  finalBalance: number;
  hasInsufficientData: boolean;
}

const MINIMUM_MONTHS_FOR_FORECAST = 2;

/**
 * Calculate average monthly income and expenses from historical transactions
 */
export function calculateHistoricalAverages(transactions: Transaction[]): {
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
  monthsCovered: number;
} {
  if (transactions.length === 0) {
    return { avgMonthlyIncome: 0, avgMonthlyExpenses: 0, monthsCovered: 0 };
  }

  // Group transactions by month
  const monthlyData = new Map<string, { income: number; expenses: number }>();

  transactions.forEach((transaction) => {
    const monthKey = new Date(transaction.date).toISOString().slice(0, 7); // YYYY-MM
    const existing = monthlyData.get(monthKey) || { income: 0, expenses: 0 };

    if (transaction.type === 'income') {
      existing.income += Number(transaction.amount);
    } else {
      existing.expenses += Number(transaction.amount);
    }

    monthlyData.set(monthKey, existing);
  });

  // Calculate averages
  const months = Array.from(monthlyData.values());
  const totalIncome = months.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = months.reduce((sum, m) => sum + m.expenses, 0);

  return {
    avgMonthlyIncome: totalIncome / months.length,
    avgMonthlyExpenses: totalExpenses / months.length,
    monthsCovered: months.length,
  };
}

/**
 * Generate forecast projections based on historical data and parameters
 */
export function generateForecast(
  transactions: Transaction[],
  currentBalance: number,
  parameters: ForecastParameters,
  currentPortfolioValue?: number
): ForecastResult {
  const { avgMonthlyIncome, avgMonthlyExpenses, monthsCovered } =
    calculateHistoricalAverages(transactions);

  const hasInsufficientData = monthsCovered < MINIMUM_MONTHS_FOR_FORECAST;

  // Apply income change if specified
  const adjustedIncome =
    avgMonthlyIncome * (1 + (parameters.expectedIncomeChange || 0) / 100);

  const projections: ForecastProjection[] = [];
  let runningBalance = currentBalance;
  let runningPortfolioValue = currentPortfolioValue || 0;

  const startDate = new Date();

  for (let month = 1; month <= parameters.periodMonths; month++) {
    const projectionDate = new Date(startDate);
    projectionDate.setMonth(projectionDate.getMonth() + month);

    // Calculate projected income and expenses
    const projectedIncome = adjustedIncome;
    let projectedExpenses = avgMonthlyExpenses;

    // Add planned expenses for this month
    const plannedForMonth = parameters.plannedExpenses?.filter((pe) => {
      const peDate = new Date(pe.date);
      return (
        peDate.getFullYear() === projectionDate.getFullYear() &&
        peDate.getMonth() === projectionDate.getMonth()
      );
    });

    if (plannedForMonth && plannedForMonth.length > 0) {
      const plannedTotal = plannedForMonth.reduce(
        (sum, pe) => sum + pe.amount,
        0
      );
      projectedExpenses += plannedTotal;
    }

    // Update running balance
    runningBalance += projectedIncome - projectedExpenses;

    // Project portfolio value if applicable
    if (currentPortfolioValue && parameters.expectedReturn) {
      const monthlyReturn = parameters.expectedReturn / 12 / 100;
      runningPortfolioValue *= 1 + monthlyReturn;
    }

    projections.push({
      date: projectionDate.toISOString().slice(0, 10),
      projectedIncome,
      projectedExpenses,
      projectedBalance: runningBalance,
      projectedPortfolioValue:
        currentPortfolioValue && parameters.expectedReturn
          ? runningPortfolioValue
          : undefined,
    });
  }

  return {
    projections,
    averageMonthlyIncome: adjustedIncome,
    averageMonthlyExpenses: avgMonthlyExpenses,
    totalProjectedIncome: adjustedIncome * parameters.periodMonths,
    totalProjectedExpenses:
      avgMonthlyExpenses * parameters.periodMonths +
      (parameters.plannedExpenses?.reduce((sum, pe) => sum + pe.amount, 0) ||
        0),
    finalBalance: runningBalance,
    hasInsufficientData,
  };
}

/**
 * Validate forecast parameters
 */
export function validateForecastParameters(
  parameters: ForecastParameters
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (parameters.periodMonths < 1 || parameters.periodMonths > 60) {
    errors.push('Period must be between 1 and 60 months');
  }

  if (
    parameters.expectedIncomeChange !== undefined &&
    (parameters.expectedIncomeChange < -100 ||
      parameters.expectedIncomeChange > 1000)
  ) {
    errors.push('Expected income change must be between -100% and 1000%');
  }

  if (
    parameters.expectedReturn !== undefined &&
    (parameters.expectedReturn < -100 || parameters.expectedReturn > 100)
  ) {
    errors.push('Expected return must be between -100% and 100%');
  }

  if (parameters.plannedExpenses) {
    parameters.plannedExpenses.forEach((pe, index) => {
      if (!pe.name || pe.name.trim() === '') {
        errors.push(`Planned expense ${index + 1} must have a name`);
      }
      if (pe.amount <= 0) {
        errors.push(`Planned expense ${index + 1} must have a positive amount`);
      }
      if (!(pe.date instanceof Date) && isNaN(Date.parse(pe.date as any))) {
        errors.push(`Planned expense ${index + 1} must have a valid date`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
