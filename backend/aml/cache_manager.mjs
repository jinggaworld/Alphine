/**
 * Groq Cache Manager
 * Phase 5 — Rate limit management for Groq free tier (14,400 req/day)
 * 
 * Caches AML analysis results to avoid hitting rate limits.
 * Default TTL: 5 minutes per user address.
 */
export class GroqCacheManager {
    constructor(ttlMs = 5 * 60 * 1000) {
        this.cache = new Map();
        this.ttl = ttlMs;
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Generate a cache key from user address and history
     */
    _getCacheKey(address, historyHash) {
        return `${address}:${historyHash}`;
    }

    /**
     * Generate a simple hash from transaction history
     */
    _hashHistory(history = []) {
        const recent = history.slice(0, 10);
        return recent
            .map(tx => `${tx.amount}:${tx.timestamp}`)
            .join('|');
    }

    /**
     * Get cached analysis result
     * @returns {Object|null} Cached data or null if not found/expired
     */
    get(address, history = []) {
        const key = this._getCacheKey(address, this._hashHistory(history));
        const entry = this.cache.get(key);

        if (!entry) {
            this.misses++;
            return null;
        }

        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }

        this.hits++;
        return entry.data;
    }

    /**
     * Cache an analysis result
     */
    set(address, history = [], data) {
        const key = this._getCacheKey(address, this._hashHistory(history));
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate: this.hits + this.misses > 0
                ? (this.hits / (this.hits + this.misses) * 100).toFixed(1) + '%'
                : '0%',
        };
    }

    /**
     * Clear all cached entries
     */
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }
}
