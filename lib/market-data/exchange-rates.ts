/**
 * Exchange Rate API integration for currency conversion
 * 
 * Primary: Bank Negara Malaysia (BNM) API - https://api.bnm.gov.my/public/exchange-rate
 *   - Free, no API key required
 *   - Provides official MYR exchange rates
 *   - Updated daily by Bank Negara Malaysia
 *   - Includes buying, middle, and selling rates
 * 
 * Fallback: ExchangeRate-API - https://www.exchangerate-api.com/
 *   - Used for non-MYR conversions or if BNM API is unavailable
 *   - Requires API key (set EXCHANGE_RATE_API_KEY in .env)
 *   - Provides historical rates
 */

interface BNMRateData {
  currency_code: string;
  currency: string;
  rate: {
    buying_rate: number;
    middle_rate: number;
    selling_rate: number;
  };
  date: string;
}

interface BNMAPIResponse {
  meta: {
    last_updated: string;
    next_update: string;
  };
  data: BNMRateData[];
}

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
  private bnmBaseUrl = 'https://api.bnm.gov.my/public/exchange-rate';
  private fallbackBaseUrl = 'https://v6.exchangerate-api.com/v6';
  private apiKey: string;
  private cache: Map<string, { data: number; expiry: number }> = new Map();
  private cacheDuration = 60 * 60 * 1000; // 1 hour
  private bnmRatesCache: { data: BNMRateData[]; expiry: number } | null = null;

  constructor() {
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY || 'demo';
  }

  /**
   * Fetch rates from BNM API
   */
  private async fetchBNMRates(): Promise<BNMRateData[] | null> {
    // Check cache first
    if (this.bnmRatesCache && Date.now() < this.bnmRatesCache.expiry) {
      return this.bnmRatesCache.data;
    }

    try {
      const response = await fetch(this.bnmBaseUrl);

      if (!response.ok) {
        console.error(`BNM API error: ${response.status}`);
        return null;
      }

      const data: BNMAPIResponse = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        console.error('Invalid BNM API response format');
        return null;
      }

      // Cache the result
      this.bnmRatesCache = {
        data: data.data,
        expiry: Date.now() + this.cacheDuration,
      };

      return data.data;
    } catch (error) {
      console.error('Error fetching BNM rates:', error);
      return null;
    }
  }

  /**
   * Get rate from BNM data
   */
  private getBNMRate(
    fromCurrency: string,
    toCurrency: string,
    bnmRates: BNMRateData[]
  ): number | null {
    // BNM rates are always in relation to MYR
    if (fromCurrency === 'MYR') {
      // MYR to other currency
      const targetRate = bnmRates.find((r) => r.currency_code === toCurrency);
      if (targetRate) {
        // Use middle rate for conversions
        return 1 / targetRate.rate.middle_rate;
      }
    } else if (toCurrency === 'MYR') {
      // Other currency to MYR
      const sourceRate = bnmRates.find((r) => r.currency_code === fromCurrency);
      if (sourceRate) {
        return sourceRate.rate.middle_rate;
      }
    } else {
      // Cross rate (e.g., USD to SGD via MYR)
      const sourceRate = bnmRates.find((r) => r.currency_code === fromCurrency);
      const targetRate = bnmRates.find((r) => r.currency_code === toCurrency);
      
      if (sourceRate && targetRate) {
        // Convert from -> MYR -> to
        const fromToMYR = sourceRate.rate.middle_rate;
        const myrToTarget = 1 / targetRate.rate.middle_rate;
        return fromToMYR * myrToTarget;
      }
    }

    return null;
  }

  /**
   * Fetch current exchange rate between two currencies
   * Tries BNM API first (for MYR-related conversions), falls back to ExchangeRate-API
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

    // Try BNM API first if MYR is involved
    if (fromCurrency === 'MYR' || toCurrency === 'MYR') {
      const bnmRates = await this.fetchBNMRates();
      if (bnmRates) {
        const rate = this.getBNMRate(fromCurrency, toCurrency, bnmRates);
        if (rate) {
          // Cache the result
          this.cache.set(cacheKey, {
            data: rate,
            expiry: Date.now() + this.cacheDuration,
          });
          return rate;
        }
      }
    }

    // Fallback to ExchangeRate-API
    try {
      const url = `${this.fallbackBaseUrl}/${this.apiKey}/latest/${fromCurrency}`;
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
   * Note: BNM API doesn't provide historical data, so we use fallback API
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

      const url = `${this.fallbackBaseUrl}/${this.apiKey}/history/${fromCurrency}/${year}/${month}/${day}`;
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
   * Uses BNM API for efficiency when possible
   */
  async getAllRates(): Promise<ExchangeRateData[]> {
    const currencies = ['MYR', 'SGD', 'USD'];
    const rates: ExchangeRateData[] = [];
    const now = new Date();

    // Try to get all rates from BNM first
    const bnmRates = await this.fetchBNMRates();
    
    for (const fromCurrency of currencies) {
      for (const toCurrency of currencies) {
        if (fromCurrency === toCurrency) continue;

        let rate: number | null = null;

        // Try BNM first if available
        if (bnmRates) {
          rate = this.getBNMRate(fromCurrency, toCurrency, bnmRates);
        }

        // Fallback to regular API if BNM didn't work
        if (!rate) {
          rate = await this.getExchangeRate(fromCurrency, toCurrency);
          // Small delay to avoid rate limiting on fallback API
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (rate) {
          rates.push({
            fromCurrency,
            toCurrency,
            rate,
            date: now,
          });
        }
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
