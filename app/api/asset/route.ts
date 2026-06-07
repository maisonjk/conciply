import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai";
import { verifyLicense } from "@/lib/license";
import { SECTION_LABELS } from "@/lib/types";
import type { SectionKey, GrowthReport } from "@/lib/types";

export async function POST(req: NextRequest) {
  const licenseHeader = req.headers.get("x-conciply-license") ?? "";
  const license = verifyLicense(licenseHeader);
  if (!license || license.tier === "founder") {
    return NextResponse.json({ error: "Pro or Agency license required." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { sectionKey, input, report } = body as {
    sectionKey: SectionKey; input: string; report: GrowthReport;
  };

  if (!sectionKey || !input) {
    return NextResponse.json({ error: "sectionKey and input required." }, { status: 400 });
  }

  const sectionName = SECTION_LABELS[sectionKey] ?? sectionKey;
  const sectionData = JSON.stringify((report as unknown as Record<string, unknown>)[sectionKey] ?? {});

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a world-class growth consultant generating detailed, ready-to-use assets for any type of business — SaaS, content creators, e-commerce, agencies, or any idea. Be specific, actionable, and tailored to the described business. Each asset must be a plain string (full copy, script, or plan). Return only JSON.`,
        },
        {
          role: "user",
          content: `Business: ${input}\n\nSection "${sectionName}" summary:\n${sectionData}\n\nGenerate a deep-dive asset bundle for this section. Return a JSON object with key "assets" containing an array of strings — each a complete, ready-to-use item (full copy, scripts, or plans — not summaries). Every element must be a plain string, never a nested object.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 2048,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(raw);
    return NextResponse.json({ assets: data.assets ?? [] });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
