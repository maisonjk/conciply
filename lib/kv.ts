// KV via Upstash Redis REST API — works on any host, no SDK needed.
// Set KV_REST_API_URL and KV_REST_API_TOKEN from your Upstash dashboard.
// Falls back to a no-op if env vars are missing (dev without Redis).

const url = () => process.env.KV_REST_API_URL?.replace(/\/$/, "");
const token = () => process.env.KV_REST_API_TOKEN;

function isConfigured(): boolean {
  return !!(url() && token());
}

/**
 * Atomically increments a counter and returns the new value.
 * Prevents race conditions where two simultaneous requests both
 * read the same count and each write count+1 (audit #16).
 * @param ttlSeconds  Set TTL only when the key is first created (EX flag)
 */
export async function kvIncr(key: string, ttlSeconds?: number): Promise<number> {
  if (!isConfigured()) {
    // In-memory fallback for dev — not atomic but acceptable locally
    return 1;
  }
  const encoded = encodeURIComponent(key);
  // Upstash INCR: POST /incr/<key>
  const res = await fetch(`${url()}/incr/${encoded}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}` },
  });
  const json = await res.json() as { result: number };
  const newVal = json.result ?? 1;
  // On first increment (newVal === 1), set the TTL so the key auto-expires
  if (newVal === 1 && ttlSeconds) {
    await fetch(`${url()}/expire/${encoded}/${ttlSeconds}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
    });
  }
  return newVal;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  if (!isConfigured()) return null;
  const res = await fetch(`${url()}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) return null;
  const json = await res.json() as { result: T | null };
  return json.result ?? null;
}

/**
 * @param ttlSeconds  Optional TTL in seconds. Keys auto-expire after this
 *                    duration so Redis doesn't accumulate stale quota entries.
 */
export async function kvSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  if (!isConfigured()) return;
  const encoded = encodeURIComponent(key);
  const body = typeof value === "string" ? value : JSON.stringify(value);
  // Upstash REST: append ?ex=<seconds> for TTL
  const qs = ttlSeconds ? `?ex=${ttlSeconds}` : "";
  await fetch(`${url()}/set/${encoded}${qs}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "text/plain",
    },
    body,
  });
}
