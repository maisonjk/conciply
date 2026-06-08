import { createHmac } from "crypto";
import type { LicenseTier } from "./types";

const SECRET = process.env.LICENSE_SECRET ?? "dev-secret-change-me";

// v2 format: tier:reportCount:customerId:sig  (customerId may be empty string for legacy)
// v1 format: tier:reportCount:sig  (legacy — no customerId)
export function signLicense(tier: LicenseTier, reportCount: number, customerId = ""): string {
  const payload = `${tier}:${reportCount}:${customerId}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 32);
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyLicense(token: string): {
  tier: LicenseTier;
  reportCount: number;
  customerId: string;
} | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");

    let tier: string, countStr: string, customerId: string, sig: string;

    if (parts.length === 4) {
      // v2: tier:reportCount:customerId:sig
      [tier, countStr, customerId, sig] = parts;
    } else if (parts.length === 3) {
      // v1 legacy: tier:reportCount:sig (no customerId)
      [tier, countStr, sig] = parts;
      customerId = "";
    } else {
      return null;
    }

    // Verify signature against whichever format was used
    const payload = parts.length === 4
      ? `${tier}:${countStr}:${customerId}`
      : `${tier}:${countStr}`;
    const expected = createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 32);
    if (sig !== expected) return null;
    if (!["founder", "pro", "agency"].includes(tier)) return null;

    return { tier: tier as LicenseTier, reportCount: parseInt(countStr, 10), customerId };
  } catch {
    return null;
  }
}

export const REPORT_LIMITS: Record<LicenseTier, number> = {
  founder: 5,
  pro: 20,
  agency: 500, // per month — see getUsageKey()
};

// Agency uses a monthly key so the cap resets automatically each month.
// Founder/Pro use a lifetime key (they paid for N reports total).
export function getUsageKey(licenseKey: string, tier: LicenseTier): string {
  if (tier === "agency") {
    const now = new Date();
    const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    return `usage:${licenseKey}:${month}`;
  }
  return `usage:${licenseKey}`;
}
