import { NextRequest, NextResponse } from "next/server";
import { verifyLicense } from "@/lib/license";
import { kvGet } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const key: string = body.key ?? "";

  if (!key) return NextResponse.json({ error: "Key required." }, { status: 400 });

  // If this is a Stripe checkout session ID, look up the real license key from KV
  let licenseKey = key;
  if (key.startsWith("cs_")) {
    const stored = await kvGet<string>(`license:${key}`);
    if (!stored) {
      return NextResponse.json(
        { error: "License not found. Your purchase may still be processing — wait a few seconds and try again." },
        { status: 404 }
      );
    }
    licenseKey = stored;
  }

  // Check revocation
  const revoked = await kvGet<string>(`revoked:${licenseKey}`);
  if (revoked) return NextResponse.json({ error: "License revoked." }, { status: 403 });

  const license = verifyLicense(licenseKey);
  if (!license) return NextResponse.json({ error: "Invalid license key." }, { status: 403 });

  // Return the actual license key so the client can save it
  return NextResponse.json({ tier: license.tier, reportCount: license.reportCount, licenseKey });
}
