import { useCallback, useRef, useEffect } from 'react';

interface CacheEntry<T> {
  args: any[];
  result: T;
  timestamp: number;
}

interface Options {
  maxAge?: number; // Maximum age of cached results in milliseconds
  maxSize?: number; // Maximum number of cached results
}

export function useMemoizedCallback<T>(
  callback: (...args: any[]) => T,
  deps: any[],
  options: Options = {}
) {
  const {
    maxAge = 5 * 60 * 1000, // 5 minutes default
    maxSize = 100
  } = options;

  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const lastCleanup = useRef<number>(Date.now());

  // Cleanup function to remove old entries
  const cleanup = useCallback(() => {
    const now = Date.now();
    const entries = Array.from(cache.current.entries());
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > maxAge) {
        cache.current.delete(key);
      }
    });

    // Remove oldest entries if cache is too large
    if (cache.current.size > maxSize) {
      const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const entriesToRemove = sortedEntries.slice(0, cache.current.size - maxSize);
      entriesToRemove.forEach(([key]) => cache.current.delete(key));
    }

    lastCleanup.current = now;
  }, [maxAge, maxSize]);

  // Clean up cache when dependencies change
  useEffect(() => {
    cache.current.clear();
  }, deps);

  return useCallback((...args: any[]) => {
    // Run cleanup if needed
    if (Date.now() - lastCleanup.current > maxAge) {
      cleanup();
    }

    // Create cache key from arguments
    const key = JSON.stringify(args);

    // Check cache
    const cached = cache.current.get(key);
    if (cached && Date.now() - cached.timestamp <= maxAge) {
      return cached.result;
    }

    // Compute new result
    const result = callback(...args);
    
    // Cache result
    cache.current.set(key, {
      args,
      result,
      timestamp: Date.now()
    });

    return result;
  }, [...deps, cleanup]);
