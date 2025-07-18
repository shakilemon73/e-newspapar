/**
 * Simple API response caching utility
 * Prevents excessive API calls and improves performance
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
}

class APICache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

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
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const now = Date.now();
    if (now > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    const now = Date.now();
    if (now > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    this.cleanup(); // Clean up expired entries first
    return this.cache.size;
  }
}

// Global cache instance
export const apiCache = new APICache();

// Auto-cleanup every 10 minutes
setInterval(() => {
  apiCache.cleanup();
  console.log(`[Cache] Cleaned up. Current size: ${apiCache.size()}`);
}, 10 * 60 * 1000);

export default apiCache;