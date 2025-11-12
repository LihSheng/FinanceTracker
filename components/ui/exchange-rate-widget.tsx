'use client';

import { useEffect, useState } from 'react';
import { Currency, CURRENCY_SYMBOLS } from '@/lib/utils/currency';
import Modal from '@/components/ui/Modal';

interface ExchangeRateWidgetProps {
  baseCurrency?: Currency;
}

interface RateData {
  baseCurrency: Currency;
  rates: Record<Currency, number>;
  timestamp: string;
}

export function ExchangeRateWidget({ baseCurrency = 'MYR' }: ExchangeRateWidgetProps) {
  const [rateData, setRateData] = useState<RateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/currencies/rates?base=${baseCurrency}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      setRateData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [baseCurrency]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600">
          <p className="font-semibold">Error loading rates</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchRates}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!rateData) return null;

  const currencies = Object.keys(rateData.rates).filter(
    (c) => c !== baseCurrency
  ) as Currency[];

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Exchange Rates</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchRates();
            }}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            title="Refresh rates"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Fixed height scrollable content */}
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {currencies.slice(0, 3).map((currency) => (
            <div
              key={currency}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  1 {CURRENCY_SYMBOLS[baseCurrency]}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {rateData.rates[currency].toFixed(4)} {CURRENCY_SYMBOLS[currency]}
              </span>
            </div>
          ))}
        </div>

        {currencies.length > 3 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all {currencies.length} rates →
            </button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(rateData.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Modal for all rates */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Exchange Rates">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <p className="text-sm text-gray-600">
              Base Currency: <span className="font-semibold">{CURRENCY_SYMBOLS[baseCurrency]} {baseCurrency}</span>
            </p>
            <button
              onClick={fetchRates}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Refresh rates"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {currencies.map((currency) => (
              <div
                key={currency}
                className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">
                      {CURRENCY_SYMBOLS[currency]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{currency}</p>
                    <p className="text-xs text-gray-500">
                      1 {CURRENCY_SYMBOLS[baseCurrency]} {baseCurrency}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {rateData.rates[currency].toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {CURRENCY_SYMBOLS[currency]} {currency}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Last updated: {new Date(rateData.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
