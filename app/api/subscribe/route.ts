import { NextRequest, NextResponse } from "next/server";
import { kvLpush } from "@/lib/kv";

// Rate-limit: store a short-lived key per IP to prevent spam
import { kvGet, kvSet } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, source } = body as { email?: string; source?: string };

  // Basic validation
  if (!email || typeof email !== "string" || !email.includes("@") || email.length > 254) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();

  // Rate limit: 1 subscribe per IP per hour
  const ip =
    req.headers.get("x-vercel-forwarded-for")?.split(",").pop()?.trim() ??
    req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ??
    "unknown";

  const rateLimitKey = `subscribe-rl:${ip}`;
  const already = await kvGet<string>(rateLimitKey);
  if (already) {
    // Silently succeed so we don't leak info about duplicates
    return NextResponse.json({ ok: true });
  }
  await kvSet(rateLimitKey, "1", 3600); // 1 hour TTL

  // Store email in Redis list "leads" — newest first
  const entry = JSON.stringify({
    email: normalised,
    source: source ?? "workspace",
    ts: new Date().toISOString(),
  });
  await kvLpush("leads", entry);

  return NextResponse.json({ ok: true });
}
