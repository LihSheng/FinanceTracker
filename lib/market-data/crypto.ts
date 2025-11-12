/**
 * Cryptocurrency price fetching using CoinGecko API
 * Free tier allows 10-30 calls/minute
 */

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    myr?: number;
    sgd?: number;
  };
}

interface CryptoPriceData {
  symbol: string;
  price: number;
  currency: string;
  timestamp: Date;
}

export class CryptoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cache: Map<string, { data: CryptoPriceData; expiry: number }> = new Map();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  // Map common crypto symbols to CoinGecko IDs
  private symbolToId: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDT: 'tether',
    BNB: 'binancecoin',
    SOL: 'solana',
    XRP: 'ripple',
    ADA: 'cardano',
    DOGE: 'dogecoin',
    MATIC: 'matic-network',
    DOT: 'polkadot',
    AVAX: 'avalanche-2',
    LINK: 'chainlink',
    UNI: 'uniswap',
    ATOM: 'cosmos',
    LTC: 'litecoin',
  };

  /**
   * Get CoinGecko ID from symbol
   */
  private getCoinId(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();
    return this.symbolToId[upperSymbol] || symbol.toLowerCase();
  }

  /**
   * Fetch current price for a cryptocurrency
   */
  async getCryptoPrice(
    symbol: string,
    currency: 'usd' | 'myr' | 'sgd' = 'usd'
  ): Promise<CryptoPriceData | null> {
    const cacheKey = `${symbol}-${currency}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    try {
      const coinId = this.getCoinId(symbol);
      const url = `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=${currency}`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`CoinGecko API error for ${symbol}: ${response.status}`);
        return null;
      }

      const data: CoinGeckoResponse = await response.json();

      if (!data[coinId] || !data[coinId][currency]) {
        console.error(`No price data found for ${symbol}`);
        return null;
      }

      const priceData: CryptoPriceData = {
        symbol: symbol.toUpperCase(),
        price: data[coinId][currency],
        currency: currency.toUpperCase(),
        timestamp: new Date(),
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: priceData,
        expiry: Date.now() + this.cacheDuration,
      });

      return priceData;
    } catch (error) {
      console.error(`Error fetching crypto price for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Fetch prices for multiple cryptocurrencies
   */
  async getMultipleCryptoPrices(
    symbols: string[],
    currency: 'usd' | 'myr' | 'sgd' = 'usd'
  ): Promise<Map<string, CryptoPriceData>> {
    const results = new Map<string, CryptoPriceData>();

    try {
      // Convert symbols to CoinGecko IDs
      const coinIds = symbols.map((s) => this.getCoinId(s));
      const url = `${this.baseUrl}/simple/price?ids=${coinIds.join(',')}&vs_currencies=${currency}`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`CoinGecko API error: ${response.status}`);
        return results;
      }

      const data: CoinGeckoResponse = await response.json();

      // Map results back to symbols
      symbols.forEach((symbol) => {
        const coinId = this.getCoinId(symbol);
        if (data[coinId] && data[coinId][currency]) {
          const priceData: CryptoPriceData = {
            symbol: symbol.toUpperCase(),
            price: data[coinId][currency],
            currency: currency.toUpperCase(),
            timestamp: new Date(),
          };
          results.set(symbol.toUpperCase(), priceData);

          // Cache individual results
          const cacheKey = `${symbol}-${currency}`;
          this.cache.set(cacheKey, {
            data: priceData,
            expiry: Date.now() + this.cacheDuration,
          });
        }
      });
    } catch (error) {
      console.error('Error fetching multiple crypto prices:', error);
    }

    return results;
  }

  /**
   * Clear cache for a specific symbol or all symbols
   */
  clearCache(symbol?: string): void {
    if (symbol) {
      // Clear all currency variants for this symbol
      ['usd', 'myr', 'sgd'].forEach((currency) => {
        this.cache.delete(`${symbol}-${currency}`);
      });
    } else {
      this.cache.clear();
    }
  }
}

// Singleton instance
export const cryptoService = new CryptoService();
