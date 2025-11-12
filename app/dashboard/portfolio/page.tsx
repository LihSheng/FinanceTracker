'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PortfolioDashboard from '@/components/portfolio/PortfolioDashboard';
import AddAssetForm from '@/components/portfolio/AddAssetForm';
import CSVImportDialog from '@/components/portfolio/CSVImportDialog';
import Button from '@/components/ui/Button';

export default function PortfolioPage() {
  const { t } = useTranslation(['portfolio', 'common']);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setShowAddForm(false);
    setShowImportDialog(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('portfolio:title')}</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowImportDialog(true)} variant="outline" size="sm">
            {t('portfolio:import_csv')}
          </Button>
          <Button onClick={() => setShowAddForm(true)} size="sm">{t('portfolio:add_asset')}</Button>
        </div>
      </div>

      <PortfolioDashboard key={refreshKey} onRefresh={() => setRefreshKey((prev) => prev + 1)} />

      {showAddForm && (
        <AddAssetForm onSuccess={handleSuccess} onCancel={() => setShowAddForm(false)} />
      )}

      {showImportDialog && (
        <CSVImportDialog
          onSuccess={handleSuccess}
          onCancel={() => setShowImportDialog(false)}
        />
      )}
    </div>
  );
}
