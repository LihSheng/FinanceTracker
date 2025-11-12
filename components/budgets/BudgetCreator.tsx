'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBudgetSchema, CreateBudgetInput } from '@/lib/validations/budget';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface BudgetCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORY_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

export default function BudgetCreator({ isOpen, onClose, onSuccess }: BudgetCreatorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateBudgetInput>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      name: '',
      totalAmount: 0,
      period: 'monthly',
      startDate: new Date().toISOString(),
      categories: [{ name: '', allocatedAmount: 0, color: CATEGORY_COLORS[0] }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'categories',
  });

  const totalAmount = watch('totalAmount');
  const categories = watch('categories');

  const totalAllocated = categories.reduce((sum, cat) => sum + (Number(cat.allocatedAmount) || 0), 0);
  const remaining = totalAmount - totalAllocated;
  const isOverAllocated = remaining < 0;

  const onSubmit = async (data: CreateBudgetInput) => {
    if (isOverAllocated) {
      setError('Total allocated amount exceeds budget total');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create budget');
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Budget" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Budget Name"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g., Monthly Budget 2024"
          />

          <Input
            label="Total Amount"
            type="number"
            step="0.01"
            {...register('totalAmount', { valueAsNumber: true })}
            error={errors.totalAmount?.message}
            placeholder="0.00"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              {...register('period')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            {errors.period && <p className="mt-1 text-sm text-red-600">{errors.period.message}</p>}
          </div>

          <Input
            label="Start Date"
            type="date"
            {...register('startDate')}
            error={errors.startDate?.message}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Budget Categories</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                name: '',
                allocatedAmount: 0,
                color: CATEGORY_COLORS[fields.length % CATEGORY_COLORS.length]
              })}
            >
              + Add Category
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-start">
                <div className="flex-1">
                  <Input
                    {...register(`categories.${index}.name`)}
                    placeholder="Category name"
                    error={errors.categories?.[index]?.name?.message}
                  />
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`categories.${index}.allocatedAmount`, { valueAsNumber: true })}
                    placeholder="Amount"
                    error={errors.categories?.[index]?.allocatedAmount?.message}
                  />
                </div>
                <input
                  type="color"
                  {...register(`categories.${index}.color`)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>
          {errors.categories && (
            <p className="mt-1 text-sm text-red-600">{errors.categories.message}</p>
          )}
        </div>

        <div className={`p-4 rounded-lg ${isOverAllocated ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total Allocated:</span>
            <span className="font-semibold">${totalAllocated.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="font-medium text-gray-700">Remaining:</span>
            <span className={`font-semibold ${isOverAllocated ? 'text-red-600' : 'text-green-600'}`}>
              ${remaining.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isOverAllocated}>
            Create Budget
          </Button>
        </div>
      </form>
    </Modal>
  );
}
