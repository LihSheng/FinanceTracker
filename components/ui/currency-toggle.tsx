'use client';

import { useState } from 'react';
import { Currency, CURRENCY_SYMBOLS } from '@/lib/utils/currency';

interface CurrencyToggleProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  currencies?: Currency[];
}

export function CurrencyToggle({
  value,
  onChange,
  currencies = ['MYR', 'SGD', 'USD'],
}: CurrencyToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
      {currencies.map((currency) => (
        <button
          key={currency}
          onClick={() => onChange(currency)}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${
              value === currency
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          {CURRENCY_SYMBOLS[currency]} {currency}
        </button>
      ))}
    </div>
  );
}
