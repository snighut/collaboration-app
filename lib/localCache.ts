// lib/localCache.ts

/**
 * Utility functions for localStorage-based caching of design data.
 */

export function getDesignCache<T = any>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = window.localStorage.getItem(key);
    if (!cached) return null;
    return JSON.parse(cached) as T;
  } catch {
    return null;
  }
}

export function setDesignCache<T = any>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function clearDesignCache(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
}
