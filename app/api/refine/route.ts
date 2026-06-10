import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai";
import { verifyLicense, getUsageKey, REPORT_LIMITS } from "@/lib/license";
import { buildSystemPrompt, repairJson } from "@/lib/prompt";
import { kvGet, kvIncr } from "@/lib/kv";
import { SECTION_LABELS } from "@/lib/types";
import type { SectionKey } from "@/lib/types";

export async function POST(req: NextRequest) {
  const licenseHeader = req.headers.get("x-conciply-license") ?? "";
  const license = verifyLicense(licenseHeader);
  if (!license) {
    return NextResponse.json({ error: "License required." }, { status: 401 });
  }

  // Check revocation
  const revoked = await kvGet<string>(`revoked:${licenseHeader}`);
  if (revoked) {
    return NextResponse.json({ error: "License revoked." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { sectionKey, input, currentContent, language } = body as {
    sectionKey: SectionKey; input: string; currentContent: string; language?: string;
  };

  if (!sectionKey || !input) {
    return NextResponse.json({ error: "sectionKey and input required." }, { status: 400 });
  }

  const sectionName = SECTION_LABELS[sectionKey] ?? sectionKey;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(language) },
        {
          role: "user",
          content: `The SaaS being analyzed: ${input}\n\nRegenerate ONLY the "${sectionName}" section. Current content:\n${currentContent}\n\nReturn a JSON object with a single key "${sectionKey}" containing the updated section data matching the original schema.`,
        },
      ],
      temperature: 0.8,
      // 4096 tokens for complex section regenerations — 1024 was too small
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      // Partial/malformed JSON — attempt structural repair before giving up
      data = repairJson(raw) as Record<string, unknown>;
    }

    // Increment refine quota using atomic INCR to avoid race conditions.
    // Refine calls share the monthly report quota with analyze calls.
    try {
      const usageKey = getUsageKey(licenseHeader, license.tier);
      const limit = REPORT_LIMITS[license.tier];
      await kvIncr(usageKey);
      const usedCount = (await kvGet<number>(usageKey)) ?? 0;
      const remaining = Math.max(0, limit - usedCount);
      return NextResponse.json({ section: data[sectionKey] ?? data, remaining });
    } catch {
      // KV unavailable — return result without quota info
      return NextResponse.json({ section: data[sectionKey] ?? data });
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
