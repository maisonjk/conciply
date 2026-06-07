// KV store — supports Upstash Redis (Render/any) and Vercel KV
// Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for Render
// Set KV_REST_API_URL + KV_REST_API_TOKEN for Vercel

async function upstashRequest(method: "GET" | "SET", key: string, value?: unknown): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const endpoint = method === "GET"
    ? `${url}/get/${encodeURIComponent(key)}`
    : `${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}`;

  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json() as { result: unknown };
  if (method === "GET" && data.result !== null && data.result !== undefined) {
    try { return JSON.parse(data.result as string); } catch { return data.result; }
  }
  return data.result ?? null;
}

type KVClient = { get: (k: string) => Promise<unknown>; set: (k: string, v: unknown) => Promise<void> };

let _kv: KVClient | null = null;

async function getKV(): Promise<KVClient> {
  if (_kv) return _kv;

  // 1. Upstash Redis (works on Render and anywhere)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    _kv = {
      get: (k) => upstashRequest("GET", k),
      set: (k, v) => upstashRequest("SET", k, v).then(() => undefined),
    };
    return _kv;
  }

  // 2. Vercel KV (legacy)
  if (process.env.KV_REST_API_URL) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires
      const mod: any = require("@vercel/kv");
      if (mod?.kv) { _kv = mod.kv as KVClient; return _kv; }
    } catch { /* fall through */ }
  }

  // 3. No-op fallback (dev / unconfigured)
  _kv = { get: async () => null, set: async () => {} };
  return _kv;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  return ((await getKV()).get(key)) as T | null;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  return (await getKV()).set(key, value);
}
