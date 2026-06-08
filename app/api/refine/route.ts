import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai";
import { verifyLicense } from "@/lib/license";
import { buildSystemPrompt } from "@/lib/prompt";
import { kvGet } from "@/lib/kv";
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
    return NextResponse.json({ section: data[sectionKey] ?? data });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
