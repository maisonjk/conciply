import { createHmac, timingSafeEqual } from "crypto";
import type { LicenseTier } from "./types";

// SECURITY: LICENSE_SECRET must be set to a cryptographically random value
// in production. Validated at request time (not module load time) so that
// Next.js build/page-data collection doesn't throw before env vars are read.
function getSecret(): string {
  const raw = process.env.LICENSE_SECRET;
  if (!raw || raw === "dev-secret-change-me") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[license] LICENSE_SECRET is not set or is the default placeholder. " +
        "Set a random 32-byte hex string in your environment variables before deploying."
      );
    }
    // Dev-only warning — does not block local development or builds
    console.warn("[license] WARNING: LICENSE_SECRET is not set. Using insecure default. DO NOT deploy this.");
    return "dev-secret-change-me";
  }
  return raw;
}

// v2 format: tier:reportCount:customerId:sig  (customerId may be empty string for legacy)
// v1 format: tier:reportCount:sig  (legacy — no customerId)
export function signLicense(tier: LicenseTier, reportCount: number, customerId = ""): string {
  const payload = `${tier}:${reportCount}:${customerId}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex").slice(0, 32);
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
    const expected = createHmac("sha256", getSecret()).update(payload).digest("hex").slice(0, 32);
    // Use constant-time comparison to prevent timing-based HMAC oracle attacks
    if (sig.length !== expected.length) return null;
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    if (!["founder", "pro", "agency"].includes(tier)) return null;

    return { tier: tier as LicenseTier, reportCount: parseInt(countStr, 10), customerId };
  } catch {
    return null;
  }
}

export const REPORT_LIMITS: Record<LicenseTier, number> = {
  founder: 5,   // per month
  pro: 20,      // per month
  agency: 60,   // per month
};

// All tiers use monthly keys so the quota resets on the 1st of each month.
// These are recurring subscriptions — customers renew and their quota renews too.
export function getUsageKey(licenseKey: string, tier: LicenseTier): string {
  const now = new Date();
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return `usage:${licenseKey}:${month}`;
}
