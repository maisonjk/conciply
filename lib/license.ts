import { createHmac } from "crypto";
import type { LicenseTier } from "./types";

const SECRET = process.env.LICENSE_SECRET ?? "dev-secret-change-me";

export function signLicense(tier: LicenseTier, reportCount: number): string {
  const payload = `${tier}:${reportCount}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 32);
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyLicense(token: string): { tier: LicenseTier; reportCount: number } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [tier, countStr, sig] = parts;
    const payload = `${tier}:${countStr}`;
    const expected = createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 32);
    if (sig !== expected) return null;
    if (!["founder","pro","agency"].includes(tier)) return null;
    return { tier: tier as LicenseTier, reportCount: parseInt(countStr, 10) };
  } catch {
    return null;
  }
}

export const REPORT_LIMITS: Record<LicenseTier, number> = {
  founder: 5,
  pro: 20,
  agency: Infinity,
};
