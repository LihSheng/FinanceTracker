/**
 * Currency conversion utilities
 */

import { prisma } from '@/lib/prisma';
import { exchangeRateService } from '@/lib/market-data/exchange-rates';

export type Currency = 
  | 'MYR' | 'SGD' | 'USD' | 'EUR' | 'GBP' | 'JPY' 
  | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'HKD' | 'INR' 
  | 'IDR' | 'KRW' | 'THB' | 'PHP' | 'NZD' | 'TWD' | 'VND';

export const SUPPORTED_CURRENCIES: Currency[] = [
  'MYR', 'SGD', 'USD', 'EUR', 'GBP', 'JPY',
  'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'INR',
  'IDR', 'KRW', 'THB', 'PHP', 'NZD', 'TWD', 'VND'
];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  MYR: 'RM',
  SGD: 'S$',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '¥',
  HKD: 'HK$',
  INR: '₹',
  IDR: 'Rp',
  KRW: '₩',
  THB: '฿',
  PHP: '₱',
  NZD: 'NZ$',
  TWD: 'NT$',
  VND: '₫',
};

/**
 * Format currency amount with symbol
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Get latest exchange rate from database or API
 */
export async function getLatestExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  // Try to get from database first (today's rate)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dbRate = await prisma.exchangeRate.findFirst({
    where: {
      fromCurrency,
      toCurrency,
      date: {
        gte: today,
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  if (dbRate) {
    return dbRate.rate.toNumber();
  }

  // Fetch from API if not in database
  const rate = await exchangeRateService.getExchangeRate(fromCurrency, toCurrency);
  
  if (rate && !isNaN(rate) && rate > 0) {
    // Store in database for future use
    try {
      await prisma.exchangeRate.create({
        data: {
          fromCurrency,
          toCurrency,
          rate,
          date: new Date(),
        },
      });
    } catch (dbError) {
      // Log but don't fail if database write fails
      console.error('Failed to store exchange rate in database:', dbError);
    }
    return rate;
  }

  throw new Error(`Unable to fetch exchange rate for ${fromCurrency} to ${toCurrency}`);
}

/**
 * Get historical exchange rate from database or API
 */
export async function getHistoricalExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency,
  date: Date
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  // Normalize date to start of day
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  // Try to get from database first
  const dbRate = await prisma.exchangeRate.findFirst({
    where: {
      fromCurrency,
      toCurrency,
      date: normalizedDate,
    },
  });

  if (dbRate) {
    return dbRate.rate.toNumber();
  }

  // Fetch from API if not in database
  const rate = await exchangeRateService.getHistoricalRate(
    fromCurrency,
    toCurrency,
    normalizedDate
  );

  if (rate) {
    // Store in database for future use
    await prisma.exchangeRate.create({
      data: {
        fromCurrency,
        toCurrency,
        rate,
        date: normalizedDate,
      },
    });
    return rate;
  }

  // If historical rate not available, use latest rate as fallback
  return getLatestExchangeRate(fromCurrency, toCurrency);
}

/**
 * Convert amount from one currency to another using latest rate
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rate = await getLatestExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
}

/**
 * Convert amount using historical rate
 */
export async function convertCurrencyHistorical(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  date: Date
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rate = await getHistoricalExchangeRate(fromCurrency, toCurrency, date);
  return amount * rate;
}

/**
 * Get all exchange rates for a base currency
 */
export async function getAllRatesForCurrency(
  baseCurrency: Currency
): Promise<Record<Currency, number>> {
  const rates: Record<string, number> = {};

  for (const currency of SUPPORTED_CURRENCIES) {
    if (currency === baseCurrency) {
      rates[currency] = 1;
    } else {
      try {
        const rate = await getLatestExchangeRate(baseCurrency, currency);
        rates[currency] = rate;
      } catch (error) {
        console.error(`Failed to get rate for ${baseCurrency} to ${currency}:`, error);
        // Skip this currency if rate fetch fails
      }
    }
  }

  return rates as Record<Currency, number>;
}

/**
 * Sync all exchange rates from API to database
 */
export async function syncExchangeRates(): Promise<void> {
  const rates = await exchangeRateService.getAllRates();

  for (const rateData of rates) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if rate already exists for today
    const existing = await prisma.exchangeRate.findFirst({
      where: {
        fromCurrency: rateData.fromCurrency,
        toCurrency: rateData.toCurrency,
        date: today,
      },
    });

    if (!existing) {
      await prisma.exchangeRate.create({
        data: {
          fromCurrency: rateData.fromCurrency,
          toCurrency: rateData.toCurrency,
          rate: rateData.rate,
          date: today,
        },
      });
    }
  }
}
