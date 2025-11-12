'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100),
  category: z.string().min(1, 'Category is required'),
  targetAmount: z.string().min(1, 'Target amount is required'),
  currentAmount: z.string().optional(),
  currency: z.enum(['MYR', 'SGD', 'USD']),
  targetDate: z.string().optional(),
  monthlyContribution: z.string().optional(),
  expectedReturn: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalCreatorProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
}

const GOAL_CATEGORIES = [
  'Property',
  'Wedding',
  'Car',
  'Education',
  'Retirement',
  'Emergency Fund',
  'Vacation',
  'Investment',
  'Other',
];

export function GoalCreator({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: GoalCreatorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      category: '',
      targetAmount: '',
      currentAmount: '0',
      currency: 'MYR',
      targetDate: '',
      monthlyContribution: '',
      expectedReturn: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || '',
        category: initialData?.category || '',
        targetAmount: initialData?.targetAmount?.toString() || '',
        currentAmount: initialData?.currentAmount?.toString() || '0',
        currency: initialData?.currency || 'MYR',
        targetDate: initialData?.targetDate
          ? new Date(initialData.targetDate).toISOString().split('T')[0]
          : '',
        monthlyContribution: initialData?.monthlyContribution?.toString() || '',
        expectedReturn: initialData?.expectedReturn?.toString() || '',
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = async (data: GoalFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        category: data.category,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: data.currentAmount ? parseFloat(data.currentAmount) : 0,
        currency: data.currency,
        targetDate: data.targetDate ? new Date(data.targetDate).toISOString() : null,
        monthlyContribution: data.monthlyContribution ? parseFloat(data.monthlyContribution) : null,
        expectedReturn: data.expectedReturn ? parseFloat(data.expectedReturn) : null,
      };

      await onSubmit(payload);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={isEditing ? 'Edit Goal' : 'Create New Goal'}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Goal Name</label>
            <Input
              {...form.register('name')}
              placeholder="e.g., Down Payment for House"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              {...form.register('category')}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select category</option>
              {GOAL_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {form.formState.errors.category && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              {...form.register('currency')}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="MYR">MYR</option>
              <option value="SGD">SGD</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target Amount</label>
            <Input
              type="number"
              step="0.01"
              {...form.register('targetAmount')}
              placeholder="100000"
            />
            {form.formState.errors.targetAmount && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.targetAmount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Current Amount</label>
            <Input
              type="number"
              step="0.01"
              {...form.register('currentAmount')}
              placeholder="0"
            />
            <p className="text-sm text-gray-500 mt-1">Initial amount already saved</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target Date (Optional)</label>
            <Input
              type="date"
              {...form.register('targetDate')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Monthly Contribution (Optional)</label>
            <Input
              type="number"
              step="0.01"
              {...form.register('monthlyContribution')}
              placeholder="1000"
            />
            <p className="text-sm text-gray-500 mt-1">How much you plan to save monthly</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Expected Annual Return % (Optional)</label>
            <Input
              type="number"
              step="0.01"
              {...form.register('expectedReturn')}
              placeholder="5"
            />
            <p className="text-sm text-gray-500 mt-1">Expected investment return rate</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
