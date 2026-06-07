import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai";
import { checkRateLimit, getRemainingAttempts } from "@/lib/ratelimit";
import { verifyLicense, REPORT_LIMITS } from "@/lib/license";
import { buildSystemPrompt, buildUserMessage, parseReport } from "@/lib/prompt";
import { kvGet, kvSet } from "@/lib/kv";
import { FREE_SECTIONS } from "@/lib/types";
import type { GrowthReport, SectionKey } from "@/lib/types";

const FREE_LIMIT = parseInt(process.env.FREE_TOTAL_LIMIT ?? "1", 10);

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
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

  if (!license) {
    const allowed = checkRateLimit(ip, FREE_LIMIT);
    if (!allowed) {
      return NextResponse.json({ paywall: true, error: "Free limit reached." }, { status: 429 });
    }
  } else {
    const limit = REPORT_LIMITS[license.tier];
    // Check revocation
    const revoked = await kvGet<string>(`revoked:${licenseHeader}`);
    if (revoked) {
      return NextResponse.json({ paywall: true, error: "License revoked." }, { status: 403 });
    }
    // Track usage in KV (source of truth for report counts)
    const usageKey = `usage:${licenseHeader}`;
    const usedCount = (await kvGet<number>(usageKey)) ?? 0;
    if (usedCount >= limit) {
      return NextResponse.json({ paywall: true, error: "Report limit reached for your plan." }, { status: 429 });
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured." }, { status: 500 });
  }

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(language) },
        { role: "user",   content: buildUserMessage(input) },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const fullReport = parseReport(raw);

    if (!license) {
      const freeReport: Partial<GrowthReport> = {};
      for (const key of FREE_SECTIONS) {
        (freeReport as Record<SectionKey, unknown>)[key] =
          (fullReport as Record<SectionKey, unknown>)[key];
      }
      const remaining = getRemainingAttempts(ip, FREE_LIMIT);
      return NextResponse.json({ report: freeReport, remaining, tier: null });
    }

    // Increment KV usage counter
    const usageKey = `usage:${licenseHeader}`;
    const usedCount = (await kvGet<number>(usageKey)) ?? 0;
    await kvSet(usageKey, usedCount + 1);
    const limit = REPORT_LIMITS[license.tier];

    return NextResponse.json({
      report: fullReport,
      remaining: limit === Infinity ? Infinity : Math.max(0, limit - usedCount - 1),
      tier: license.tier,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
