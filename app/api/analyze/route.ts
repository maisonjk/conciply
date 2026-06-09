import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { checkRateLimit, getRemainingAttempts } from "@/lib/ratelimit";
import { verifyLicense, REPORT_LIMITS, getUsageKey } from "@/lib/license";
import { buildSystemPrompt, buildUserMessage, parseReport } from "@/lib/prompt";
import { kvGet, kvSet } from "@/lib/kv";
import { FREE_SECTIONS } from "@/lib/types";
import type { GrowthReport, SectionKey } from "@/lib/types";

const FREE_LIMIT = parseInt(process.env.FREE_TOTAL_LIMIT ?? "1", 10);

// Tier-based model config
// Agency: high volume (500/mo) → gpt-4o-mini keeps cost ~$0.006/report ($3 total)
// Pro/Founder: low volume → gpt-4o gives premium quality (~$0.10-0.15/report)
// Free: gpt-4o-mini, fewer tokens
type TierConfig = { model: string; maxTokens: number };
const TIER_CONFIG: Record<string, TierConfig> = {
  agency:  { model: "gpt-4o",      maxTokens: 14000 },
  pro:     { model: "gpt-4o",      maxTokens: 14000 },
  founder: { model: "gpt-4o",      maxTokens: 14000 },
  free:    { model: "gpt-4o-mini", maxTokens: 14000 },
};
const DEFAULT_MODEL  = process.env.OPENAI_MODEL  || "gpt-4o";
const DEFAULT_TOKENS = 14000;

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
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

  const licenseHeader = req.headers.get("x-conciply-license") ?? "";
  const license = licenseHeader ? verifyLicense(licenseHeader) : null;
  const ip = getIP(req);

  // ── Quota checks (before streaming starts) ────────────────────────────
  if (!license) {
    const allowed = await checkRateLimit(ip, FREE_LIMIT);
    if (!allowed) {
      return NextResponse.json({ paywall: true, error: "Free limit reached." }, { status: 429 });
    }
  } else {
    const revoked = await kvGet<string>(`revoked:${licenseHeader}`);
    if (revoked) {
      return NextResponse.json({ paywall: true, error: "License revoked." }, { status: 403 });
    }
    const usageKey = getUsageKey(licenseHeader, license.tier);
    const usedCount = (await kvGet<number>(usageKey)) ?? 0;
    const limit = REPORT_LIMITS[license.tier];
    if (usedCount >= limit) {
      const limitMap: Record<string, string> = {
        agency:  "Monthly limit reached (100/month). Resets on the 1st.",
        pro:     "Monthly limit reached (20/month). Resets on the 1st.",
        founder: "Monthly limit reached (5/month). Resets on the 1st.",
      };
      const msg = limitMap[license.tier] ?? "Report limit reached for your plan.";
      return NextResponse.json({ paywall: true, error: msg }, { status: 429 });
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

        for await (const chunk of openaiStream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          accumulated += delta;
          chunksSinceLastPing++;
          // Send a progress ping every ~300 chars so client can animate
          if (chunksSinceLastPing >= 30) {
            send({ type: "chunk" });
            chunksSinceLastPing = 0;
          }
        }

        // Parse the completed JSON
        const fullReport = parseReport(accumulated);

        // Increment quota and compute remaining
        let remaining: number = Infinity;
        if (license) {
          const usageKey = getUsageKey(licenseHeader, license.tier);
          const usedCount = (await kvGet<number>(usageKey)) ?? 0;
          await kvSet(usageKey, usedCount + 1);
          const limit = REPORT_LIMITS[license.tier];
          remaining = limit === Infinity ? Infinity : Math.max(0, limit - usedCount - 1);

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
