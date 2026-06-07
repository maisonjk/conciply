import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { verifyLicense } from "@/lib/license";

export async function POST(req: NextRequest) {
  const licenseHeader = req.headers.get("x-conciply-license") ?? "";
  const license = verifyLicense(licenseHeader);

  if (!license) {
    return NextResponse.json({ error: "Invalid or missing license key." }, { status: 401 });
  }

  if (!license.customerId) {
    return NextResponse.json(
      { error: "No billing account linked to this license. Please contact hello@conciply.com." },
      { status: 400 }
    );
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? req.nextUrl.origin;

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: license.customerId,
      return_url: `${base}/workspace`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to open billing portal." },
      { status: 500 }
    );
  }
}
