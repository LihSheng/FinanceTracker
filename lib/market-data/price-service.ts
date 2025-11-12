/**
 * Unified price service that handles all asset types
 * Provides caching, error handling, and fallback mechanisms
 */

import { yahooFinanceService } from './yahoo-finance';
import { cryptoService } from './crypto';
import { commodityService } from './commodities';

export interface UnifiedPriceData {
  symbol: string;
  price: number;
  currency: string;
  assetType: 'stock' | 'crypto' | 'commodity' | 'cash';
  timestamp: Date;
  source: string;
}

export class PriceService {
  /**
   * Fetch price for any asset type
   */
  async getPrice(
    symbol: string,
    assetType: 'stock' | 'crypto' | 'gold' | 'cash' | 'other',
    currency: string = 'USD'
  ): Promise<UnifiedPriceData | null> {
    try {
      switch (assetType) {
        case 'stock':
          return await this.getStockPrice(symbol);
        
        case 'crypto':
          return await this.getCryptoPrice(symbol, currency);
        
        case 'gold':
          return await this.getCommodityPrice(symbol, currency);
        
        case 'cash':
          // Cash always has a price of 1 in its own currency
          return {
            symbol,
            price: 1,
            currency,
            assetType: 'cash',
            timestamp: new Date(),
            source: 'static',
          };
        
        default:
          console.warn(`Unsupported asset type: ${assetType}`);
          return null;
      }
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Fetch stock price
   */
  private async getStockPrice(ticker: string): Promise<UnifiedPriceData | null> {
    const data = await yahooFinanceService.getStockPrice(ticker);
    
    if (!data) {
      return null;
    }

    return {
      symbol: data.symbol,
      price: data.price,
      currency: data.currency,
      assetType: 'stock',
      timestamp: data.timestamp,
      source: 'yahoo-finance',
    };
  }

  /**
   * Fetch cryptocurrency price
   */
  private async getCryptoPrice(
    symbol: string,
    currency: string
  ): Promise<UnifiedPriceData | null> {
    const currencyLower = currency.toLowerCase() as 'usd' | 'myr' | 'sgd';
    const data = await cryptoService.getCryptoPrice(symbol, currencyLower);
    
    if (!data) {
      return null;
    }

    return {
      symbol: data.symbol,
      price: data.price,
      currency: data.currency,
      assetType: 'crypto',
      timestamp: data.timestamp,
      source: 'coingecko',
    };
  }

  /**
   * Fetch commodity price
   */
  private async getCommodityPrice(
    symbol: string,
    currency: string
  ): Promise<UnifiedPriceData | null> {
    const currencyUpper = currency.toUpperCase() as 'USD' | 'MYR' | 'SGD';
    const data = await commodityService.getCommodityPrice(symbol, currencyUpper);
    
    if (!data) {
      return null;
    }

    return {
      symbol: data.symbol,
      price: data.price,
      currency: data.currency,
      assetType: 'commodity',
      timestamp: data.timestamp,
      source: 'goldapi',
    };
  }

  /**
   * Fetch prices for multiple assets
   */
  async getMultiplePrices(
    assets: Array<{ symbol: string; assetType: string; currency: string }>
  ): Promise<Map<string, UnifiedPriceData>> {
    const results = new Map<string, UnifiedPriceData>();

    // Group by asset type for batch fetching
    const stocks = assets.filter((a) => a.assetType === 'stock');
    const cryptos = assets.filter((a) => a.assetType === 'crypto');
    const commodities = assets.filter((a) => a.assetType === 'gold');

    // Fetch stocks
    if (stocks.length > 0) {
      const stockPrices = await yahooFinanceService.getMultipleStockPrices(
        stocks.map((s) => s.symbol)
      );
      stockPrices.forEach((data, symbol) => {
        results.set(symbol, {
          symbol: data.symbol,
          price: data.price,
          currency: data.currency,
          assetType: 'stock',
          timestamp: data.timestamp,
          source: 'yahoo-finance',
        });
      });
    }

    // Fetch cryptos (group by currency)
    const cryptoByCurrency = new Map<string, string[]>();
    cryptos.forEach((c) => {
      const curr = c.currency.toLowerCase();
      if (!cryptoByCurrency.has(curr)) {
        cryptoByCurrency.set(curr, []);
      }
      cryptoByCurrency.get(curr)!.push(c.symbol);
    });

    for (const [currency, symbols] of Array.from(cryptoByCurrency.entries())) {
      const cryptoPrices = await cryptoService.getMultipleCryptoPrices(
        symbols,
        currency as 'usd' | 'myr' | 'sgd'
      );
      cryptoPrices.forEach((data, symbol) => {
        results.set(symbol, {
          symbol: data.symbol,
          price: data.price,
          currency: data.currency,
          assetType: 'crypto',
          timestamp: data.timestamp,
          source: 'coingecko',
        });
      });
    }

    // Fetch commodities individually
    for (const commodity of commodities) {
      const price = await this.getCommodityPrice(commodity.symbol, commodity.currency);
      if (price) {
        results.set(commodity.symbol, price);
      }
    }

    return results;
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    yahooFinanceService.clearCache();
    cryptoService.clearCache();
    commodityService.clearCache();
  }

  /**
   * Clear cache for specific symbol
   */
  clearCache(symbol: string): void {
    yahooFinanceService.clearCache(symbol);
    cryptoService.clearCache(symbol);
    commodityService.clearCache(symbol);
  }
}

// Singleton instance
export const priceService = new PriceService();
