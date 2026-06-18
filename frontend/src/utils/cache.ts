const CACHE_PREFIX = 'alphine_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export function getCached<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > entry.ttl) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function setCache<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL
): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl };
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage full, silently fail
  }
}

export function clearCache(pattern?: string): void {
  const prefix = CACHE_PREFIX + (pattern || '');
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(prefix)) {
      sessionStorage.removeItem(key);
    }
  }
}
