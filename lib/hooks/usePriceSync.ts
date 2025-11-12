import { useState, useCallback } from 'react';

interface PriceSyncResult {
  message: string;
  updated: number;
  failed: number;
  errors?: string[];
  timestamp: string;
}

export function usePriceSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncPrices = useCallback(async (assetIds?: string[]) => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/prices/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assetIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync prices');
      }

      const result: PriceSyncResult = await response.json();
      setLastSync(new Date(result.timestamp));

      if (result.errors && result.errors.length > 0) {
        setError(`${result.updated} updated, ${result.failed} failed`);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync prices';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const getPrice = useCallback(
    async (ticker: string, assetType: string = 'stock', currency: string = 'USD') => {
      try {
        const response = await fetch(
          `/api/prices/${ticker}?assetType=${assetType}&currency=${currency}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch price');
        }

        return await response.json();
      } catch (err) {
        console.error('Error fetching price:', err);
        return null;
      }
    },
    []
  );

  const getPriceHistory = useCallback(async (ticker: string, days: number = 30) => {
    try {
      const response = await fetch(`/api/prices/history/${ticker}?days=${days}`);

      if (!response.ok) {
        throw new Error('Failed to fetch price history');
      }

      return await response.json();
    } catch (err) {
      console.error('Error fetching price history:', err);
      return null;
    }
  }, []);

  return {
    syncPrices,
    getPrice,
    getPriceHistory,
    isSyncing,
    lastSync,
    error,
  };
}
