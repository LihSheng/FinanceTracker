'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

const contributionSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  date: z.date(),
  notes: z.string().max(500).optional(),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

interface ContributionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  goalName: string;
  currency: string;
}

export function ContributionDialog({
  open,
  onClose,
  onSubmit,
  goalName,
  currency,
}: ContributionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: '',
      date: new Date(),
      notes: '',
    },
  });

  const handleSubmit = async (data: ContributionFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(data.amount),
        date: data.date.toISOString(),
        notes: data.notes || undefined,
      };

      await onSubmit(payload);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error submitting contribution:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Add Contribution">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          Record a contribution to <span className="font-semibold">{goalName}</span>
        </p>

        <div>
          <label className="block text-sm font-medium mb-1">Amount ({currency})</label>
          <Input
            type="number"
            step="0.01"
            {...form.register('amount')}
            placeholder="1000.00"
          />
          <p className="text-sm text-gray-500 mt-1">The amount you're contributing to this goal</p>
          {form.formState.errors.amount && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input
            type="date"
            {...form.register('date', {
              setValueAs: (value) => value ? new Date(value) : new Date(),
            })}
            max={new Date().toISOString().split('T')[0]}
          />
          <p className="text-sm text-gray-500 mt-1">When did you make this contribution?</p>
          {form.formState.errors.date && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
          <textarea
            {...form.register('notes')}
            placeholder="Add any notes about this contribution..."
            className="w-full px-3 py-2 border rounded-md resize-none"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Contribution'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
