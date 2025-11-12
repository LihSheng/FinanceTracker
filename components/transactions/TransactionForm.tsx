'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTransactionSchema, CreateTransactionInput } from '@/lib/validations/transaction';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: any;
  categories?: Array<{ id: string; name: string }>;
}

export default function TransactionForm({
  isOpen,
  onClose,
  onSuccess,
  transaction,
  categories = [],
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!transaction;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: transaction
      ? {
          amount: Number(transaction.amount),
          type: transaction.type,
          description: transaction.description,
          date: new Date(transaction.date).toISOString().split('T')[0],
          categoryId: transaction.categoryId || '',
        }
      : {
          amount: 0,
          type: 'expense',
          description: '',
          date: new Date().toISOString().split('T')[0],
          categoryId: '',
        },
  });

  useEffect(() => {
    if (isOpen && transaction) {
      reset({
        amount: Number(transaction.amount),
        type: transaction.type,
        description: transaction.description,
        date: new Date(transaction.date).toISOString().split('T')[0],
        categoryId: transaction.categoryId || '',
      });
    } else if (isOpen && !transaction) {
      reset({
        amount: 0,
        type: 'expense',
        description: '',
        date: new Date().toISOString().split('T')[0],
        categoryId: '',
      });
    }
  }, [isOpen, transaction, reset]);

  const transactionType = watch('type');

  const onSubmit = async (data: CreateTransactionInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditing ? `/api/transactions/${transaction.id}` : '/api/transactions';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          categoryId: data.categoryId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save transaction');
      }

      reset();
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Transaction' : 'Add Transaction'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="expense"
                {...register('type')}
                className="mr-2"
              />
              <span className="text-sm">Expense</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="income"
                {...register('type')}
                className="mr-2"
              />
              <span className="text-sm">Income</span>
            </label>
          </div>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        <Input
          label="Amount"
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          error={errors.amount?.message}
          placeholder="0.00"
        />

        <Input
          label="Description"
          {...register('description')}
          error={errors.description?.message}
          placeholder="e.g., Grocery shopping"
        />

        <Input
          label="Date"
          type="date"
          {...register('date')}
          error={errors.date?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category {transactionType === 'expense' ? '(Optional)' : ''}
          </label>
          <select
            {...register('categoryId')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Update' : 'Add'} Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
}
