'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import BudgetCategoryCard from '@/components/budgets/BudgetCategoryCard';
import BudgetCreator from '@/components/budgets/BudgetCreator';
import CategoryEditor from '@/components/budgets/CategoryEditor';

interface Budget {
  id: string;
  name: string;
  totalAmount: number;
  period: string;
  startDate: string;
  categories: Category[];
}

interface Category {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  color?: string;
}

export default function BudgetOverview() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/budgets');
      if (!response.ok) throw new Error('Failed to fetch budgets');
      const data = await response.json();
      setBudgets(data);
      if (data.length > 0 && !selectedBudget) {
        setSelectedBudget(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!selectedBudget) return;

    try {
      const response = await fetch(
        `/api/budgets/${selectedBudget.id}/categories/${categoryId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete category');

      await fetchBudgets();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const handleEditCategory = (categoryId: string) => {
    if (!selectedBudget) return;
    const category = selectedBudget.categories.find(c => c.id === categoryId);
    if (category) {
      setEditingCategory(category);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
        <p className="text-gray-600 mb-4">Create your first budget to start tracking your finances</p>
        <Button onClick={() => setIsCreatorOpen(true)}>Create Budget</Button>
        <BudgetCreator
          isOpen={isCreatorOpen}
          onClose={() => setIsCreatorOpen(false)}
          onSuccess={fetchBudgets}
        />
      </div>
    );
  }

  const totalAllocated = selectedBudget?.categories.reduce(
    (sum, cat) => sum + Number(cat.allocatedAmount),
    0
  ) || 0;

  const totalSpent = selectedBudget?.categories.reduce(
    (sum, cat) => sum + Number(cat.spentAmount),
    0
  ) || 0;

  const remaining = (selectedBudget?.totalAmount || 0) - totalAllocated;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Overview</h2>
          {selectedBudget && (
            <p className="text-gray-600 mt-1">
              {selectedBudget.name} - {selectedBudget.period}
            </p>
          )}
        </div>
        <Button onClick={() => setIsCreatorOpen(true)}>+ Create Budget</Button>
      </div>

      {budgets.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {budgets.map((budget) => (
            <button
              key={budget.id}
              onClick={() => setSelectedBudget(budget)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedBudget?.id === budget.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {budget.name}
            </button>
          ))}
        </div>
      )}

      {selectedBudget && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">Total Budget</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${selectedBudget.totalAmount.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">Total Allocated</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${totalAllocated.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((totalAllocated / selectedBudget.totalAmount) * 100).toFixed(0)}% of budget
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">Total Spent</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${totalSpent.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(0) : 0}% of allocated
                </div>
              </CardContent>
            </Card>
          </div>

          {remaining !== 0 && (
            <div className={`p-4 rounded-lg ${remaining < 0 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">
                  {remaining < 0 ? 'Over-allocated' : 'Unallocated'}:
                </span>
                <span className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  ${Math.abs(remaining).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            {selectedBudget.categories.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-600">
                  No categories yet. Add a category to start tracking.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedBudget.categories.map((category) => (
                  <BudgetCategoryCard
                    key={category.id}
                    id={category.id}
                    name={category.name}
                    allocatedAmount={Number(category.allocatedAmount)}
                    spentAmount={Number(category.spentAmount)}
                    color={category.color}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <BudgetCreator
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onSuccess={fetchBudgets}
      />

      {editingCategory && selectedBudget && (
        <CategoryEditor
          isOpen={!!editingCategory}
          budgetId={selectedBudget.id}
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={() => {
            setEditingCategory(null);
            fetchBudgets();
          }}
        />
      )}
    </div>
  );
}
