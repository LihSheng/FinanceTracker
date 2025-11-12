'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AlertConfigDialog from './AlertConfigDialog';
import { useToast } from '@/components/ui/use-toast';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function AlertCenter() {
  const { t } = useTranslation(['alerts', 'common']);
  const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirm();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      } else {
        toast({
          title: t('common:error'),
          description: t('alerts:messages.load_failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch alerts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlert = async (alertData: Partial<Alert>) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });

      if (response.ok) {
        toast({
          title: t('common:success'),
          description: t('alerts:messages.created'),
        });
        fetchAlerts();
      } else {
        toast({
          title: t('common:error'),
          description: t('alerts:messages.create_failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to create alert',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateAlert = async (alertData: Partial<Alert>) => {
    if (!editingAlert) return;

    try {
      const response = await fetch(`/api/alerts/${editingAlert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });

      if (response.ok) {
        toast({
          title: t('common:success'),
          description: t('alerts:messages.updated'),
        });
        fetchAlerts();
        setEditingAlert(undefined);
      } else {
        toast({
          title: t('common:error'),
          description: t('alerts:messages.update_failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to update alert',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAlert = async (id: string) => {
    const confirmed = await confirm({
      title: t('alerts:confirm.delete_title'),
      message: t('alerts:confirm.delete_message'),
      confirmText: t('common:delete'),
      cancelText: t('common:cancel'),
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: t('common:success'),
          description: t('alerts:messages.deleted'),
        });
        fetchAlerts();
      } else {
        toast({
          title: t('common:error'),
          description: t('alerts:messages.delete_failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete alert',
        variant: 'destructive',
      });
    }
  };

  const toggleAlertStatus = async (alert: Alert) => {
    try {
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !alert.isActive }),
      });

      if (response.ok) {
        fetchAlerts();
      }
    } catch (error) {
      console.error('Error toggling alert status:', error);
    }
  };

  const getAlertTypeLabel = (type: Alert['type']) => {
    const labels = {
      price: 'Price Alert',
      exchange_rate: 'Exchange Rate',
      milestone: 'Goal Milestone',
      allocation_drift: 'Allocation Drift',
      bill_reminder: 'Bill Reminder',
    };
    return labels[type];
  };

  const getConditionSummary = (alert: Alert) => {
    const { type, condition } = alert;
    switch (type) {
      case 'price':
        return `${condition.ticker} ${condition.direction} ${condition.threshold}`;
      case 'exchange_rate':
        return `${condition.currencyPair} ${condition.direction} ${condition.threshold}`;
      case 'milestone':
        return `${condition.milestonePercent}% of goal`;
      case 'allocation_drift':
        return `Drift > ${condition.driftPercent}%${condition.assetType ? ` (${condition.assetType})` : ''}`;
      case 'bill_reminder':
        return `${condition.billName} - ${condition.amount}`;
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('alerts:title')}</h2>
        <Button
          onClick={() => {
            setEditingAlert(undefined);
            setIsDialogOpen(true);
          }}
        >
          {t('alerts:create_alert')}
        </Button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('alerts:no_alerts')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('alerts:no_alerts_description')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                      {getAlertTypeLabel(alert.type)}
                    </Badge>
                    {alert.isActive ? (
                      <Badge variant="default">{t('alerts:active')}</Badge>
                    ) : (
                      <Badge variant="secondary">{t('alerts:inactive')}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 font-medium">
                    {getConditionSummary(alert)}
                  </p>
                  {alert.lastTriggered && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('alerts:last_triggered')}:{' '}
                      {new Date(alert.lastTriggered).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAlertStatus(alert)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {alert.isActive ? t('alerts:deactivate') : t('alerts:activate')}
                  </button>
                  <button
                    onClick={() => {
                      setEditingAlert(alert);
                      setIsDialogOpen(true);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    {t('common:edit')}
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    {t('common:delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertConfigDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingAlert(undefined);
        }}
        onSave={editingAlert ? handleUpdateAlert : handleCreateAlert}
        alert={editingAlert}
      />

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
    </div>
  );
}
