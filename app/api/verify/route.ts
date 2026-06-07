import { NextRequest, NextResponse } from "next/server";
import { verifyLicense } from "@/lib/license";
import { kvGet } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const key: string = body.key ?? "";

  if (!key) return NextResponse.json({ error: "Key required." }, { status: 400 });

  const revoked = await kvGet<boolean>(`revoked:${key}`);
  if (revoked) return NextResponse.json({ error: "License revoked." }, { status: 403 });

  const license = verifyLicense(key);
  if (!license) return NextResponse.json({ error: "Invalid license key." }, { status: 403 });

  return NextResponse.json({ tier: license.tier, reportCount: license.reportCount });
}
