'use client';

interface TransactionSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
}

export default function TransactionSummary({
  totalIncome,
  totalExpenses,
  netBalance,
  incomeCount,
  expenseCount,
}: TransactionSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Income</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ${totalIncome.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{incomeCount} transactions</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              ${totalExpenses.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{expenseCount} transactions</p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Net Balance</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                netBalance >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
            >
              {netBalance >= 0 ? '+' : ''}${netBalance.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {netBalance >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </div>
          <div
            className={`p-3 rounded-full ${
              netBalance >= 0 ? 'bg-blue-100' : 'bg-red-100'
            }`}
          >
            <svg
              className={`w-6 h-6 ${
                netBalance >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
