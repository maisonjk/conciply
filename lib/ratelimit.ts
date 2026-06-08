// Rate limiting for free-tier IPs.
// Uses Upstash KV so the limit is enforced across all server instances/restarts.
// Falls back to in-memory if KV is not configured (local dev).

import { kvGet, kvSet } from "./kv";

const memStore = new Map<string, { count: number; reset: number }>();

// Returns true if the request is allowed, false if the limit is exceeded.
export async function checkRateLimit(ip: string, limit: number, windowMs = 86_400_000): Promise<boolean> {
  const key = `rl:${ip}`;
  const now = Date.now();

  // Try KV first (works across all instances)
  try {
    const raw = await kvGet<{ count: number; reset: number }>(key);
    if (!raw || now > raw.reset) {
      await kvSet(key, { count: 1, reset: now + windowMs });
      return true;
    }
    if (raw.count >= limit) return false;
    await kvSet(key, { count: raw.count + 1, reset: raw.reset });
    return true;
  } catch {
    // KV unavailable — fall back to in-memory (dev / misconfigured env)
    const entry = memStore.get(ip);
    if (!entry || now > entry.reset) {
      memStore.set(ip, { count: 1, reset: now + windowMs });
      return true;
    }
    if (entry.count >= limit) return false;
    entry.count++;
    return true;
  }
}

export async function getRemainingAttempts(ip: string, limit: number): Promise<number> {
  const key = `rl:${ip}`;
  const now = Date.now();
  try {
    const raw = await kvGet<{ count: number; reset: number }>(key);
    if (!raw || now > raw.reset) return limit;
    return Math.max(0, limit - raw.count);
  } catch {
    const entry = memStore.get(ip);
    if (!entry || Date.now() > entry.reset) return limit;
    return Math.max(0, limit - entry.count);
  }
}
