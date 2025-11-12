'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface BudgetCategoryCardProps {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  color?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function BudgetCategoryCard({
  id,
  name,
  allocatedAmount,
  spentAmount,
  color = '#3B82F6',
  onEdit,
  onDelete,
}: BudgetCategoryCardProps) {
  const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirm();
  const [isDeleting, setIsDeleting] = useState(false);

  const percentage = allocatedAmount > 0 ? (spentAmount / allocatedAmount) * 100 : 0;
  const remaining = allocatedAmount - spentAmount;
  const isOverBudget = spentAmount > allocatedAmount;

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete the "${name}" category? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h3 className="font-semibold text-gray-900">{name}</h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(id)}
              className="text-blue-600 hover:text-blue-700"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Spent</span>
            <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
              ${spentAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Budget</span>
            <span className="font-medium text-gray-900">${allocatedAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Remaining</span>
            <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              ${remaining.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{percentage.toFixed(0)}% used</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
      />
    </Card>
  );
}
