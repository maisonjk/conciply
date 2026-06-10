import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { checkRateLimit, getRemainingAttempts } from "@/lib/ratelimit";
import { verifyLicense, REPORT_LIMITS, getUsageKey } from "@/lib/license";
import { buildSystemPrompt, buildUserMessage, parseReport } from "@/lib/prompt";
import { kvGet, kvSet, kvIncr } from "@/lib/kv";
import { FREE_SECTIONS } from "@/lib/types";
import type { GrowthReport, SectionKey } from "@/lib/types";

const FREE_LIMIT = parseInt(process.env.FREE_TOTAL_LIMIT ?? "1", 10);

// Tier-based model config
// Agency: up to 60/mo · Pro: up to 20/mo · Founder: up to 5/mo
// All paid tiers use gpt-4o for full quality. Free uses gpt-4o-mini.
type TierConfig = { model: string; maxTokens: number };
const TIER_CONFIG: Record<string, TierConfig> = {
  agency:  { model: "gpt-4o",      maxTokens: 14000 },
  pro:     { model: "gpt-4o",      maxTokens: 14000 },
  founder: { model: "gpt-4o",      maxTokens: 14000 },
  free:    { model: "gpt-4o-mini", maxTokens: 14000 },
};
const DEFAULT_MODEL  = process.env.OPENAI_MODEL  || "gpt-4o";
const DEFAULT_TOKENS = 14000;

const TOP_KEYS = [
  "executiveSummary","marketAnalysis","competitorAnalysis","positioning",
  "growthOpportunities","acquisitionPlan","funnelImprovements","marketingAssets",
  "salesAssets","retentionStrategy","socialMediaStrategy","kpiDashboard",
  "topRoiActions","plan7Day","plan30Day","plan90Day","immediateActions",
];

function findCompletedSections(accumulated: string, sent: Set<string>): { key: string; data: unknown }[] {
  const completed: { key: string; data: unknown }[] = [];
  for (const key of TOP_KEYS) {
    if (sent.has(key)) continue;
    const idx = accumulated.indexOf(`"${key}"`);
    if (idx === -1) continue;
    let pos = accumulated.indexOf(":", idx + key.length + 2);
    if (pos === -1) continue;
    pos++;
    while (pos < accumulated.length && accumulated[pos] === " ") pos++;
    const open = accumulated[pos];
    if (open !== "{" && open !== "[") continue;
    const close = open === "{" ? "}" : "]";
    let depth = 0, inStr = false, esc = false, end = -1;
    for (let i = pos; i < accumulated.length; i++) {
      const ch = accumulated[i];
      if (esc)        { esc = false; continue; }
      if (ch === "\\" && inStr) { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr)      continue;
      if (ch === open)  depth++;
      else if (ch === close) { if (--depth === 0) { end = i; break; } }
    }
    if (end !== -1) {
      let data: unknown = null;
      try { data = JSON.parse(accumulated.slice(pos, end + 1)); } catch { /* leave null */ }
      completed.push({ key, data });
      sent.add(key);
    }
  }
  return completed;
}

function getIP(req: NextRequest): string {
  // SECURITY: x-forwarded-for is a comma-separated list where the CLIENT
  // controls the leftmost values. Infrastructure (Vercel/CDN) appends the
  // real client IP at the RIGHT. Always take the last value.
  // Taking [0] (the old behaviour) is trivially spoofable with:
  //   curl -H "x-forwarded-for: 1.2.3.4" ...
  //
  // On Vercel, x-vercel-forwarded-for contains only the verified client IP.
  const vercel = req.headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",").at(-1)!.trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",").at(-1)!.trim();

  return req.headers.get("x-real-ip") ?? "unknown";
}

function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const input: string = typeof body.input === "string" ? body.input.trim() : "";
  const language: string | undefined = typeof body.language === "string" ? body.language : undefined;

  if (input.length < 10 || input.length > 1000) {
    return NextResponse.json({ error: "Input must be 10–1000 characters." }, { status: 400 });
  }

  // ── Basic content moderation ─────────────────────────────────────────────
  // Block prompts that are clearly not business descriptions. This is a
  // lightweight heuristic — not a full content filter — to catch obvious
  // misuse before burning OpenAI tokens.
  const BLOCKED_PATTERNS = [
    // Prompt injection attempts
    /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/i,
    /you\s+are\s+now\s+(a|an)\s+/i,
    /act\s+as\s+(a|an)\s+/i,
    /jailbreak/i,
    /DAN\s+mode/i,
    // Explicit harmful content requests
    /\b(porn|pornography|adult\s+content|explicit\s+content|nude|nudity|sex\s+site)\b/i,
    /\b(weapons?|firearms?|guns?|bombs?|explosives?)\s+(shop|store|sell|buy|manufactur)/i,
    /\b(drugs?|narcotics?|cocaine|heroin|meth)\s+(sell|buy|deal|shop|store)/i,
    /\b(hack|phish|scam|fraud|steal)\s+(people|users|accounts|money|credit)/i,
  ];

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input)) {
      return NextResponse.json(
        { error: "This input cannot be processed. Please describe a legitimate business or idea." },
        { status: 400 }
      );
    }
  }

  const licenseHeader = req.headers.get("x-conciply-license") ?? "";
  const license = licenseHeader ? verifyLicense(licenseHeader) : null;
  const ip = getIP(req);

  // ── Quota checks (before streaming starts) ────────────────────────────
  if (!license) {
    const allowed = await checkRateLimit(ip, FREE_LIMIT);
    if (!allowed) {
      // Tell the client when the monthly quota resets (1st of next month, UTC midnight)
      const now = new Date();
      const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
      return NextResponse.json(
        { paywall: true, error: "Free limit reached.", resetAt },
        { status: 429 },
      );
    }
  } else {
    try {
      const revoked = await kvGet<string>(`revoked:${licenseHeader}`);
      if (revoked) {
        return NextResponse.json({ paywall: true, error: "License revoked." }, { status: 403 });
      }
      const usageKey = getUsageKey(licenseHeader, license.tier);
      const usedCount = (await kvGet<number>(usageKey)) ?? 0;
      const limit = REPORT_LIMITS[license.tier];
      if (usedCount >= limit) {
        const limitMap: Record<string, string> = {
          agency:  "Monthly limit reached (60/month). Resets on the 1st.",
          pro:     "Monthly limit reached (20/month). Resets on the 1st.",
          founder: "Monthly limit reached (5/month). Resets on the 1st.",
        };
        const msg = limitMap[license.tier] ?? "Report limit reached for your plan.";
        return NextResponse.json({ paywall: true, error: msg }, { status: 429 });
      }
    } catch {
      // KV unavailable — allow the request through rather than blocking paying customers.
      // Quota will be enforced again on the next request once KV recovers.
      console.warn("[analyze] KV quota check failed — allowing request through");
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured." }, { status: 500 });
  }

  // ── Stream ──���──────────────────────────────────────────────────────────
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) =>
        controller.enqueue(encoder.encode(sse(data)));

      try {
        const tierKey = license?.tier ?? "free";
        const cfg = TIER_CONFIG[tierKey] ?? { model: DEFAULT_MODEL, maxTokens: DEFAULT_TOKENS };

        const openaiStream = await getOpenAI().chat.completions.create({
          model: cfg.model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: buildSystemPrompt(language) },
            { role: "user",   content: buildUserMessage(input) },
          ],
          temperature: 0.7,
          max_tokens: cfg.maxTokens,
          stream: true,
        });

        let accumulated = "";
        let chunksSinceLastPing = 0;
        const sentSections = new Set<string>();

        for await (const chunk of openaiStream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          accumulated += delta;
          chunksSinceLastPing++;

          // Emit each section the moment it completes, with its parsed data
          const newSections = findCompletedSections(accumulated, sentSections);
          for (const { key, data } of newSections) send({ type: "section", key, data });

          // Send a progress ping every ~300 chars so client can animate
          if (chunksSinceLastPing >= 30) {
            send({ type: "chunk" });
            chunksSinceLastPing = 0;
          }
        }

        // Parse the completed JSON
        const fullReport = parseReport(accumulated);

        // Increment quota and compute remaining.
        // kvIncr is atomic — avoids race conditions where two simultaneous
        // completions both read the same count and each write count+1.
        let remaining: number = Infinity;
        if (license) {
          const usageKey = getUsageKey(licenseHeader, license.tier);
          const newCount = await kvIncr(usageKey);
          const limit = REPORT_LIMITS[license.tier];
          remaining = limit === Infinity ? Infinity : Math.max(0, limit - newCount);

          send({ type: "done", report: fullReport, remaining, tier: license.tier });
        } else {
          // Free tier — filter to free sections only
          const freeReport: Partial<GrowthReport> = {};
          for (const key of FREE_SECTIONS) {
            (freeReport as Record<SectionKey, unknown>)[key] =
              (fullReport as Record<SectionKey, unknown>)[key];
          }
          remaining = await getRemainingAttempts(ip, FREE_LIMIT);
          send({ type: "done", report: freeReport, remaining, tier: null });
        }
        // Flush: ensure the done event is written through any infrastructure buffering
        controller.enqueue(encoder.encode(": flush\n\n"));
      } catch (err) {
        send({ type: "error", error: err instanceof Error ? err.message : "Unknown error" });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
