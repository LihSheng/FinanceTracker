'use client';

import { useState, useEffect } from 'react';
import { Currency } from '@/lib/utils/currency';

const CURRENCY_STORAGE_KEY = 'preferred_currency';

/**
 * Hook for managing currency preference across the application
 */
export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>('MYR');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load preferred currency from localStorage
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored && ['MYR', 'SGD', 'USD'].includes(stored)) {
      setCurrencyState(stored as Currency);
    }
    setLoading(false);
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  };

  return {
    currency,
    setCurrency,
    loading,
  };
}
