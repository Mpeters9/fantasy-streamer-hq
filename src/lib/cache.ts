type CacheEntry<T> = { value: T; expires: number };
const mem = new Map<string, CacheEntry<any>>();

export function getCache<T>(key: string): T | null {
  const e = mem.get(key);
  if (!e) return null;
  if (Date.now() > e.expires) { mem.delete(key); return null; }
  return e.value as T;
}

export function setCache<T>(key: string, value: T, ttlMs = 5*60*1000) {
  mem.set(key, { value, expires: Date.now() + ttlMs });
}
