'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Alert, AlertCondition } from '@/types';

interface AlertConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alert: Partial<Alert>) => void;
  alert?: Alert;
}

export default function AlertConfigDialog({
  isOpen,
  onClose,
  onSave,
  alert,
}: AlertConfigDialogProps) {
  const [alertType, setAlertType] = useState<Alert['type']>(
    alert?.type || 'price'
  );
  const [condition, setCondition] = useState<AlertCondition>(
    alert?.condition || {}
  );
  const [isActive, setIsActive] = useState(alert?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type: alertType,
      condition,
      isActive,
    });
    onClose();
  };

  const renderConditionFields = () => {
    switch (alertType) {
      case 'price':
        return (
          <>
            <Input
              label="Ticker Symbol"
              value={condition.ticker || ''}
              onChange={(e) =>
                setCondition({ ...condition, ticker: e.target.value })
              }
              placeholder="e.g., AAPL"
              required
            />
            <Input
              label="Threshold Price"
              type="number"
              step="0.01"
              value={condition.threshold || ''}
              onChange={(e) =>
                setCondition({
                  ...condition,
                  threshold: parseFloat(e.target.value),
                })
              }
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction
              </label>
              <Select
                value={condition.direction || 'above'}
                onChange={(e) =>
                  setCondition({
                    ...condition,
                    direction: e.target.value as 'above' | 'below',
                  })
                }
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </Select>
            </div>
          </>
        );

      case 'exchange_rate':
        return (
          <>
            <Input
              label="Currency Pair"
              value={condition.currencyPair || ''}
              onChange={(e) =>
                setCondition({ ...condition, currencyPair: e.target.value })
              }
              placeholder="e.g., MYR/SGD"
              required
            />
            <Input
              label="Threshold Rate"
              type="number"
              step="0.0001"
              value={condition.threshold || ''}
              onChange={(e) =>
                setCondition({
                  ...condition,
                  threshold: parseFloat(e.target.value),
                })
              }
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction
              </label>
              <Select
                value={condition.direction || 'above'}
                onChange={(e) =>
                  setCondition({
                    ...condition,
                    direction: e.target.value as 'above' | 'below',
                  })
                }
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </Select>
            </div>
          </>
        );

      case 'milestone':
        return (
          <>
            <Input
              label="Goal ID"
              value={condition.goalId || ''}
              onChange={(e) =>
                setCondition({ ...condition, goalId: e.target.value })
              }
              placeholder="Goal ID"
              required
            />
            <Input
              label="Milestone Percentage"
              type="number"
              min="0"
              max="100"
              value={condition.milestonePercent || ''}
              onChange={(e) =>
                setCondition({
                  ...condition,
                  milestonePercent: parseFloat(e.target.value),
                })
              }
              required
            />
          </>
        );

      case 'allocation_drift':
        return (
          <>
            <Input
              label="Drift Percentage"
              type="number"
              min="0"
              max="100"
              value={condition.driftPercent || ''}
              onChange={(e) =>
                setCondition({
                  ...condition,
                  driftPercent: parseFloat(e.target.value),
                })
              }
              required
            />
            <Input
              label="Asset Type (Optional)"
              value={condition.assetType || ''}
              onChange={(e) =>
                setCondition({ ...condition, assetType: e.target.value })
              }
              placeholder="e.g., stock, crypto"
            />
          </>
        );

      case 'bill_reminder':
        return (
          <>
            <Input
              label="Bill Name"
              value={condition.billName || ''}
              onChange={(e) =>
                setCondition({ ...condition, billName: e.target.value })
              }
              required
            />
            <Input
              label="Amount"
              type="number"
              step="0.01"
              value={condition.amount || ''}
              onChange={(e) =>
                setCondition({
                  ...condition,
                  amount: parseFloat(e.target.value),
                })
              }
              required
            />
            <Input
              label="Due Date"
              type="datetime-local"
              value={condition.dueDate || ''}
              onChange={(e) =>
                setCondition({ ...condition, dueDate: e.target.value })
              }
              required
            />
            <Input
              label="Reminder Days Before"
              type="number"
              min="0"
              value={condition.reminderDaysBefore || 3}
              onChange={(e) =>
                setCondition({
                  ...condition,
                  reminderDaysBefore: parseInt(e.target.value),
                })
              }
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={alert ? 'Edit Alert' : 'Create Alert'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alert Type
          </label>
          <Select
            value={alertType}
            onChange={(e) => {
              setAlertType(e.target.value as Alert['type']);
              setCondition({});
            }}
          >
            <option value="price">Price Alert</option>
            <option value="exchange_rate">Exchange Rate Alert</option>
            <option value="milestone">Goal Milestone</option>
            <option value="allocation_drift">Allocation Drift</option>
            <option value="bill_reminder">Bill Reminder</option>
          </Select>
        </div>

        {renderConditionFields()}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Active
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {alert ? 'Update' : 'Create'} Alert
          </Button>
        </div>
      </form>
    </Modal>
  );
}
