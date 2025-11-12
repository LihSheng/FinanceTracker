/**
 * Exchange Rate API integration for currency conversion
 * 
 * TODO: TEMPORARY - Currently using dummy exchange rates for development
 * TODO: Re-enable API integration when endpoints are configured
 * 
 * Primary: Bank Negara Malaysia (BNM) API - https://api.bnm.gov.my/public/exchange-rate
 *   - Free, no API key required
 *   - Provides official MYR exchange rates
 *   - Updated daily by Bank Negara Malaysia
 *   - Includes buying, middle, and selling rates
 *   - STATUS: Temporarily disabled - endpoint needs verification
 * 
 * Fallback: ExchangeRate-API - https://www.exchangerate-api.com/
 *   - Used for non-MYR conversions or if BNM API is unavailable
 *   - Requires API key (set EXCHANGE_RATE_API_KEY in .env)
 *   - Provides historical rates
 *   - STATUS: Temporarily disabled - needs valid API key
 */

interface BNMRateData {
  currency_code: string;
  unit: number;
  rate: {
    date: string;
    buying_rate: number | null;
    middle_rate: number;
    selling_rate: number | null;
  };
}

interface BNMAPIResponse {
  data: BNMRateData[];
  meta: {
    quote: string;
    session: string;
    last_updated: string;
    total_result: number;
  };
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
      // Try with today's date first
      const today = new Date().toISOString().split('T')[0];
      let response = await fetch(`${this.bnmBaseUrl}/${today}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      // If that fails, try without date
      if (!response.ok) {
        response = await fetch(this.bnmBaseUrl, {
          headers: {
            'Accept': 'application/json',
          },
        });
      }

      if (!response.ok) {
        console.warn(`BNM API unavailable (status ${response.status}), using fallback`);
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
      console.warn('BNM API error, using fallback:', error);
      return null;
    }
  }

  /**
   * TODO: Temporary dummy rates for development
   * Replace with actual API integration
   */
  private getDummyRate(fromCurrency: string, toCurrency: string): number | null {
    // Approximate exchange rates (as of Nov 2024)
    const ratesFromMYR: Record<string, number> = {
      MYR: 1,
      USD: 0.224,    // 1 MYR ≈ 0.224 USD
      SGD: 0.301,    // 1 MYR ≈ 0.301 SGD
      EUR: 0.206,    // 1 MYR ≈ 0.206 EUR
      GBP: 0.176,    // 1 MYR ≈ 0.176 GBP
      JPY: 33.5,     // 1 MYR ≈ 33.5 JPY
      AUD: 0.344,    // 1 MYR ≈ 0.344 AUD
      CAD: 0.312,    // 1 MYR ≈ 0.312 CAD
      CHF: 0.197,    // 1 MYR ≈ 0.197 CHF
      CNY: 1.62,     // 1 MYR ≈ 1.62 CNY
      HKD: 1.75,     // 1 MYR ≈ 1.75 HKD
      INR: 18.8,     // 1 MYR ≈ 18.8 INR
      IDR: 3550,     // 1 MYR ≈ 3550 IDR
      KRW: 305,      // 1 MYR ≈ 305 KRW
      THB: 7.8,      // 1 MYR ≈ 7.8 THB
      PHP: 13.2,     // 1 MYR ≈ 13.2 PHP
      NZD: 0.377,    // 1 MYR ≈ 0.377 NZD
      TWD: 7.2,      // 1 MYR ≈ 7.2 TWD
      VND: 5700,     // 1 MYR ≈ 5700 VND
    };

    // If converting from MYR
    if (fromCurrency === 'MYR' && ratesFromMYR[toCurrency]) {
      return ratesFromMYR[toCurrency];
    }

    // If converting to MYR
    if (toCurrency === 'MYR' && ratesFromMYR[fromCurrency]) {
      return 1 / ratesFromMYR[fromCurrency];
    }

    // Cross rate via MYR
    if (ratesFromMYR[fromCurrency] && ratesFromMYR[toCurrency]) {
      const fromToMYR = 1 / ratesFromMYR[fromCurrency];
      const myrToTarget = ratesFromMYR[toCurrency];
      return fromToMYR * myrToTarget;
    }

    return null;
  }

  /**
   * Get rate from BNM data
   * BNM rates show how much MYR you get for the foreign currency unit
   * For example: USD rate of 4.1305 means 1 USD = 4.1305 MYR
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
        // BNM rate shows foreign currency to MYR, so we need to invert and adjust for unit
        // For example: USD rate 4.1305 means 1 USD = 4.1305 MYR
        // So 1 MYR = 1/4.1305 USD
        const ratePerUnit = targetRate.rate.middle_rate / targetRate.unit;
        return 1 / ratePerUnit;
      }
    } else if (toCurrency === 'MYR') {
      // Other currency to MYR
      const sourceRate = bnmRates.find((r) => r.currency_code === fromCurrency);
      if (sourceRate) {
        // BNM rate already shows how much MYR per unit of foreign currency
        // Adjust for unit (e.g., JPY is per 100 units)
        return sourceRate.rate.middle_rate / sourceRate.unit;
      }
    } else {
      // Cross rate (e.g., USD to SGD via MYR)
      const sourceRate = bnmRates.find((r) => r.currency_code === fromCurrency);
      const targetRate = bnmRates.find((r) => r.currency_code === toCurrency);

      if (sourceRate && targetRate) {
        // Convert from -> MYR -> to
        const fromToMYR = sourceRate.rate.middle_rate / sourceRate.unit;
        const myrToTarget = targetRate.unit / targetRate.rate.middle_rate;
        return fromToMYR * myrToTarget;
      }
    }

    return null;
  }

  /**
   * Fetch current exchange rate between two currencies
   * TODO: Re-enable BNM API integration when endpoint is available
   * TODO: Configure fallback ExchangeRate-API with valid API key
   * Currently returns dummy rates for development
   */
  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number | null> {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const cacheKey = `${fromCurrency}_${toCurrency}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    // TODO: Temporarily using dummy rates - replace with actual API calls
    const rate = this.getDummyRate(fromCurrency, toCurrency);

    if (rate && !isNaN(rate) && rate > 0) {
      // Cache the result
      this.cache.set(cacheKey, {
        data: rate,
        expiry: Date.now() + this.cacheDuration,
      });
      return rate;
    }

    return null;

    /* TODO: Re-enable when API is configured
    // Try BNM API first (works for any currency pair via MYR)
    try {
      const bnmRates = await this.fetchBNMRates();
      if (bnmRates) {
        const rate = this.getBNMRate(fromCurrency, toCurrency, bnmRates);
        if (rate && !isNaN(rate) && rate > 0) {
          // Cache the result
          this.cache.set(cacheKey, {
            data: rate,
            expiry: Date.now() + this.cacheDuration,
          });
          return rate;
        }
      }
    } catch (error) {
      console.error('BNM API error, falling back:', error);
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
    */
  }

  /**
   * Fetch historical exchange rate for a specific date
   * TODO: Re-enable when API is configured
   * Currently returns current dummy rate
   */
  async getHistoricalRate(
    fromCurrency: string,
    toCurrency: string,
    date: Date
  ): Promise<number | null> {
    // TODO: Temporarily using current dummy rates for historical data
    return this.getDummyRate(fromCurrency, toCurrency);

    /* TODO: Re-enable when API is configured
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
    */
  }

  /**
   * Fetch all rates for supported currencies
   * Uses BNM API for efficiency when possible
   */
  async getAllRates(): Promise<ExchangeRateData[]> {
    const currencies = [
      'MYR', 'SGD', 'USD', 'EUR', 'GBP', 'JPY',
      'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'INR',
      'IDR', 'KRW', 'THB', 'PHP', 'NZD', 'TWD', 'VND'
    ];
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
