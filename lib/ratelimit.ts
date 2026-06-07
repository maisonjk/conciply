const store = new Map<string, { count: number; reset: number }>();

export function checkRateLimit(ip: string, limit: number, windowMs = 86_400_000): boolean {
  const now = Date.now();
  const entry = store.get(ip);
  if (!entry || now > entry.reset) {
    store.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export function getRemainingAttempts(ip: string, limit: number): number {
  const entry = store.get(ip);
  if (!entry || Date.now() > entry.reset) return limit;
  return Math.max(0, limit - entry.count);
}
