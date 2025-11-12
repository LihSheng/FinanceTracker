'use client';

import { useState } from 'react';

interface PriceSyncResult {
  message: string;
  updated: number;
  failed: number;
  errors?: string[];
  timestamp: string;
}

interface PriceSyncButtonProps {
  assetIds?: string[];
  onSyncComplete?: (result: PriceSyncResult) => void;
  className?: string;
}

export function PriceSyncButton({
  assetIds,
  onSyncComplete,
  className = '',
}: PriceSyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
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

      if (onSyncComplete) {
        onSyncComplete(result);
      }

      // Show errors if any
      if (result.errors && result.errors.length > 0) {
        setError(`${result.updated} updated, ${result.failed} failed`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync prices');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSyncing ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Syncing...
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Sync Prices
            </>
          )}
        </button>

        {lastSync && (
          <span className="text-sm text-gray-600">
            Last synced: {lastSync.toLocaleTimeString()}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          {error}
        </div>
      )}
    </div>
  );
}
