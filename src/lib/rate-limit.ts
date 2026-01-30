const windowMs = 60_000; // 1 minute

interface Entry {
  timestamps: number[];
}

const store = new Map<string, Entry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 5 * 60_000).unref?.();

export function rateLimit(key: string, maxRequests: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { timestamps: [now] });
    return true;
  }

  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
  if (entry.timestamps.length >= maxRequests) {
    return false;
  }

  entry.timestamps.push(now);
  return true;
}
