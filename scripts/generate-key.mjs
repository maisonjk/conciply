// Usage: node scripts/generate-key.mjs <tier> [customerId]
// Tiers: founder (5/mo), pro (20/mo), agency (60/mo)
// Example: node scripts/generate-key.mjs agency friend001

import { createHmac } from "crypto";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env.local");

// Read LICENSE_SECRET from .env.local
let secret = "";
try {
  const env = readFileSync(envPath, "utf8");
  const match = env.match(/^LICENSE_SECRET=(.+)$/m);
  secret = match?.[1]?.trim() ?? "";
} catch {}

if (!secret) {
  console.error("❌ LICENSE_SECRET not found in .env.local");
  process.exit(1);
}

const tier = process.argv[2];
const customerId = process.argv[3] ?? `user-${Date.now()}`;

if (!["founder", "pro", "agency"].includes(tier)) {
  console.error("❌ Usage: node scripts/generate-key.mjs <founder|pro|agency> [customerId]");
  process.exit(1);
}

const reportCount = 0;
const payload = `${tier}:${reportCount}:${customerId}`;
const sig = createHmac("sha256", secret).update(payload).digest("hex").slice(0, 32);
const key = Buffer.from(`${payload}:${sig}`).toString("base64url");

console.log(`\n✅ ${tier.toUpperCase()} license key generated`);
console.log(`   Customer: ${customerId}`);
console.log(`\n${key}\n`);
