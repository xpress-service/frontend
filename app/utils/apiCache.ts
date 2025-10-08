// Simple cache mechanism to avoid repeated API calls during navigation
interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
}

class APICache {
  private cache = new Map<string, CacheItem>();
  private defaultTTL = 30000; // 30 seconds default TTL

  set(key: string, data: any, ttl?: number): void {
    const now = Date.now();
    const expiry = now + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    const now = Date.now();
    if (now > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) return false;
    
    const now = Date.now();
    if (now > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear expired items
  cleanup(): void {
    const now = Date.now();
    this.cache.forEach((item, key) => {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    });
  }
}

// Export singleton instance
export const apiCache = new APICache();

// Helper function to create cache keys
export const createCacheKey = (endpoint: string, params?: Record<string, any>): string => {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const baseKey = `${userId}_${endpoint}`;
  
  if (params && Object.keys(params).length > 0) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${baseKey}_${paramString}`;
  }
  
  return baseKey;
};

// Cleanup expired cache items every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 5 * 60 * 1000);
}