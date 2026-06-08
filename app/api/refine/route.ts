import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai";
import { verifyLicense, REPORT_LIMITS, getUsageKey } from "@/lib/license";
import { buildSystemPrompt } from "@/lib/prompt";
import { kvGet, kvSet } from "@/lib/kv";
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

  // Check + increment quota (regen counts as 1 report)
  const usageKey = getUsageKey(licenseHeader, license.tier);
  const usedCount = (await kvGet<number>(usageKey)) ?? 0;
  const limit = REPORT_LIMITS[license.tier];
  if (usedCount >= limit) {
    const msg = license.tier === "agency"
      ? "Monthly report limit reached (500/month). Resets on the 1st."
      : "Report limit reached for your plan.";
    return NextResponse.json({ error: msg }, { status: 429 });
  }
  await kvSet(usageKey, usedCount + 1);

  const body = await req.json().catch(() => ({}));
  const { sectionKey, input, currentContent } = body as {
    sectionKey: SectionKey; input: string; currentContent: string;
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
        { role: "system", content: buildSystemPrompt() },
        {
          role: "user",
          content: `The SaaS being analyzed: ${input}\n\nRegenerate ONLY the "${sectionName}" section. Current content:\n${currentContent}\n\nReturn a JSON object with a single key "${sectionKey}" containing the updated section data matching the original schema.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(raw);
    return NextResponse.json({
      section: data[sectionKey] ?? data,
      remaining: limit === Infinity ? Infinity : Math.max(0, limit - usedCount - 1),
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
