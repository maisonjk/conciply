type KVClient = { get: (k: string) => Promise<unknown>; set: (k: string, v: unknown) => Promise<void> };

let kv: KVClient | null = null;

async function getKV(): Promise<KVClient> {
  if (kv) return kv;
  if (!process.env.KV_REST_API_URL) {
    kv = { get: async () => null, set: async () => {} };
    return kv;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires
    const mod: any = require("@vercel/kv");
    if (mod?.kv) {
      kv = mod.kv as KVClient;
    } else {
      kv = { get: async () => null, set: async () => {} };
    }
  } catch {
    kv = { get: async () => null, set: async () => {} };
  }
  return kv;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  return ((await getKV()).get(key)) as T | null;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  return (await getKV()).set(key, value);
}
