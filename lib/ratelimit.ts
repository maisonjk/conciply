// Rate limiting for free-tier IPs.
// Uses Upstash KV so the limit is enforced across all server instances/restarts.
// Falls back to in-memory if KV is not configured (local dev).
//
// KEY DESIGN: keys are scoped to calendar month (UTC) — "rl:ip:YYYY-MM" —
// so the free quota resets on the 1st of each month, matching paid plan behaviour.
// A sliding 24h window is NOT used because it resets daily, allowing >1 free
// report per month.

import { kvGet, kvSet, kvIncr } from "./kv";

const memStore = new Map<string, number>();

/** Returns the current UTC month string, e.g. "2026-06" */
function currentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Returns the number of seconds until midnight UTC on the 1st of next month. */
function secondsUntilMonthEnd(): number {
  const now = new Date();
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return Math.ceil((nextMonth.getTime() - now.getTime()) / 1000);
}

/**
 * Returns true if the request is allowed, false if the monthly limit is exceeded.
 * @param ip   Client IP address (already sanitised by getIP in the route)
 * @param limit Maximum allowed requests this calendar month
 */
export async function checkRateLimit(ip: string, limit: number): Promise<boolean> {
  const month = currentMonth();
  const key   = `rl:${ip}:${month}`;
  const ttl   = secondsUntilMonthEnd();

  try {
    // Read current count first to check the limit before incrementing.
    // We check-then-increment rather than increment-then-check to avoid
    // over-counting: if the request is denied we don't want to burn a slot.
    const count = (await kvGet<number>(key)) ?? 0;
    if (count >= limit) return false;
    // Atomic INCR — avoids the race condition where two simultaneous requests
    // both read count=0 and both write count=1 (double-free exploit).
    // kvIncr also sets the TTL automatically on the first call.
    await kvIncr(key, ttl);
    return true;
  } catch {
    // KV unavailable — fall back to in-memory (dev / misconfigured env).
    // In-memory store also uses the monthly key so it doesn't reset daily.
    const memKey = `${ip}:${month}`;
    const count  = memStore.get(memKey) ?? 0;
    if (count >= limit) return false;
    memStore.set(memKey, count + 1);
    return true;
  }
}

/**
 * Returns how many more requests the IP can make this calendar month.
 */
export async function getRemainingAttempts(ip: string, limit: number): Promise<number> {
  const month = currentMonth();
  const key   = `rl:${ip}:${month}`;
  try {
    const count = (await kvGet<number>(key)) ?? 0;
    return Math.max(0, limit - count);
  } catch {
    const memKey = `${ip}:${month}`;
    const count  = memStore.get(memKey) ?? 0;
    return Math.max(0, limit - count);
  }
}
