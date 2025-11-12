interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class InsightCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTLMinutes: number = 60) {
    this.cache = new Map();
    this.defaultTTL = defaultTTLMinutes * 60 * 1000; // Convert to milliseconds
  }

  set<T>(key: string, data: T, ttlMinutes?: number): void {
    const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : this.defaultTTL;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create singleton instance
export const insightCache = new InsightCache(60); // 60 minutes default TTL

// Run cleanup every 10 minutes
if (typeof window === 'undefined') {
  // Only run on server
  setInterval(() => {
    insightCache.cleanup();
  }, 10 * 60 * 1000);
}

// Helper functions for specific insight types
export function getCachedHealthScore(userId: string) {
  return insightCache.get(`health-score:${userId}`);
}

export function setCachedHealthScore(userId: string, data: any, ttlMinutes?: number) {
  insightCache.set(`health-score:${userId}`, data, ttlMinutes);
}

export function getCachedRebalancing(userId: string) {
  return insightCache.get(`rebalancing:${userId}`);
}

export function setCachedRebalancing(userId: string, data: any, ttlMinutes?: number) {
  insightCache.set(`rebalancing:${userId}`, data, ttlMinutes);
}

export function getCachedInsights(userId: string) {
  return insightCache.get(`insights:${userId}`);
}

export function setCachedInsights(userId: string, data: any, ttlMinutes?: number) {
  insightCache.set(`insights:${userId}`, data, ttlMinutes);
}

export function invalidateUserCache(userId: string) {
  insightCache.delete(`health-score:${userId}`);
  insightCache.delete(`rebalancing:${userId}`);
  insightCache.delete(`insights:${userId}`);
}
