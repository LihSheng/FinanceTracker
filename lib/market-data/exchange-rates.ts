/**
 * Exchange Rate API integration for currency conversion
 * Uses ExchangeRate-API for fetching current and historical rates
 */

interface ExchangeRateAPIResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: Record<string, number>;
}

interface HistoricalRateResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  year: number;
  month: number;
  day: number;
  base_code: string;
  conversion_rates: Record<string, number>;
}

export interface ExchangeRateData {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: Date;
}

export class ExchangeRateService {
  private baseUrl = 'https://v6.exchangerate-api.com/v6';
  private apiKey: string;
  private cache: Map<string, { data: number; expiry: number }> = new Map();
  private cacheDuration = 60 * 60 * 1000; // 1 hour

  constructor() {
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY || 'demo';
  }

  /**
   * Fetch current exchange rate between two currencies
   */
  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number | null> {
    const cacheKey = `${fromCurrency}_${toCurrency}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    try {
      const url = `${this.baseUrl}/${this.apiKey}/latest/${fromCurrency}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Exchange Rate API error: ${response.status}`);
        return null;
      }

      const data: ExchangeRateAPIResponse = await response.json();

      if (data.result !== 'success') {
        console.error('Exchange Rate API returned error');
        return null;
      }

      const rate = data.conversion_rates[toCurrency];

      if (!rate || isNaN(rate)) {
        console.error(`No rate found for ${fromCurrency} to ${toCurrency}`);
        return null;
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: rate,
        expiry: Date.now() + this.cacheDuration,
      });

      return rate;
    } catch (error) {
      console.error(`Error fetching exchange rate:`, error);
      return null;
    }
  }

  /**
   * Fetch historical exchange rate for a specific date
   */
  async getHistoricalRate(
    fromCurrency: string,
    toCurrency: string,
    date: Date
  ): Promise<number | null> {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      const url = `${this.baseUrl}/${this.apiKey}/history/${fromCurrency}/${year}/${month}/${day}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Exchange Rate API error: ${response.status}`);
        return null;
      }

      const data: HistoricalRateResponse = await response.json();

      if (data.result !== 'success') {
        console.error('Exchange Rate API returned error');
        return null;
      }

      const rate = data.conversion_rates[toCurrency];

      if (!rate || isNaN(rate)) {
        console.error(`No historical rate found for ${fromCurrency} to ${toCurrency}`);
        return null;
      }

      return rate;
    } catch (error) {
      console.error(`Error fetching historical exchange rate:`, error);
      return null;
    }
  }

  /**
   * Fetch all rates for supported currencies (MYR, SGD, USD)
   */
  async getAllRates(): Promise<ExchangeRateData[]> {
    const currencies = ['MYR', 'SGD', 'USD'];
    const rates: ExchangeRateData[] = [];
    const now = new Date();

    for (const fromCurrency of currencies) {
      for (const toCurrency of currencies) {
        if (fromCurrency === toCurrency) continue;

        const rate = await this.getExchangeRate(fromCurrency, toCurrency);
        if (rate) {
          rates.push({
            fromCurrency,
            toCurrency,
            rate,
            date: now,
          });
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return rates;
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number | null> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    if (!rate) {
      return null;
    }

    return amount * rate;
  }

  /**
   * Clear cache for specific currency pair or all pairs
   */
  clearCache(fromCurrency?: string, toCurrency?: string): void {
    if (fromCurrency && toCurrency) {
      this.cache.delete(`${fromCurrency}_${toCurrency}`);
    } else {
      this.cache.clear();
    }
  }
}

// Singleton instance
export const exchangeRateService = new ExchangeRateService();
