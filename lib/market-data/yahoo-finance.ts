/**
 * Yahoo Finance API integration for stock price fetching
 * Uses the unofficial Yahoo Finance API
 */

interface YahooQuoteResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number;
        currency: string;
        symbol: string;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          close: number[];
        }>;
      };
    }>;
    error: any;
  };
}

interface PriceData {
  symbol: string;
  price: number;
  currency: string;
  timestamp: Date;
}

export class YahooFinanceService {
  private baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';
  private cache: Map<string, { data: PriceData; expiry: number }> = new Map();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch current price for a stock ticker
   */
  async getStockPrice(ticker: string): Promise<PriceData | null> {
    // Check cache first
    const cached = this.cache.get(ticker);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    try {
      const url = `${this.baseUrl}/${ticker}?interval=1d&range=1d`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (!response.ok) {
        console.error(`Yahoo Finance API error for ${ticker}: ${response.status}`);
        return null;
      }

      const data: YahooQuoteResponse = await response.json();

      if (data.chart.error || !data.chart.result || data.chart.result.length === 0) {
        console.error(`No data found for ticker: ${ticker}`);
        return null;
      }

      const result = data.chart.result[0];
      const price = result.meta.regularMarketPrice;

      if (!price || isNaN(price)) {
        console.error(`Invalid price data for ${ticker}`);
        return null;
      }

      const priceData: PriceData = {
        symbol: ticker,
        price,
        currency: result.meta.currency || 'USD',
        timestamp: new Date(),
      };

      // Cache the result
      this.cache.set(ticker, {
        data: priceData,
        expiry: Date.now() + this.cacheDuration,
      });

      return priceData;
    } catch (error) {
      console.error(`Error fetching price for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Fetch prices for multiple tickers
   */
  async getMultipleStockPrices(tickers: string[]): Promise<Map<string, PriceData>> {
    const results = new Map<string, PriceData>();

    // Fetch prices with delay to avoid rate limiting
    for (const ticker of tickers) {
      const price = await this.getStockPrice(ticker);
      if (price) {
        results.set(ticker, price);
      }
      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }

  /**
   * Clear cache for a specific ticker or all tickers
   */
  clearCache(ticker?: string): void {
    if (ticker) {
      this.cache.delete(ticker);
    } else {
      this.cache.clear();
    }
  }
}

// Singleton instance
export const yahooFinanceService = new YahooFinanceService();
