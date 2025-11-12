'use client';

import { useState, useEffect, useCallback } from 'react';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import TransactionSummary from '@/components/transactions/TransactionSummary';
import Button from '@/components/ui/Button';
import { useToastContext } from '@/contexts/ToastContext';

export default function TransactionsPage() {
  const { success, error } = useToastContext();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    incomeCount: 0,
    expenseCount: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });
  const [categories, setCategories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters,
      });

      const response = await fetch(`/api/transactions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchSummary = useCallback(async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/transactions/summary?${params}`);
      if (!response.ok) throw new Error('Failed to fetch summary');

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error('Error fetching summary:', err);
      error('Failed to load summary');
    }
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/budgets');
      if (!response.ok) throw new Error('Failed to fetch categories');

      const budgets = await response.json();
      const allCategories = budgets.flatMap((budget: any) =>
        budget.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
        }))
      );
      setCategories(allCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [fetchTransactions, fetchSummary]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete transaction');

      success('Transaction deleted successfully');
      fetchTransactions();
      fetchSummary();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      error('Failed to delete transaction');
    }
  };

  const handleFormSuccess = () => {
    fetchTransactions();
    fetchSummary();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Track your income and expenses</p>
        </div>
        <Button onClick={handleAddTransaction}>+ Add Transaction</Button>
      </div>

      <TransactionSummary
        totalIncome={summary.totalIncome}
        totalExpenses={summary.totalExpenses}
        netBalance={summary.netBalance}
        incomeCount={summary.incomeCount}
        expenseCount={summary.expenseCount}
      />

      <TransactionFilters
        categories={categories}
        onFilterChange={handleFilterChange}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <TransactionList
          transactions={transactions}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          isLoading={isLoading}
        />
      </div>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        transaction={editingTransaction}
        categories={categories}
      />
    </div>
  );
}
