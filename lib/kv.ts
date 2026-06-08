// KV via Upstash Redis REST API — works on any host, no SDK needed.
// Set KV_REST_API_URL and KV_REST_API_TOKEN from your Upstash dashboard.
// Falls back to a no-op if env vars are missing (dev without Redis).

const url = () => process.env.KV_REST_API_URL?.replace(/\/$/, "");
const token = () => process.env.KV_REST_API_TOKEN;

function isConfigured(): boolean {
  return !!(url() && token());
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

export async function kvSet(key: string, value: unknown): Promise<void> {
  if (!isConfigured()) return;
  const encoded = encodeURIComponent(key);
  const body = typeof value === "string" ? value : JSON.stringify(value);
  await fetch(`${url()}/set/${encoded}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "text/plain",
    },
    body,
  });
}
