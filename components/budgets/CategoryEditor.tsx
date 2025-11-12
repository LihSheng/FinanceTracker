'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateBudgetCategorySchema, UpdateBudgetCategoryInput } from '@/lib/validations/budget';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface CategoryEditorProps {
  isOpen: boolean;
  budgetId: string;
  category: {
    id: string;
    name: string;
    allocatedAmount: number;
    color?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryEditor({
  isOpen,
  budgetId,
  category,
  onClose,
  onSuccess,
}: CategoryEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateBudgetCategoryInput>({
    resolver: zodResolver(updateBudgetCategorySchema),
    defaultValues: {
      name: category.name,
      allocatedAmount: category.allocatedAmount,
      color: category.color || '#3B82F6',
    },
  });

  const onSubmit = async (data: UpdateBudgetCategoryInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/budgets/${budgetId}/categories/${category.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update category');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Category" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Input
          label="Category Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="e.g., Groceries"
        />

        <Input
          label="Allocated Amount"
          type="number"
          step="0.01"
          {...register('allocatedAmount', { valueAsNumber: true })}
          error={errors.allocatedAmount?.message}
          placeholder="0.00"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <input
            type="color"
            {...register('color')}
            className="w-full h-10 border border-gray-300 rounded cursor-pointer"
          />
          {errors.color && (
            <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
