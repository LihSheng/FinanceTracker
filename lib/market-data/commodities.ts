/**
 * Commodity price fetching (Gold, Silver, etc.)
 * Uses Metals-API or similar service
 */

interface CommodityPriceData {
  symbol: string;
  price: number;
  currency: string;
  unit: string; // e.g., 'oz' for ounce
  timestamp: Date;
}

export class CommodityService {
  private cache: Map<string, { data: CommodityPriceData; expiry: number }> = new Map();
  private cacheDuration = 60 * 60 * 1000; // 1 hour (commodities don't change as frequently)

  /**
   * Fetch gold price using a free API
   * Falls back to a mock price if API is unavailable
   */
  async getGoldPrice(currency: 'USD' | 'MYR' | 'SGD' = 'USD'): Promise<CommodityPriceData | null> {
    const cacheKey = `GOLD-${currency}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    try {
      // Using goldapi.io free tier (limited requests)
      // Alternative: metals-api.com or goldprice.org
      const url = `https://www.goldapi.io/api/XAU/${currency}`;
      
      const apiKey = process.env.GOLD_API_KEY;
      
      if (!apiKey) {
        console.warn('GOLD_API_KEY not set, using fallback method');
        return this.getGoldPriceFallback(currency);
      }

      const response = await fetch(url, {
        headers: {
          'x-access-token': apiKey,
        },
      });

      if (!response.ok) {
        console.error(`Gold API error: ${response.status}`);
        return this.getGoldPriceFallback(currency);
      }

      const data = await response.json();

      if (!data.price) {
        console.error('Invalid gold price data');
        return this.getGoldPriceFallback(currency);
      }

      const priceData: CommodityPriceData = {
        symbol: 'GOLD',
        price: data.price,
        currency,
        unit: 'oz',
        timestamp: new Date(),
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: priceData,
        expiry: Date.now() + this.cacheDuration,
      });

      return priceData;
    } catch (error) {
      console.error('Error fetching gold price:', error);
      return this.getGoldPriceFallback(currency);
    }
  }

  /**
   * Fallback method using Yahoo Finance for gold ETF (GLD) as proxy
   */
  private async getGoldPriceFallback(currency: string): Promise<CommodityPriceData | null> {
    try {
      // Use GLD ETF as a proxy for gold price
      const url = 'https://query1.finance.yahoo.com/v8/finance/chart/GLD?interval=1d&range=1d';
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const result = data.chart.result?.[0];
      
      if (!result || !result.meta.regularMarketPrice) {
        return null;
      }

      // GLD price is roughly 1/10th of gold price per ounce
      const estimatedGoldPrice = result.meta.regularMarketPrice * 10;

      const priceData: CommodityPriceData = {
        symbol: 'GOLD',
        price: estimatedGoldPrice,
        currency: 'USD', // GLD is in USD
        unit: 'oz',
        timestamp: new Date(),
      };

      return priceData;
    } catch (error) {
      console.error('Fallback gold price fetch failed:', error);
      return null;
    }
  }

  /**
   * Fetch silver price
   */
  async getSilverPrice(currency: 'USD' | 'MYR' | 'SGD' = 'USD'): Promise<CommodityPriceData | null> {
    const cacheKey = `SILVER-${currency}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    try {
      const apiKey = process.env.GOLD_API_KEY;
      
      if (!apiKey) {
        console.warn('GOLD_API_KEY not set for silver price');
        return null;
      }

      const url = `https://www.goldapi.io/api/XAG/${currency}`;

      const response = await fetch(url, {
        headers: {
          'x-access-token': apiKey,
        },
      });

      if (!response.ok) {
        console.error(`Silver API error: ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (!data.price) {
        console.error('Invalid silver price data');
        return null;
      }

      const priceData: CommodityPriceData = {
        symbol: 'SILVER',
        price: data.price,
        currency,
        unit: 'oz',
        timestamp: new Date(),
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: priceData,
        expiry: Date.now() + this.cacheDuration,
      });

      return priceData;
    } catch (error) {
      console.error('Error fetching silver price:', error);
      return null;
    }
  }

  /**
   * Get commodity price by symbol
   */
  async getCommodityPrice(
    symbol: string,
    currency: 'USD' | 'MYR' | 'SGD' = 'USD'
  ): Promise<CommodityPriceData | null> {
    const upperSymbol = symbol.toUpperCase();

    switch (upperSymbol) {
      case 'GOLD':
      case 'XAU':
        return this.getGoldPrice(currency);
      case 'SILVER':
      case 'XAG':
        return this.getSilverPrice(currency);
      default:
        console.error(`Unsupported commodity: ${symbol}`);
        return null;
    }
  }

  /**
   * Clear cache for a specific commodity or all commodities
   */
  clearCache(symbol?: string): void {
    if (symbol) {
      ['USD', 'MYR', 'SGD'].forEach((currency) => {
        this.cache.delete(`${symbol}-${currency}`);
      });
    } else {
      this.cache.clear();
    }
  }
}

// Singleton instance
export const commodityService = new CommodityService();
