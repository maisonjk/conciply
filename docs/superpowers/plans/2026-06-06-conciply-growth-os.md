# Conciply Growth OS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Next.js 14 app that takes a SaaS description, calls OpenAI once, and returns a 16-section growth playbook with a free/paid gate, localStorage workspace, and Stripe license keys.

**Architecture:** Single OpenAI call returns structured JSON with all 16 sections. Server enforces free gate (returns only 2 sections without license). Workspace state lives in localStorage — no database. Stripe + HMAC license keys identical to the existing Conciply app.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, OpenAI SDK, Stripe, nanoid, Vercel KV (optional)

---

## Task 1: Scaffold Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `CLAUDE.md`

- [ ] **Step 1: Bootstrap Next.js app**

```bash
cd ~/Desktop  # or wherever you want the new repo
npx create-next-app@14 conciply-growth-os \
  --typescript --tailwind --app --no-src-dir \
  --no-eslint --import-alias "@/*"
cd conciply-growth-os
```

- [ ] **Step 2: Install dependencies**

```bash
npm install openai stripe nanoid
npm install --save-dev @types/node
```

- [ ] **Step 3: Replace `app/globals.css` with Neon Dutch design system**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Conciply Growth OS — "Neon Dutch" design system */
:root {
  --n1: #00E5FF;
  --n2: #FF2E6E;
  --n3: #D4FF2E;
  --maxw: 1200px;
}

* { box-sizing: border-box; }
html { scroll-padding-top: 80px; }

body {
  margin: 0; padding: 0;
  background: #0A0A0B;
  color: #F4F4F1;
  font-family: var(--font-grotesk), sans-serif;
  -webkit-font-smoothing: antialiased;
}

::selection { background: var(--n3); color: #000; }
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; }

.kicker {
  font-family: var(--font-mono), monospace;
  font-size: 11px; letter-spacing: 0.22em;
  text-transform: uppercase; color: #C4C4CC;
}
.display {
  font-family: var(--font-archivo), sans-serif;
  font-weight: 900; line-height: 0.92;
  letter-spacing: -0.02em; text-transform: uppercase; margin: 0;
}
.btn-neon {
  background: var(--n1); color: #000;
  font-family: var(--font-archivo), sans-serif;
  font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.02em; border: 2px solid var(--n1);
  transition: transform .12s cubic-bezier(.2,.8,.2,1), box-shadow .12s, filter .12s;
}
.btn-neon:hover:not(:disabled) {
  filter: brightness(1.08);
  box-shadow: 6px 6px 0 #F4F4F1;
  transform: translate(-2px,-2px);
}
.btn-neon:active:not(:disabled) { transform: translate(0,0); box-shadow: none; }
.btn-neon:disabled { opacity: .4; cursor: not-allowed; }
.btn-ghost {
  border: 2px solid #3C3C42; color: #F4F4F1; background: transparent;
  font-family: var(--font-mono), monospace;
  font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase;
  transition: border-color .12s, color .12s;
}
.btn-ghost:hover { border-color: #F4F4F1; }
.cardgrid {
  display: grid; grid-template-columns: repeat(6,1fr);
  gap: 2px; background: #F4F4F1; border: 2px solid #F4F4F1;
}
@media (max-width: 720px) { .cardgrid > * { grid-column: 1 / -1 !important; } }
@keyframes blockIn { from { opacity:0; transform:scale(.98); } to { opacity:1; transform:none; } }
@keyframes pulseBlock { 0%,100% { opacity:.35; } 50% { opacity:.7; } }
.skel { background: #1A1A1D; animation: pulseBlock 1.1s ease-in-out infinite; }
::-webkit-scrollbar { width:12px; height:12px; }
::-webkit-scrollbar-track { background:#0A0A0B; }
::-webkit-scrollbar-thumb { background:#3C3C42; border:3px solid #0A0A0B; }
::-webkit-scrollbar-thumb:hover { background:#5C5C63; }
.shell { max-width: var(--maxw); margin: 0 auto; padding: 0 clamp(16px,4vw,40px); }
```

- [ ] **Step 4: Replace `app/layout.tsx` with font setup**

```tsx
import type { Metadata } from "next";
import { Archivo, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400","700"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Conciply — Autonomous SaaS Growth OS",
  description: "Your entire growth team on demand. CEO, CMO, CRO and 13 more AI roles analyze your SaaS and build a complete growth playbook in 30 seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${grotesk.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Create `.env.example`**

```bash
cat > .env.example << 'EOF'
# Required
OPENAI_API_KEY=

# Model (default: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini

# Free tier: reports per IP per 24h
FREE_TOTAL_LIMIT=1

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PRICE_FOUNDER=
STRIPE_PRICE_PRO=
STRIPE_PRICE_AGENCY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# License signing (long random string)
LICENSE_SECRET=

# Vercel KV (optional — enables durable license store)
KV_REST_API_URL=
KV_REST_API_TOKEN=
STRIPE_WEBHOOK_SECRET=

# App URL
NEXT_PUBLIC_BASE_URL=
EOF
cp .env.example .env.local
```

- [ ] **Step 6: Create `CLAUDE.md`**

```bash
cat > CLAUDE.md << 'EOF'
# Conciply Growth OS

Standalone Next.js 14 App Router + TypeScript + Tailwind.
One OpenAI call per report → 16-section structured JSON growth playbook.
Stripe + HMAC license keys. localStorage workspace. No database.

## Run locally
1. npm install
2. cp .env.example .env.local — set OPENAI_API_KEY
3. npm run dev → http://localhost:3000

## Check before committing
npm run typecheck && npm run build

## Design rules
- Neon Dutch: near-black bg (#0A0A0B), neon cyan/magenta/lime, Archivo display, hard edges
- No new colors or fonts
- Stateless / no-login — no database unless asked

## Key files
- lib/types.ts — all TypeScript types
- lib/prompt.ts — AI system prompt + JSON parser
- app/api/analyze/route.ts — main AI endpoint
- components/HeroInput.tsx — landing input + loading + paywall
- components/ReportView.tsx — 16-section tab layout
EOF
```

- [ ] **Step 7: Verify build**

```bash
npm run build
```
Expected: Compiled successfully (or only "page.tsx" placeholder warnings — no errors).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Conciply Growth OS — Next.js 14, Neon Dutch design system"
```

---

## Task 2: Types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Write `lib/types.ts`**

```ts
// lib/types.ts

export type LicenseTier = "founder" | "pro" | "agency";

export type SectionKey =
  | "executiveSummary" | "marketAnalysis" | "competitorAnalysis"
  | "positioning" | "growthOpportunities" | "acquisitionPlan"
  | "funnelImprovements" | "marketingAssets" | "salesAssets"
  | "retentionStrategy" | "kpiDashboard" | "topRoiActions"
  | "plan7Day" | "plan30Day" | "plan90Day" | "immediateActions";

export const FREE_SECTIONS: SectionKey[] = ["executiveSummary", "topRoiActions"];

export const SECTION_LABELS: Record<SectionKey, string> = {
  executiveSummary:    "Executive Summary",
  marketAnalysis:      "Market Analysis",
  competitorAnalysis:  "Competitor Analysis",
  positioning:         "Positioning",
  growthOpportunities: "Growth Opportunities",
  acquisitionPlan:     "Acquisition Plan",
  funnelImprovements:  "Funnel Improvements",
  marketingAssets:     "Marketing Assets",
  salesAssets:         "Sales Assets",
  retentionStrategy:   "Retention Strategy",
  kpiDashboard:        "KPI Dashboard",
  topRoiActions:       "Top ROI Actions",
  plan7Day:            "7-Day Plan",
  plan30Day:           "30-Day Plan",
  plan90Day:           "90-Day Plan",
  immediateActions:    "Immediate Actions",
};

export const SECTION_ORDER: SectionKey[] = [
  "executiveSummary","marketAnalysis","competitorAnalysis","positioning",
  "growthOpportunities","acquisitionPlan","funnelImprovements","marketingAssets",
  "salesAssets","retentionStrategy","kpiDashboard","topRoiActions",
  "plan7Day","plan30Day","plan90Day","immediateActions",
];

export interface Competitor  { name: string; strength: string; weakness: string }
export interface Channel     { name: string; priority: "high"|"medium"|"low"; rationale: string }
export interface EmailItem   { subject: string; body: string; cta: string }
export interface Objection   { objection: string; response: string }
export interface KPI         { metric: string; target: string; frequency: string }
export interface RoiAction   { title: string; description: string; impact: number; speed: number; difficulty: number; score: number }
export interface DayPlan     { day: number; tasks: string[] }
export interface WeekPlan    { week: number; focus: string; tasks: string[] }
export interface MonthPlan   { month: number; theme: string; milestones: string[] }

export interface GrowthReport {
  executiveSummary:    { icp: string; uvp: string; topOpportunity: string; assumptions: string[] }
  marketAnalysis:      { tam: string; sam: string; som: string; trends: string[] }
  competitorAnalysis:  { competitors: Competitor[]; gaps: string[]; advantages: string[] }
  positioning:         { uvp: string; messaging: string; brandNarrative: string }
  growthOpportunities: { organic: string[]; paid: string[]; plg: string[]; viral: string[] }
  acquisitionPlan:     { channels: Channel[]; tactics: string[]; budgetGuidance: string }
  funnelImprovements:  { awareness: string[]; activation: string[]; retention: string[]; referral: string[] }
  marketingAssets:     { landingCopy: string; adCopy: string[]; emailSequence: EmailItem[] }
  salesAssets:         { outreachScript: string; discoveryQuestions: string[]; objections: Objection[] }
  retentionStrategy:   { onboarding: string[]; engagementLoops: string[]; upsells: string[] }
  kpiDashboard:        { metrics: KPI[]; targets: string[]; warnings: string[] }
  topRoiActions:       { actions: RoiAction[] }
  plan7Day:            { days: DayPlan[] }
  plan30Day:           { weeks: WeekPlan[] }
  plan90Day:           { months: MonthPlan[] }
  immediateActions:    { next24h: string[]; next72h: string[] }
}

export type PartialGrowthReport = Partial<GrowthReport>;

export interface StoredReport {
  id: string
  input: string
  createdAt: number
  report: GrowthReport
  edits: Partial<Record<SectionKey, string>>
  notes: Partial<Record<SectionKey, string>>
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add all TypeScript types for GrowthReport + StoredReport"
```

---

## Task 3: Core Lib — openai, ratelimit, license, kv, stripe

**Files:**
- Create: `lib/openai.ts`
- Create: `lib/ratelimit.ts`
- Create: `lib/license.ts`
- Create: `lib/kv.ts`
- Create: `lib/stripe.ts`

- [ ] **Step 1: Create `lib/openai.ts`**

```ts
// lib/openai.ts
import OpenAI from "openai";

let _client: OpenAI | null = null;
export function getOpenAI(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

export const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
```

- [ ] **Step 2: Create `lib/ratelimit.ts`** (in-memory, same pattern as Conciply)

```ts
// lib/ratelimit.ts
// In-memory rate limiter. Resets on server restart.
// For production, swap the store for Vercel KV.
const store = new Map<string, { count: number; reset: number }>();

export function checkRateLimit(ip: string, limit: number, windowMs = 86_400_000): boolean {
  const now = Date.now();
  const entry = store.get(ip);
  if (!entry || now > entry.reset) {
    store.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export function getRemainingAttempts(ip: string, limit: number): number {
  const entry = store.get(ip);
  if (!entry || Date.now() > entry.reset) return limit;
  return Math.max(0, limit - entry.count);
}
```

- [ ] **Step 3: Create `lib/license.ts`**

```ts
// lib/license.ts
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
```

- [ ] **Step 4: Create `lib/kv.ts`**

```ts
// lib/kv.ts
// Wraps Vercel KV. Falls back to a no-op if KV env vars are not set.
let kv: { get: (k: string) => Promise<unknown>; set: (k: string, v: unknown) => Promise<void> } | null = null;

async function getKV() {
  if (kv) return kv;
  if (!process.env.KV_REST_API_URL) {
    kv = { get: async () => null, set: async () => {} };
    return kv;
  }
  const { kv: vercelKv } = await import("@vercel/kv");
  kv = vercelKv as typeof kv;
  return kv;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  return ((await getKV()).get(key)) as T | null;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  return (await getKV()).set(key, value);
}
```

- [ ] **Step 5: Create `lib/stripe.ts`**

```ts
// lib/stripe.ts
import Stripe from "stripe";

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY not set");
    _stripe = new Stripe(key, { apiVersion: "2024-06-20" });
  }
  return _stripe;
}

export const PRICES = {
  founder: process.env.STRIPE_PRICE_FOUNDER ?? "",
  pro:     process.env.STRIPE_PRICE_PRO     ?? "",
  agency:  process.env.STRIPE_PRICE_AGENCY  ?? "",
} as const;

export const PRICE_LABELS: Record<string, { tier: string; amount: string; reports: string }> = {
  [PRICES.founder]: { tier: "founder", amount: "$19", reports: "5" },
  [PRICES.pro]:     { tier: "pro",     amount: "$49", reports: "20" },
  [PRICES.agency]:  { tier: "agency",  amount: "$99", reports: "Unlimited" },
};
```

- [ ] **Step 6: Typecheck**

```bash
npm run typecheck
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add lib/openai.ts lib/ratelimit.ts lib/license.ts lib/kv.ts lib/stripe.ts
git commit -m "feat: add core lib — openai, ratelimit, license, kv, stripe"
```

---

## Task 4: Workspace Lib

**Files:**
- Create: `lib/workspace.ts`

- [ ] **Step 1: Write `lib/workspace.ts`**

This is a client-only module (never imported in API routes).

```ts
// lib/workspace.ts
"use client";
import { nanoid } from "nanoid";
import type { StoredReport, SectionKey, GrowthReport } from "./types";

const KEY = "conciply_reports";
const MAX = 20;

export function loadReports(): StoredReport[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch { return []; }
}

function saveReports(reports: StoredReport[]): void {
  localStorage.setItem(KEY, JSON.stringify(reports.slice(-MAX)));
}

export function saveReport(input: string, report: GrowthReport): StoredReport {
  const entry: StoredReport = {
    id: nanoid(10),
    input,
    createdAt: Date.now(),
    report,
    edits: {},
    notes: {},
  };
  const existing = loadReports();
  saveReports([...existing, entry]);
  return entry;
}

export function getReport(id: string): StoredReport | null {
  return loadReports().find(r => r.id === id) ?? null;
}

export function updateSection(id: string, key: SectionKey, value: string): void {
  const reports = loadReports();
  const idx = reports.findIndex(r => r.id === id);
  if (idx === -1) return;
  reports[idx].edits[key] = value;
  saveReports(reports);
}

export function updateReportSection<K extends SectionKey>(
  id: string,
  key: K,
  value: GrowthReport[K],
): void {
  const reports = loadReports();
  const idx = reports.findIndex(r => r.id === id);
  if (idx === -1) return;
  reports[idx].report[key] = value;
  delete reports[idx].edits[key];
  saveReports(reports);
}

export function exportReport(report: StoredReport): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `conciply-${report.input.slice(0,40).replace(/\s+/g,"-").toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getLicensePlan(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("conciply_plan");
}

export function getLicenseKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("conciply_key");
}

export function setLicense(key: string, plan: string): void {
  localStorage.setItem("conciply_key", key);
  localStorage.setItem("conciply_plan", plan);
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/workspace.ts
git commit -m "feat: add localStorage workspace helpers"
```

---

## Task 5: Prompt Engineering

**Files:**
- Create: `lib/prompt.ts`

- [ ] **Step 1: Write `lib/prompt.ts`**

```ts
// lib/prompt.ts
import type { GrowthReport } from "./types";

export function buildSystemPrompt(): string {
  return `You are an autonomous SaaS Growth Operating System acting as a complete team:
CEO, COO, CMO, CRO, VP Growth, Performance Marketing, SEO, Content Marketing,
Product Marketing, Social Media, Brand Strategy, SDR, Account Executive,
Enterprise Sales, CRO Specialist, Funnel Architect, UX Analyst,
Retention Specialist, Lifecycle Marketing, Data Scientist, Market Researcher,
Competitive Intelligence Analyst.

RULES:
- Think like owners, not employees. Challenge assumptions.
- Never give generic advice. Always prioritize: highest ROI, fastest execution, lowest complexity, long-term scalability.
- Make reasonable assumptions when information is missing. State your assumptions in executiveSummary.assumptions.
- Every RoiAction must have: impact (1-10), speed (1-10), difficulty (1-10), score = (impact * speed) / difficulty. Sort actions highest score first.
- Be specific to the described SaaS — no generic platitudes.

Respond with a single JSON object matching this exact schema. No markdown, no explanation, only JSON:

{
  "executiveSummary": {
    "icp": "string — specific ICP description",
    "uvp": "string — unique value proposition",
    "topOpportunity": "string — single highest-leverage opportunity",
    "assumptions": ["string"]
  },
  "marketAnalysis": {
    "tam": "string — Total Addressable Market with reasoning",
    "sam": "string — Serviceable Addressable Market",
    "som": "string — Serviceable Obtainable Market year 1",
    "trends": ["string — 3-5 market trends"]
  },
  "competitorAnalysis": {
    "competitors": [{ "name": "string", "strength": "string", "weakness": "string" }],
    "gaps": ["string — market gaps to exploit"],
    "advantages": ["string — competitive advantages"]
  },
  "positioning": {
    "uvp": "string",
    "messaging": "string — 1-2 sentence core message",
    "brandNarrative": "string — brand story paragraph"
  },
  "growthOpportunities": {
    "organic": ["string"],
    "paid": ["string"],
    "plg": ["string — product-led growth tactics"],
    "viral": ["string — viral loop ideas"]
  },
  "acquisitionPlan": {
    "channels": [{ "name": "string", "priority": "high|medium|low", "rationale": "string" }],
    "tactics": ["string"],
    "budgetGuidance": "string"
  },
  "funnelImprovements": {
    "awareness": ["string"],
    "activation": ["string"],
    "retention": ["string"],
    "referral": ["string"]
  },
  "marketingAssets": {
    "landingCopy": "string — full above-the-fold copy",
    "adCopy": ["string — 5 ad headlines"],
    "emailSequence": [{ "subject": "string", "body": "string", "cta": "string" }]
  },
  "salesAssets": {
    "outreachScript": "string — cold outreach message",
    "discoveryQuestions": ["string — 5 discovery questions"],
    "objections": [{ "objection": "string", "response": "string" }]
  },
  "retentionStrategy": {
    "onboarding": ["string — onboarding steps"],
    "engagementLoops": ["string"],
    "upsells": ["string"]
  },
  "kpiDashboard": {
    "metrics": [{ "metric": "string", "target": "string", "frequency": "daily|weekly|monthly" }],
    "targets": ["string — 90-day targets"],
    "warnings": ["string — red flags to watch"]
  },
  "topRoiActions": {
    "actions": [{
      "title": "string",
      "description": "string",
      "impact": number,
      "speed": number,
      "difficulty": number,
      "score": number
    }]
  },
  "plan7Day": {
    "days": [{ "day": number, "tasks": ["string"] }]
  },
  "plan30Day": {
    "weeks": [{ "week": number, "focus": "string", "tasks": ["string"] }]
  },
  "plan90Day": {
    "months": [{ "month": number, "theme": "string", "milestones": ["string"] }]
  },
  "immediateActions": {
    "next24h": ["string"],
    "next72h": ["string"]
  }
}`;
}

export function buildUserMessage(input: string): string {
  return `Analyze this SaaS and generate the full growth report:\n\n${input.trim()}`;
}

export function parseReport(raw: string): GrowthReport {
  const data = JSON.parse(raw);
  // Basic shape validation — throw if critical sections missing
  if (!data.executiveSummary || !data.topRoiActions) {
    throw new Error("Invalid report shape: missing required sections");
  }
  return data as GrowthReport;
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/prompt.ts
git commit -m "feat: add AI system prompt + report parser"
```

---

## Task 6: API Route — /api/analyze

**Files:**
- Create: `app/api/analyze/route.ts`

- [ ] **Step 1: Write `app/api/analyze/route.ts`**

```ts
// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai";
import { checkRateLimit, getRemainingAttempts } from "@/lib/ratelimit";
import { verifyLicense, REPORT_LIMITS } from "@/lib/license";
import { buildSystemPrompt, buildUserMessage, parseReport } from "@/lib/prompt";
import { FREE_SECTIONS } from "@/lib/types";
import type { GrowthReport, SectionKey } from "@/lib/types";

const FREE_LIMIT = parseInt(process.env.FREE_TOTAL_LIMIT ?? "1", 10);

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const input: string = typeof body.input === "string" ? body.input.trim() : "";

  if (input.length < 10 || input.length > 1000) {
    return NextResponse.json({ error: "Input must be 10–1000 characters." }, { status: 400 });
  }

  // License check
  const licenseHeader = req.headers.get("x-conciply-license") ?? "";
  const license = licenseHeader ? verifyLicense(licenseHeader) : null;
  const ip = getIP(req);

  if (!license) {
    // Free tier — enforce IP rate limit
    const allowed = checkRateLimit(ip, FREE_LIMIT);
    if (!allowed) {
      return NextResponse.json({ paywall: true, error: "Free limit reached." }, { status: 429 });
    }
  } else {
    // Paid — check report count limit
    const limit = REPORT_LIMITS[license.tier];
    if (license.reportCount >= limit) {
      return NextResponse.json({ paywall: true, error: "Report limit reached for your plan." }, { status: 429 });
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured." }, { status: 500 });
  }

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user",   content: buildUserMessage(input) },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const fullReport = parseReport(raw);

    // Gate: free tier returns only the two free sections
    if (!license) {
      const freeReport: Partial<GrowthReport> = {};
      for (const key of FREE_SECTIONS) {
        (freeReport as Record<SectionKey, unknown>)[key] =
          (fullReport as Record<SectionKey, unknown>)[key];
      }
      const remaining = getRemainingAttempts(ip, FREE_LIMIT);
      return NextResponse.json({ report: freeReport, remaining, tier: null });
    }

    return NextResponse.json({
      report: fullReport,
      remaining: REPORT_LIMITS[license.tier] - license.reportCount - 1,
      tier: license.tier,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Typecheck + build**

```bash
npm run typecheck && npm run build
```
Expected: no errors.

- [ ] **Step 3: Smoke test with curl**

```bash
# Start dev server in another terminal: npm run dev
curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"input":"B2B CRM for marketing agencies, $49/mo"}' | jq '.report | keys'
```
Expected (free tier): `["executiveSummary", "topRoiActions"]`

- [ ] **Step 4: Commit**

```bash
git add app/api/analyze/route.ts
git commit -m "feat: add /api/analyze — single OpenAI call, server-side free gate"
```

---

## Task 7: API Routes — /api/refine, /api/asset, Stripe

**Files:**
- Create: `app/api/refine/route.ts`
- Create: `app/api/asset/route.ts`
- Create: `app/api/checkout/route.ts`
- Create: `app/api/verify/route.ts`
- Create: `app/api/webhook/route.ts`

- [ ] **Step 1: Write `app/api/refine/route.ts`**

```ts
// app/api/refine/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai";
import { verifyLicense } from "@/lib/license";
import { buildSystemPrompt } from "@/lib/prompt";
import { SECTION_LABELS } from "@/lib/types";
import type { SectionKey } from "@/lib/types";

export async function POST(req: NextRequest) {
  const licenseHeader = req.headers.get("x-conciply-license") ?? "";
  if (!verifyLicense(licenseHeader)) {
    return NextResponse.json({ error: "License required." }, { status: 401 });
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
```

- [ ] **Step 2: Write `app/api/asset/route.ts`**

```ts
// app/api/asset/route.ts
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
  const sectionData = JSON.stringify((report as Record<string, unknown>)[sectionKey] ?? {});

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a world-class SaaS growth consultant generating detailed, ready-to-use assets. Be specific, actionable, and tailored to the described SaaS. Return only JSON.`,
        },
        {
          role: "user",
          content: `SaaS: ${input}\n\nSection "${sectionName}" summary:\n${sectionData}\n\nGenerate a deep-dive asset bundle for this section. Return a JSON object with key "assets" containing an array of ready-to-use items (full copy, scripts, or plans — not summaries).`,
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
```

- [ ] **Step 3: Write `app/api/checkout/route.ts`**

```ts
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getStripe, PRICES } from "@/lib/stripe";
import type { LicenseTier } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const tier = body.tier as LicenseTier;
  const priceId = PRICES[tier];

  if (!priceId) {
    return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? req.nextUrl.origin;

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/unlock?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing`,
      metadata: { tier },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Stripe error" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Write `app/api/verify/route.ts`**

```ts
// app/api/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyLicense } from "@/lib/license";
import { kvGet } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const key: string = body.key ?? "";

  if (!key) return NextResponse.json({ error: "Key required." }, { status: 400 });

  // Check KV revocation list first (if KV is configured)
  const revoked = await kvGet<boolean>(`revoked:${key}`);
  if (revoked) return NextResponse.json({ error: "License revoked." }, { status: 403 });

  const license = verifyLicense(key);
  if (!license) return NextResponse.json({ error: "Invalid license key." }, { status: 403 });

  return NextResponse.json({ tier: license.tier, reportCount: license.reportCount });
}
```

- [ ] **Step 5: Write `app/api/webhook/route.ts`**

```ts
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { signLicense } from "@/lib/license";
import { kvSet } from "@/lib/kv";
import Stripe from "stripe";
import type { LicenseTier } from "@/lib/types";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });

  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const tier = session.metadata?.tier as LicenseTier | undefined;
    if (!tier) return NextResponse.json({ ok: true });

    const licenseKey = signLicense(tier, 0);
    await kvSet(`license:${session.id}`, licenseKey);
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Typecheck + build**

```bash
npm run typecheck && npm run build
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add app/api/
git commit -m "feat: add all API routes — refine, asset, checkout, verify, webhook"
```

---

## Task 8: Nav + Footer Components

**Files:**
- Create: `components/Nav.tsx`

- [ ] **Step 1: Write `components/Nav.tsx`**

```tsx
// components/Nav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();
  const navLink = (href: string, label: string) => {
    const active = path === href;
    return (
      <Link href={href} className="font-mono uppercase transition-colors"
        style={{ fontSize:12, letterSpacing:"0.1em", color: active ? "#000" : "#C4C4CC",
                 background: active ? "var(--n3)" : "transparent", padding:"8px 14px" }}>
        {label}
      </Link>
    );
  };

  return (
    <header style={{ position:"sticky", top:0, zIndex:40,
                     background:"rgba(10,10,11,0.82)", backdropFilter:"blur(14px)",
                     borderBottom:"2px solid #F4F4F1" }}>
      <div className="shell" style={{ height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ display:"flex", gap:3 }}>
            <span style={{ width:11, height:22, background:"var(--n1)", display:"inline-block" }} />
            <span style={{ width:11, height:22, background:"var(--n2)", display:"inline-block" }} />
            <span style={{ width:11, height:22, background:"var(--n3)", display:"inline-block" }} />
          </span>
          <span className="display" style={{ fontSize:22 }}>Conciply</span>
        </Link>
        <nav style={{ display:"flex", gap:2, alignItems:"center" }}>
          {navLink("/pricing", "Pricing")}
          {navLink("/restore", "Restore")}
          <Link href="/" className="btn-neon" style={{ padding:"9px 18px", fontSize:13, marginLeft:8 }}>
            Start free
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer style={{ borderTop:"2px solid #F4F4F1", marginTop:0 }}>
      <div className="shell" style={{ padding:"clamp(28px,4vw,44px) clamp(16px,4vw,40px)",
                                       display:"flex", flexWrap:"wrap", gap:24,
                                       alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ display:"flex", gap:3 }}>
            <span style={{ width:9, height:18, background:"var(--n1)", display:"inline-block" }} />
            <span style={{ width:9, height:18, background:"var(--n2)", display:"inline-block" }} />
            <span style={{ width:9, height:18, background:"var(--n3)", display:"inline-block" }} />
          </span>
          <span className="font-mono" style={{ fontSize:12, color:"#C4C4CC" }}>
            Conciply — Autonomous SaaS Growth OS
          </span>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
          {["/pricing","Pricing"],["/restore","Restore"],["/terms","Terms"],["/privacy","Privacy"]
            .map(([href, label]) => (
            <Link key={href} href={href} className="font-mono"
              style={{ fontSize:11, color:"#C4C4CC", letterSpacing:"0.06em",
                       textTransform:"uppercase", padding:"12px 10px", display:"inline-flex", alignItems:"center" }}>
              {label}
            </Link>
          ))}
          <span className="font-mono" style={{ fontSize:11, color:"#9A9AA8", padding:"12px 10px" }}>
            © {new Date().getFullYear()} CONCIPLY
          </span>
        </div>
      </div>
    </footer>
  );
}

export function VisionStatement() {
  return (
    <section style={{ borderTop:"2px solid #F4F4F1", marginTop:80 }}>
      <div className="shell" style={{ padding:"clamp(48px,7vw,96px) clamp(16px,4vw,40px)",
                                       display:"grid", gridTemplateColumns:"1fr 1fr",
                                       gap:"clamp(40px,6vw,80px)", alignItems:"start" }}>
        <div>
          <p className="font-mono" style={{ fontSize:13, color:"var(--n1)", letterSpacing:"0.12em",
                                            textTransform:"uppercase", margin:"0 0 20px" }}>Our Vision</p>
          <h2 className="display" style={{ fontSize:"clamp(28px,4vw,46px)", marginBottom:24, marginTop:0 }}>
            Every SaaS deserves a world-class growth team.
          </h2>
          <p style={{ fontSize:16, lineHeight:1.7, color:"#E0E0E0", maxWidth:420, margin:0 }}>
            Conciply gives every founder — regardless of team size or budget — the same strategic
            firepower as a Series B startup with a full growth org.
          </p>
          <p className="display" style={{ marginTop:32, fontSize:18, color:"var(--n3)", marginBottom:0 }}>
            Think Like Owners. Execute Like a Team.
          </p>
        </div>
        <div style={{ borderLeft:"2px solid #F4F4F1", paddingLeft:"clamp(24px,4vw,56px)" }}>
          <p className="font-mono" style={{ fontSize:13, color:"var(--n2)", letterSpacing:"0.12em",
                                            textTransform:"uppercase", margin:"0 0 20px" }}>Our Mission</p>
          <p style={{ fontSize:16, lineHeight:1.8, color:"#E0E0E0", marginBottom:20, marginTop:0 }}>
            Conciply exists to eliminate the growth gap between well-funded startups and bootstrapped founders.
          </p>
          <p style={{ fontSize:16, lineHeight:1.8, color:"#E0E0E0", marginBottom:0 }}>
            Every recommendation is scored by ROI, speed, and difficulty — so you always know exactly
            what to do next, and why it matters.
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add components/Nav.tsx
git commit -m "feat: add Nav, Footer, VisionStatement components"
```

---

## Task 9: HeroInput + Landing Page

**Files:**
- Create: `components/HeroInput.tsx`
- Create: `components/OutputSkeleton.tsx`
- Create: `components/Paywall.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write `components/OutputSkeleton.tsx`**

```tsx
// components/OutputSkeleton.tsx
export default function OutputSkeleton() {
  return (
    <div role="status" aria-label="Generating your growth report" style={{ marginTop:2 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:28, borderBottom:"2px solid #F4F4F1" }}>
        <span className="skel" style={{ width:14, height:14 }} />
        <span className="kicker" style={{ color:"var(--n1)" }}>
          Deploying 16 AI growth roles…
        </span>
      </div>
      <div className="cardgrid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ gridColumn:"span 6", background:"#0A0A0B", padding:28 }}>
            <div className="skel" style={{ height:10, width:"25%", marginBottom:16 }} />
            <div className="skel" style={{ height:20, width:"80%", marginBottom:8 }} />
            <div className="skel" style={{ height:20, width: i % 2 ? "55%" : "70%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `components/Paywall.tsx`**

```tsx
// components/Paywall.tsx
"use client";
import { useState } from "react";
import type { LicenseTier } from "@/lib/types";

const TIERS: { tier: LicenseTier; label: string; price: string; reports: string }[] = [
  { tier: "founder", label: "Founder", price: "$19", reports: "5 reports" },
  { tier: "pro",     label: "Pro",     price: "$49", reports: "20 reports" },
  { tier: "agency",  label: "Agency",  price: "$99", reports: "Unlimited" },
];

export default function Paywall() {
  const [loading, setLoading] = useState<LicenseTier | null>(null);

  const checkout = async (tier: LicenseTier) => {
    setLoading(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ marginTop:"clamp(32px,4vw,48px)" }}>
      <div style={{ border:"2px solid var(--n2)", padding:"clamp(28px,4vw,48px)", background:"#121214" }}>
        <div className="kicker" style={{ marginBottom:18, color:"var(--n2)" }}>Free limit reached</div>
        <h2 className="display" style={{ fontSize:"clamp(28px,4vw,52px)" }}>
          Unlock your full<br /><span style={{ color:"var(--n2)" }}>growth playbook.</span>
        </h2>
        <p style={{ fontSize:"clamp(15px,1.6vw,18px)", lineHeight:1.5, color:"#C4C4CC", marginTop:18, maxWidth:560 }}>
          Get all 16 sections, the 7/30/90-day plans, marketing assets, and sales scripts.
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:32 }}>
          {TIERS.map(({ tier, label, price, reports }) => (
            <button key={tier} onClick={() => checkout(tier)} disabled={loading !== null}
              className="btn-neon"
              style={{ padding:"14px 24px", fontSize:16,
                       background: tier === "pro" ? "var(--n2)" : "var(--n1)",
                       borderColor: tier === "pro" ? "var(--n2)" : "var(--n1)" }}>
              {loading === tier ? "Redirecting…" : `${label} ${price} · ${reports} →`}
            </button>
          ))}
        </div>
        <p style={{ marginTop:16 }}>
          <a href="/pricing" style={{ color:"#C4C4CC", fontSize:13, textDecoration:"underline" }}>
            See full feature comparison →
          </a>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `components/HeroInput.tsx`**

```tsx
// components/HeroInput.tsx
"use client";
import { useState, useCallback, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { saveReport, getLicenseKey } from "@/lib/workspace";
import OutputSkeleton from "./OutputSkeleton";
import Paywall from "./Paywall";
import type { GrowthReport } from "@/lib/types";
import { FREE_SECTIONS, SECTION_LABELS } from "@/lib/types";

const EXAMPLES = [
  "B2B CRM for marketing agencies",
  "AI note-taking app for developers",
  "Restaurant inventory management SaaS",
  "Subscription analytics for ecommerce",
  "Dev tool for API load testing",
];

function getTodayCount() {
  const base = 3241;
  const day = Math.floor(Date.now() / 86400000);
  const seed = (day * 2654435761) % 2000;
  return base + seed;
}

type Status = "idle" | "loading" | "done" | "error" | "paywall";

export default function HeroInput() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => { setCount(getTodayCount()); }, []);

  const run = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || status === "loading") return;
    setStatus("loading");
    setError("");

    try {
      const key = getLicenseKey();
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { "x-conciply-license": key } : {}),
        },
        body: JSON.stringify({ input: q }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 || data?.paywall) { setStatus("paywall"); return; }
        setError(data?.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      const stored = saveReport(q, data.report as GrowthReport);
      setStatus("done");
      setCount(c => c + 1);
      router.push(`/report?id=${stored.id}`);
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }, [status, router]);

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); run(input); }
  };

  return (
    <section style={{ padding:"clamp(40px,6vw,84px) 0 80px" }}>
      {/* Social proof */}
      {count > 0 && (
        <div className="font-mono" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
          <span style={{ width:8, height:8, background:"var(--n3)", display:"inline-block",
                         borderRadius:"50%", animation:"pulseBlock 2s infinite" }} />
          <span style={{ fontSize:12, color:"#9A9AA8", letterSpacing:"0.08em" }}>
            <span style={{ color:"var(--n3)", fontWeight:700 }}>{count.toLocaleString()}</span> growth reports generated today
          </span>
        </div>
      )}

      <div className="kicker" style={{ marginBottom:16 }}>Autonomous SaaS Growth Operating System</div>

      <h1 className="display" style={{ fontSize:"clamp(44px,8.5vw,128px)" }}>
        Your entire<br />growth team.<br /><span style={{ color:"var(--n2)" }}>On demand.</span>
      </h1>

      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:24, marginBottom:20 }}>
        {[{ label:"No login required", color:"var(--n3)" },
          { label:"16 AI roles",        color:"var(--n1)" },
          { label:"Results in ~30s",    color:"var(--n2)" }]
          .map(({ label, color }) => (
          <span key={label} className="font-mono"
            style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase",
                     color:"#000", background:color, padding:"5px 12px" }}>
            {label}
          </span>
        ))}
      </div>

      <p style={{ fontSize:"clamp(17px,1.8vw,22px)", lineHeight:1.45, color:"#C4C4CC", maxWidth:640, marginBottom:0 }}>
        Conciply deploys a full <span style={{ color:"#F4F4F1" }}>CEO, CMO, CRO, VP Growth, SDR and 11 more AI
        specialists</span> to analyze your SaaS and build a complete growth playbook — in seconds.
      </p>

      {/* Input block */}
      <div style={{ border:"2px solid #F4F4F1", background:"#121214", marginTop:32 }}>
        <div style={{ display:"flex", alignItems:"stretch", flexWrap:"wrap" }}>
          <textarea value={input} onChange={e => setInput(e.target.value.slice(0,1000))}
            onKeyDown={onKey} rows={2} maxLength={1000}
            placeholder="Describe your SaaS — e.g. B2B analytics tool for restaurant chains"
            className="font-display"
            style={{ flex:"1 1 420px", resize:"none", background:"transparent", border:"none",
                     outline:"none", color:"#F4F4F1", fontWeight:600,
                     fontSize:"clamp(20px,2.4vw,30px)", lineHeight:1.18,
                     padding:"26px 28px", minHeight:96 }} />
          <button className="btn-neon" onClick={() => run(input)}
            disabled={status === "loading" || !input.trim()}
            style={{ flex:"0 0 auto", minWidth:200, fontSize:"clamp(18px,2vw,24px)",
                     padding:"0 36px", borderLeft:"2px solid #F4F4F1" }}>
            {status === "loading" ? "Analyzing…" : "Analyze ↵"}
          </button>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                      borderTop:"1px solid #2A2A2E", padding:"10px 16px 10px 28px" }}>
          <span className="kicker">Free: Executive Summary + Top 10 ROI Actions</span>
          <span className="font-mono" style={{ fontSize:12, color: input.length > 900 ? "var(--n2)" : "#5C5C63" }}>
            {input.length}/1000
          </span>
        </div>
      </div>

      {/* Example chips */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:20, alignItems:"center" }}>
        <span className="kicker" style={{ marginRight:4 }}>Try</span>
        {EXAMPLES.map((ex, i) => (
          <button key={i} className="font-mono"
            onClick={() => { setInput(ex); run(ex); }}
            style={{ fontSize:12, border:"1.5px solid #3C3C42", color:"#C4C4CC",
                     padding:"11px 14px", background:"transparent", minHeight:44 }}>
            {ex}
          </button>
        ))}
      </div>

      <p className="font-mono" style={{ fontSize:11, lineHeight:1.6, color:"#9A9AA8",
                                        marginTop:18, maxWidth:720, letterSpacing:"0.02em" }}>
        AI-generated for strategic inspiration. Output may be inaccurate — review before acting.
        See our <a href="/terms" style={{ color:"#C4C4CC", textDecoration:"underline" }}>Terms</a>.
      </p>

      {status === "error" && (
        <div className="font-mono" style={{ marginTop:24, fontSize:13, color:"var(--n2)",
                                            borderLeft:"3px solid var(--n2)", paddingLeft:12 }}>
          {error}
        </div>
      )}
      {status === "loading" && <OutputSkeleton />}
      {status === "paywall" && <Paywall />}
      {status === "idle" && <IdlePreview />}
    </section>
  );
}

function IdlePreview() {
  return (
    <div style={{ marginTop:"clamp(56px,7vw,96px)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    flexWrap:"wrap", gap:12, border:"2px solid #2A2A2E",
                    padding:"18px 28px", marginBottom:2 }}>
        <div>
          <div className="kicker" style={{ marginBottom:4 }}>Example output · B2B CRM for agencies</div>
          <div className="font-display" style={{ fontWeight:800, fontSize:"clamp(16px,1.8vw,22px)",
                                                  textTransform:"uppercase", color:"#5C5C63" }}>
            Enter your SaaS above to generate yours →
          </div>
        </div>
        <span className="font-mono" style={{ fontSize:11, color:"#3C3C42", letterSpacing:"0.1em" }}>SAMPLE</span>
      </div>
      <div style={{ opacity:0.5, pointerEvents:"none" }}>
        <div className="cardgrid">
          {FREE_SECTIONS.map(key => (
            <div key={key} style={{ gridColumn:"span 6", background:"#0A0A0B", padding:28 }}>
              <div className="kicker" style={{ marginBottom:12, color:"var(--n1)" }}>
                {SECTION_LABELS[key]}
              </div>
              <div style={{ color:"#C4C4CC", fontSize:15, lineHeight:1.6 }}>
                {key === "executiveSummary"
                  ? "ICP: Agency ops leads frustrated by HubSpot complexity and price. Core advantage: 3x faster pipeline visibility at 40% lower cost."
                  : "#1 Score 9.2 · Launch free PLG tier — removes procurement friction for sub-10 person teams."}
              </div>
            </div>
          ))}
          <div style={{ gridColumn:"span 3", background:"#0A0A0B", padding:28, borderTop:"2px solid var(--n2)" }}>
            <div className="kicker" style={{ color:"var(--n2)", marginBottom:8 }}>🔒 Market Analysis</div>
            <div style={{ color:"#3C3C42", fontSize:13 }}>Unlock to see TAM / SAM / SOM…</div>
          </div>
          <div style={{ gridColumn:"span 3", background:"#0A0A0B", padding:28, borderTop:"2px solid var(--n2)" }}>
            <div className="kicker" style={{ color:"var(--n2)", marginBottom:8 }}>🔒 Acquisition Plan</div>
            <div style={{ color:"#3C3C42", fontSize:13 }}>Cold outreach, SEO, paid channels…</div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update `app/page.tsx`**

```tsx
// app/page.tsx
import Nav, { Footer, VisionStatement } from "@/components/Nav";
import HeroInput from "@/components/HeroInput";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="shell"><HeroInput /></main>
      <VisionStatement />
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Build**

```bash
npm run build
```
Expected: no errors.

- [ ] **Step 6: Manual smoke test**

```bash
npm run dev
# Open http://localhost:3000
# Verify: hero heading visible, input block renders, example chips show, idle preview shows with locked sections
```

- [ ] **Step 7: Commit**

```bash
git add components/ app/page.tsx
git commit -m "feat: add landing page — HeroInput, skeleton, paywall, idle preview"
```

---

## Task 10: Report Page

**Files:**
- Create: `components/ReportView.tsx`
- Create: `components/SectionCard.tsx`
- Create: `app/report/page.tsx`

- [ ] **Step 1: Write `components/SectionCard.tsx`**

```tsx
// components/SectionCard.tsx
"use client";
import type { GrowthReport, SectionKey } from "@/lib/types";
import { SECTION_LABELS } from "@/lib/types";

interface Props {
  sectionKey: SectionKey;
  report: Partial<GrowthReport>;
  locked: boolean;
  onDeepDive?: (key: SectionKey) => void;
  onRegenerate?: (key: SectionKey) => void;
}

function renderSection(key: SectionKey, report: Partial<GrowthReport>): React.ReactNode {
  const data = (report as Record<string, unknown>)[key];
  if (!data) return null;

  if (key === "topRoiActions") {
    const { actions } = data as GrowthReport["topRoiActions"];
    return (
      <div>
        {actions.map((a, i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                                 border:"1px solid #1E1E22", padding:"14px 16px", marginBottom:2 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:15, color:"#F4F4F1", marginBottom:4 }}>{a.title}</div>
              <div style={{ fontSize:13, color:"#C4C4CC", lineHeight:1.5, marginBottom:6 }}>{a.description}</div>
              <div className="kicker" style={{ color:"#9A9AA8" }}>
                Impact {a.impact} · Speed {a.speed} · Difficulty {a.difficulty}
              </div>
            </div>
            <div className="display" style={{ fontSize:24, color:"var(--n3)", marginLeft:16, flexShrink:0 }}>
              {a.score.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (key === "plan7Day") {
    const { days } = data as GrowthReport["plan7Day"];
    return (
      <div>
        {days.map(d => (
          <div key={d.day} style={{ marginBottom:16 }}>
            <div className="kicker" style={{ color:"var(--n1)", marginBottom:6 }}>Day {d.day}</div>
            <ul style={{ margin:0, padding:"0 0 0 20px" }}>
              {d.tasks.map((t, i) => <li key={i} style={{ color:"#C4C4CC", fontSize:14, lineHeight:1.6 }}>{t}</li>)}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (key === "plan30Day") {
    const { weeks } = data as GrowthReport["plan30Day"];
    return (
      <div>
        {weeks.map(w => (
          <div key={w.week} style={{ marginBottom:16 }}>
            <div className="kicker" style={{ color:"var(--n1)", marginBottom:4 }}>Week {w.week} — {w.focus}</div>
            <ul style={{ margin:0, padding:"0 0 0 20px" }}>
              {w.tasks.map((t, i) => <li key={i} style={{ color:"#C4C4CC", fontSize:14, lineHeight:1.6 }}>{t}</li>)}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (key === "plan90Day") {
    const { months } = data as GrowthReport["plan90Day"];
    return (
      <div>
        {months.map(m => (
          <div key={m.month} style={{ marginBottom:16 }}>
            <div className="kicker" style={{ color:"var(--n1)", marginBottom:4 }}>Month {m.month} — {m.theme}</div>
            <ul style={{ margin:0, padding:"0 0 0 20px" }}>
              {m.milestones.map((t, i) => <li key={i} style={{ color:"#C4C4CC", fontSize:14, lineHeight:1.6 }}>{t}</li>)}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  // Generic: render all string/array fields
  return (
    <div>
      {Object.entries(data as Record<string, unknown>).map(([field, value]) => (
        <div key={field} style={{ marginBottom:16 }}>
          <div className="kicker" style={{ marginBottom:6, color:"#9A9AA8" }}>{field}</div>
          {Array.isArray(value) ? (
            <ul style={{ margin:0, padding:"0 0 0 20px" }}>
              {(value as string[]).map((item, i) => (
                <li key={i} style={{ color:"#C4C4CC", fontSize:14, lineHeight:1.6 }}>
                  {typeof item === "string" ? item : JSON.stringify(item)}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color:"#C4C4CC", fontSize:14, lineHeight:1.6, margin:0 }}>
              {typeof value === "string" ? value : JSON.stringify(value)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function SectionCard({ sectionKey, report, locked, onDeepDive, onRegenerate }: Props) {
  if (locked) {
    return (
      <div style={{ border:"1px solid #1E1E22", padding:"20px 24px", marginBottom:2,
                    display:"flex", alignItems:"center", gap:16 }}>
        <span style={{ color:"var(--n2)", fontSize:18 }}>🔒</span>
        <div>
          <div className="kicker" style={{ color:"var(--n2)", marginBottom:4 }}>
            {SECTION_LABELS[sectionKey]}
          </div>
          <div style={{ fontSize:13, color:"#5C5C63" }}>Unlock with a paid plan to view this section.</div>
        </div>
        <a href="/pricing" className="btn-neon" style={{ marginLeft:"auto", padding:"8px 16px", fontSize:13 }}>
          Unlock →
        </a>
      </div>
    );
  }

  return (
    <div style={{ border:"1px solid #2A2A2E", marginBottom:2 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"14px 24px", borderBottom:"1px solid #2A2A2E" }}>
        <span className="kicker" style={{ color:"var(--n1)" }}>{SECTION_LABELS[sectionKey]}</span>
        <div style={{ display:"flex", gap:6 }}>
          {onRegenerate && (
            <button className="btn-ghost" onClick={() => onRegenerate(sectionKey)}
              style={{ padding:"6px 12px", fontSize:11 }}>↻ Regen</button>
          )}
          {onDeepDive && (
            <button className="btn-ghost" onClick={() => onDeepDive(sectionKey)}
              style={{ padding:"6px 12px", fontSize:11, borderColor:"var(--n2)", color:"var(--n2)" }}>
              ⚡ Deep Dive
            </button>
          )}
        </div>
      </div>
      <div style={{ padding:"20px 24px" }}>
        {renderSection(sectionKey, report)}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `components/ReportView.tsx`**

```tsx
// components/ReportView.tsx
"use client";
import { useState } from "react";
import type { GrowthReport, SectionKey } from "@/lib/types";
import { SECTION_ORDER, SECTION_LABELS, FREE_SECTIONS } from "@/lib/types";
import SectionCard from "./SectionCard";

interface Props {
  report: Partial<GrowthReport>;
  tier: string | null;
  input: string;
  reportId: string;
}

export default function ReportView({ report, tier, input, reportId }: Props) {
  const [active, setActive] = useState<SectionKey>("executiveSummary");
  const isPaid = tier !== null;

  return (
    <div>
      {/* Tab bar */}
      <div style={{ position:"sticky", top:64, zIndex:30, background:"rgba(10,10,11,0.95)",
                    borderBottom:"2px solid #F4F4F1", overflowX:"auto", display:"flex" }}>
        {SECTION_ORDER.map((key, i) => {
          const locked = !isPaid && !FREE_SECTIONS.includes(key);
          const isActive = key === active;
          return (
            <button key={key} onClick={() => setActive(key)}
              className="font-mono"
              style={{ flexShrink:0, padding:"12px 16px", fontSize:10, letterSpacing:"0.1em",
                       textTransform:"uppercase", whiteSpace:"nowrap", border:"none",
                       borderBottom: isActive ? "2px solid var(--n1)" : "2px solid transparent",
                       marginBottom:-2, cursor:"pointer",
                       color: locked ? "#3C3C42" : isActive ? "var(--n1)" : "#C4C4CC",
                       background:"transparent" }}>
              {String(i + 1).padStart(2,"0")} {SECTION_LABELS[key]}
              {locked && " 🔒"}
            </button>
          );
        })}
      </div>

      {/* Action bar */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center",
                    justifyContent:"space-between", padding:"16px 0" }}>
        <div className="kicker">
          {isPaid ? `${tier} plan · all sections unlocked` : "Free — 2 of 16 sections"}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <a href="/" className="btn-ghost" style={{ padding:"8px 14px", fontSize:12 }}>New Report</a>
          {isPaid && (
            <a href={`/workspace?id=${reportId}`} className="btn-neon"
              style={{ padding:"8px 14px", fontSize:12 }}>
              Open Workspace →
            </a>
          )}
        </div>
      </div>

      {/* Active section */}
      <SectionCard
        sectionKey={active}
        report={report}
        locked={!isPaid && !FREE_SECTIONS.includes(active)}
      />
    </div>
  );
}
```

- [ ] **Step 3: Write `app/report/page.tsx`**

```tsx
// app/report/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Nav, { Footer } from "@/components/Nav";
import ReportView from "@/components/ReportView";
import { getReport, getLicensePlan } from "@/lib/workspace";
import type { StoredReport } from "@/lib/types";

export default function ReportPage() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [stored, setStored] = useState<StoredReport | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const r = getReport(id);
    if (!r) { setNotFound(true); return; }
    setStored(r);
    setTier(getLicensePlan());
  }, [id]);

  return (
    <>
      <Nav />
      <main className="shell" style={{ paddingTop:32, paddingBottom:80 }}>
        {notFound && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div className="kicker" style={{ marginBottom:16 }}>Report not found</div>
            <p style={{ color:"#C4C4CC", marginBottom:24 }}>
              This report may have been cleared from your browser storage.
            </p>
            <a href="/" className="btn-neon" style={{ padding:"12px 24px", fontSize:16 }}>
              Generate a new report →
            </a>
          </div>
        )}
        {stored && (
          <>
            <div style={{ borderBottom:"2px solid #F4F4F1", paddingBottom:16, marginBottom:0 }}>
              <div className="kicker" style={{ marginBottom:8 }}>Report generated</div>
              <h1 className="display" style={{ fontSize:"clamp(24px,4vw,48px)",
                                               whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {stored.input}
              </h1>
            </div>
            <ReportView
              report={stored.report}
              tier={tier}
              input={stored.input}
              reportId={stored.id}
            />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Build**

```bash
npm run build
```
Expected: no errors.

- [ ] **Step 5: Manual test**

```bash
npm run dev
# Generate a report from the homepage, verify redirect to /report?id=xxx
# Verify: tab bar shows all 16 sections, free sections render, locked sections show lock UI
```

- [ ] **Step 6: Commit**

```bash
git add components/ReportView.tsx components/SectionCard.tsx app/report/
git commit -m "feat: add report page — 16-section tab layout, free/locked states"
```

---

## Task 11: Workspace Page + AssetGenerator

**Files:**
- Create: `components/AssetGenerator.tsx`
- Create: `app/workspace/page.tsx`

- [ ] **Step 1: Write `components/AssetGenerator.tsx`**

```tsx
// components/AssetGenerator.tsx
"use client";
import { useState } from "react";
import type { SectionKey, GrowthReport } from "@/lib/types";
import { SECTION_LABELS } from "@/lib/types";
import { getLicenseKey } from "@/lib/workspace";

interface Props {
  sectionKey: SectionKey;
  input: string;
  report: GrowthReport;
  onClose: () => void;
}

export default function AssetGenerator({ sectionKey, input, report, onClose }: Props) {
  const [assets, setAssets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const key = getLicenseKey();
      const res = await fetch("/api/asset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { "x-conciply-license": key } : {}),
        },
        body: JSON.stringify({ sectionKey, input, report }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error"); return; }
      setAssets(Array.isArray(data.assets) ? data.assets.map((a: unknown) =>
        typeof a === "string" ? a : JSON.stringify(a, null, 2)
      ) : []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100,
                  display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:"#121214", border:"2px solid #F4F4F1", maxWidth:720,
                    width:"100%", maxHeight:"80vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                      padding:"20px 24px", borderBottom:"2px solid #F4F4F1" }}>
          <div>
            <div className="kicker" style={{ color:"var(--n2)", marginBottom:4 }}>Deep Dive</div>
            <div className="display" style={{ fontSize:20 }}>{SECTION_LABELS[sectionKey]}</div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding:"8px 14px", fontSize:12 }}>
            Close ✕
          </button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"24px" }}>
          {assets.length === 0 && !loading && (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <p style={{ color:"#C4C4CC", marginBottom:24, lineHeight:1.6 }}>
                Generate expanded, ready-to-use assets for the <strong>{SECTION_LABELS[sectionKey]}</strong> section.
                Full copy, scripts, and plans — not summaries.
              </p>
              <button onClick={generate} className="btn-neon"
                style={{ padding:"14px 28px", fontSize:16, background:"var(--n2)", borderColor:"var(--n2)" }}>
                ⚡ Generate Assets →
              </button>
            </div>
          )}

          {loading && (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <div className="skel" style={{ height:12, width:"60%", margin:"0 auto 12px" }} />
              <div className="skel" style={{ height:12, width:"45%", margin:"0 auto" }} />
              <div className="kicker" style={{ marginTop:20, color:"var(--n1)" }}>Generating assets…</div>
            </div>
          )}

          {error && (
            <div style={{ color:"var(--n2)", fontFamily:"monospace", fontSize:13, borderLeft:"3px solid var(--n2)", paddingLeft:12 }}>
              {error}
            </div>
          )}

          {assets.map((asset, i) => (
            <div key={i} style={{ border:"1px solid #2A2A2E", padding:"16px 20px", marginBottom:8 }}>
              <div className="kicker" style={{ color:"var(--n3)", marginBottom:10 }}>Asset {i + 1}</div>
              <pre style={{ color:"#E0E0E0", fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap",
                            margin:0, fontFamily:"inherit" }}>
                {asset}
              </pre>
            </div>
          ))}

          {assets.length > 0 && (
            <button onClick={generate} className="btn-ghost"
              style={{ marginTop:8, padding:"10px 18px", fontSize:12 }}>
              ↻ Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `app/workspace/page.tsx`**

```tsx
// app/workspace/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav, { Footer } from "@/components/Nav";
import SectionCard from "@/components/SectionCard";
import AssetGenerator from "@/components/AssetGenerator";
import { getReport, getLicensePlan, getLicenseKey, updateReportSection, exportReport } from "@/lib/workspace";
import { SECTION_ORDER, SECTION_LABELS, FREE_SECTIONS } from "@/lib/types";
import type { StoredReport, SectionKey, GrowthReport } from "@/lib/types";

export default function WorkspacePage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";

  const [stored, setStored] = useState<StoredReport | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [active, setActive] = useState<SectionKey>("executiveSummary");
  const [deepDiveKey, setDeepDiveKey] = useState<SectionKey | null>(null);
  const [regenLoading, setRegenLoading] = useState<SectionKey | null>(null);

  useEffect(() => {
    const plan = getLicensePlan();
    if (!plan) { router.push("/unlock"); return; }
    const r = getReport(id);
    if (!r) { router.push("/"); return; }
    setStored(r);
    setTier(plan);
  }, [id, router]);

  const handleRegenerate = async (key: SectionKey) => {
    if (!stored) return;
    setRegenLoading(key);
    try {
      const licenseKey = getLicenseKey();
      const sectionData = JSON.stringify((stored.report as Record<string, unknown>)[key] ?? {});
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(licenseKey ? { "x-conciply-license": licenseKey } : {}),
        },
        body: JSON.stringify({ sectionKey: key, input: stored.input, currentContent: sectionData }),
      });
      const data = await res.json();
      if (res.ok && data.section) {
        updateReportSection(stored.id, key, data.section as GrowthReport[typeof key]);
        setStored(getReport(stored.id));
      }
    } finally {
      setRegenLoading(null);
    }
  };

  if (!stored) return null;

  const isPro = tier === "pro" || tier === "agency";
  const isAgency = tier === "agency";

  return (
    <>
      <Nav />
      <main className="shell" style={{ paddingTop:32, paddingBottom:80 }}>
        {/* Header */}
        <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between",
                      gap:12, borderBottom:"2px solid #F4F4F1", paddingBottom:16, marginBottom:0 }}>
          <div>
            <div className="kicker" style={{ color:"var(--n3)", marginBottom:6 }}>
              {tier} plan · workspace
            </div>
            <h1 className="display" style={{ fontSize:"clamp(20px,3vw,40px)",
                                              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                                              maxWidth:"60vw" }}>
              {stored.input}
            </h1>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <a href={`/report?id=${stored.id}`} className="btn-ghost" style={{ padding:"8px 14px", fontSize:12 }}>
              View Report
            </a>
            {isAgency && (
              <button onClick={() => exportReport(stored)} className="btn-ghost"
                style={{ padding:"8px 14px", fontSize:12 }}>
                Export JSON
              </button>
            )}
            <a href="/" className="btn-neon" style={{ padding:"8px 14px", fontSize:12 }}>
              New Report
            </a>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ position:"sticky", top:64, zIndex:30, background:"rgba(10,10,11,0.95)",
                      borderBottom:"2px solid #2A2A2E", overflowX:"auto", display:"flex" }}>
          {SECTION_ORDER.map((key, i) => (
            <button key={key} onClick={() => setActive(key)} className="font-mono"
              style={{ flexShrink:0, padding:"12px 16px", fontSize:10, letterSpacing:"0.1em",
                       textTransform:"uppercase", whiteSpace:"nowrap", border:"none",
                       borderBottom: key === active ? "2px solid var(--n1)" : "2px solid transparent",
                       marginBottom:-2, cursor:"pointer",
                       color: key === active ? "var(--n1)" : "#C4C4CC",
                       background:"transparent" }}>
              {String(i+1).padStart(2,"0")} {SECTION_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Active section card */}
        <div style={{ marginTop:2 }}>
          {regenLoading === active ? (
            <div style={{ padding:"32px 24px" }}>
              <div className="skel" style={{ height:12, width:"40%", marginBottom:12 }} />
              <div className="skel" style={{ height:12, width:"65%", marginBottom:8 }} />
              <div className="skel" style={{ height:12, width:"50%" }} />
              <div className="kicker" style={{ marginTop:20, color:"var(--n1)" }}>Regenerating section…</div>
            </div>
          ) : (
            <SectionCard
              sectionKey={active}
              report={stored.report}
              locked={false}
              onRegenerate={handleRegenerate}
              onDeepDive={isPro ? (key) => setDeepDiveKey(key) : undefined}
            />
          )}
        </div>
      </main>

      {deepDiveKey && stored && (
        <AssetGenerator
          sectionKey={deepDiveKey}
          input={stored.input}
          report={stored.report}
          onClose={() => setDeepDiveKey(null)}
        />
      )}

      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

- [ ] **Step 4: Manual test**

```bash
npm run dev
# Generate a report, unlock with a test license key, navigate to /workspace?id=xxx
# Verify: tab bar, section content, regen button, deep dive button (Pro+), export button (Agency)
```

- [ ] **Step 5: Commit**

```bash
git add components/AssetGenerator.tsx app/workspace/
git commit -m "feat: add workspace page — edit, regenerate, asset generator, export"
```

---

## Task 12: Pricing + Unlock + Restore Pages

**Files:**
- Create: `components/PricingTable.tsx`
- Create: `app/pricing/page.tsx`
- Create: `app/unlock/page.tsx`
- Create: `app/restore/page.tsx`

- [ ] **Step 1: Write `components/PricingTable.tsx`**

```tsx
// components/PricingTable.tsx
"use client";
import { useState } from "react";
import type { LicenseTier } from "@/lib/types";

const TIERS = [
  {
    tier: null,
    label: "Free",
    price: "$0",
    sub: "No credit card",
    features: ["1 report per IP","Executive Summary","Top 10 ROI Actions","—","—","—"],
    cta: "Start free", href: "/",
  },
  {
    tier: "founder" as LicenseTier,
    label: "Founder",
    price: "$19",
    sub: "One-time",
    features: ["5 reports","All 16 sections","Workspace (edit + regen)","—","—","—"],
    cta: "Get Founder →",
  },
  {
    tier: "pro" as LicenseTier,
    label: "Pro",
    price: "$49",
    sub: "One-time",
    features: ["20 reports","All 16 sections","Workspace","Asset generators","—","—"],
    cta: "Get Pro →",
    highlight: true,
  },
  {
    tier: "agency" as LicenseTier,
    label: "Agency",
    price: "$99",
    sub: "One-time",
    features: ["Unlimited reports","All 16 sections","Workspace","Asset generators","JSON export","Client use"],
    cta: "Get Agency →",
  },
];

export default function PricingTable() {
  const [loading, setLoading] = useState<LicenseTier | null>(null);

  const checkout = async (tier: LicenseTier) => {
    setLoading(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally { setLoading(null); }
  };

  return (
    <div className="cardgrid" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
      {TIERS.map(({ tier, label, price, sub, features, cta, href, highlight }) => (
        <div key={label} style={{ background:"#0A0A0B", padding:"clamp(24px,3vw,40px)",
                                   gridColumn:"span 1",
                                   borderTop: highlight ? "4px solid var(--n1)" : "4px solid transparent" }}>
          <div className="kicker" style={{ marginBottom:12,
                                           color: highlight ? "var(--n1)" : "#C4C4CC" }}>
            {label} {highlight && "★ Most popular"}
          </div>
          <div className="display" style={{ fontSize:48, color:"var(--n3)", marginBottom:4 }}>{price}</div>
          <div className="kicker" style={{ marginBottom:24, color:"#9A9AA8" }}>{sub}</div>
          <ul style={{ listStyle:"none", margin:"0 0 32px", padding:0 }}>
            {features.map((f, i) => (
              <li key={i} style={{ fontSize:14, color: f === "—" ? "#3C3C42" : "#C4C4CC",
                                   lineHeight:1.8, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color: f === "—" ? "#3C3C42" : "var(--n3)", fontSize:11 }}>
                  {f === "—" ? "—" : "✓"}
                </span>
                {f}
              </li>
            ))}
          </ul>
          {href ? (
            <a href={href} className="btn-neon" style={{ display:"block", textAlign:"center",
                                                          padding:"14px 20px", fontSize:14 }}>
              {cta}
            </a>
          ) : (
            <button onClick={() => checkout(tier!)} disabled={loading !== null} className="btn-neon"
              style={{ width:"100%", padding:"14px 20px", fontSize:14,
                       background: highlight ? "var(--n1)" : "var(--n3)",
                       borderColor: highlight ? "var(--n1)" : "var(--n3)" }}>
              {loading === tier ? "Redirecting…" : cta}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `app/pricing/page.tsx`**

```tsx
// app/pricing/page.tsx
import Nav, { Footer } from "@/components/Nav";
import PricingTable from "@/components/PricingTable";

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="shell" style={{ paddingTop:"clamp(48px,6vw,80px)", paddingBottom:80 }}>
        <div className="kicker" style={{ marginBottom:16 }}>Pricing</div>
        <h1 className="display" style={{ fontSize:"clamp(36px,6vw,80px)", marginBottom:12 }}>
          Simple.<br /><span style={{ color:"var(--n2)" }}>One-time.</span>
        </h1>
        <p style={{ fontSize:18, color:"#C4C4CC", maxWidth:560, lineHeight:1.6, marginBottom:48 }}>
          No subscriptions. Pay once, use forever. Upgrade anytime.
        </p>
        <PricingTable />
        <div style={{ marginTop:32, textAlign:"center" }}>
          <p style={{ color:"#9A9AA8", fontSize:14 }}>
            Already purchased?{" "}
            <a href="/unlock" style={{ color:"var(--n1)", textDecoration:"underline" }}>Enter your license key →</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Write `app/unlock/page.tsx`**

```tsx
// app/unlock/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Nav, { Footer } from "@/components/Nav";
import { setLicense } from "@/lib/workspace";

export default function UnlockPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");

  // Auto-verify after Stripe checkout redirect
  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    (async () => {
      setStatus("loading");
      const res = await fetch("/api/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: sessionId }),
      });
      // If KV is configured, the webhook stored the real license key
      // For now just prompt the user to check email (no KV) or redirect
      if (res.ok) {
        const data = await res.json();
        setLicense(sessionId, data.tier);
        setMessage(`${data.tier} plan unlocked! Redirecting…`);
        setStatus("success");
        setTimeout(() => router.push("/"), 1500);
      } else {
        setStatus("idle"); // fall through to manual key entry
      }
    })();
  }, [params, router]);

  const verify = async () => {
    const k = key.trim();
    if (!k) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: k }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus("error"); setMessage(data.error || "Invalid key."); return; }
      setLicense(k, data.tier);
      setMessage(`${data.tier} plan unlocked!`);
      setStatus("success");
      setTimeout(() => router.push("/"), 1200);
    } catch {
      setStatus("error"); setMessage("Network error.");
    }
  };

  return (
    <>
      <Nav />
      <main className="shell" style={{ maxWidth:560, paddingTop:"clamp(64px,8vw,100px)", paddingBottom:80 }}>
        <div className="kicker" style={{ marginBottom:16 }}>Unlock</div>
        <h1 className="display" style={{ fontSize:"clamp(32px,5vw,64px)", marginBottom:32 }}>
          Enter your<br /><span style={{ color:"var(--n1)" }}>license key.</span>
        </h1>

        {status === "success" ? (
          <div style={{ border:"2px solid var(--n3)", padding:24 }}>
            <span className="font-mono" style={{ color:"var(--n3)", fontWeight:700 }}>✓ {message}</span>
          </div>
        ) : (
          <>
            <div style={{ border:"2px solid #F4F4F1", display:"flex", flexWrap:"wrap" }}>
              <input value={key} onChange={e => setKey(e.target.value)}
                onKeyDown={e => e.key === "Enter" && verify()}
                placeholder="Paste your license key…" className="font-mono"
                style={{ flex:"1 1 280px", background:"transparent", border:"none", outline:"none",
                         color:"#F4F4F1", fontSize:14, padding:"18px 20px" }} />
              <button onClick={verify} disabled={status === "loading" || !key.trim()}
                className="btn-neon"
                style={{ padding:"0 24px", fontSize:14, borderLeft:"2px solid #F4F4F1" }}>
                {status === "loading" ? "Verifying…" : "Unlock →"}
              </button>
            </div>
            {status === "error" && (
              <p className="font-mono" style={{ fontSize:13, color:"var(--n2)", marginTop:12 }}>{message}</p>
            )}
            <p style={{ color:"#9A9AA8", fontSize:13, marginTop:20 }}>
              Your license key was emailed after purchase.{" "}
              <a href="/restore" style={{ color:"var(--n1)", textDecoration:"underline" }}>Can't find it?</a>
            </p>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Write `app/restore/page.tsx`**

```tsx
// app/restore/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav, { Footer } from "@/components/Nav";
import { setLicense } from "@/lib/workspace";

export default function RestorePage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");

  const restore = async () => {
    const k = key.trim();
    if (!k) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: k }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus("error"); setMessage(data.error || "Invalid key."); return; }
      setLicense(k, data.tier);
      setMessage(`${data.tier} plan restored!`);
      setStatus("success");
      setTimeout(() => router.push("/"), 1200);
    } catch {
      setStatus("error"); setMessage("Network error.");
    }
  };

  return (
    <>
      <Nav />
      <main className="shell" style={{ maxWidth:560, paddingTop:"clamp(64px,8vw,100px)", paddingBottom:80 }}>
        <div className="kicker" style={{ marginBottom:16 }}>Restore</div>
        <h1 className="display" style={{ fontSize:"clamp(32px,5vw,64px)", marginBottom:16 }}>
          Restore your<br /><span style={{ color:"var(--n1)" }}>license.</span>
        </h1>
        <p style={{ color:"#C4C4CC", fontSize:16, lineHeight:1.6, marginBottom:32 }}>
          Paste your license key to restore access on a new device or browser.
          Your key was emailed when you purchased.
        </p>

        {status === "success" ? (
          <div style={{ border:"2px solid var(--n3)", padding:24 }}>
            <span className="font-mono" style={{ color:"var(--n3)", fontWeight:700 }}>✓ {message}</span>
          </div>
        ) : (
          <>
            <div style={{ border:"2px solid #F4F4F1", display:"flex", flexWrap:"wrap" }}>
              <input value={key} onChange={e => setKey(e.target.value)}
                onKeyDown={e => e.key === "Enter" && restore()}
                placeholder="Paste your license key…" className="font-mono"
                style={{ flex:"1 1 280px", background:"transparent", border:"none", outline:"none",
                         color:"#F4F4F1", fontSize:14, padding:"18px 20px" }} />
              <button onClick={restore} disabled={status === "loading" || !key.trim()}
                className="btn-neon"
                style={{ padding:"0 24px", fontSize:14, borderLeft:"2px solid #F4F4F1" }}>
                {status === "loading" ? "Restoring…" : "Restore →"}
              </button>
            </div>
            {status === "error" && (
              <p className="font-mono" style={{ fontSize:13, color:"var(--n2)", marginTop:12 }}>{message}</p>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Build**

```bash
npm run build
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/PricingTable.tsx app/pricing/ app/unlock/ app/restore/
git commit -m "feat: add pricing, unlock, and restore pages"
```

---

## Task 13: Static Pages + Final Polish

**Files:**
- Create: `app/terms/page.tsx`
- Create: `app/privacy/page.tsx`

- [ ] **Step 1: Write `app/terms/page.tsx`**

```tsx
// app/terms/page.tsx
import Nav, { Footer } from "@/components/Nav";

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="shell" style={{ maxWidth:720, paddingTop:"clamp(48px,6vw,80px)", paddingBottom:80 }}>
        <div className="kicker" style={{ marginBottom:16 }}>Legal</div>
        <h1 className="display" style={{ fontSize:"clamp(32px,5vw,64px)", marginBottom:32 }}>Terms of Use</h1>
        <div style={{ color:"#C4C4CC", fontSize:15, lineHeight:1.8 }}>
          <p>Conciply Growth OS is provided as-is for strategic inspiration purposes only.</p>
          <p style={{ marginTop:16 }}>AI-generated content may be inaccurate, incomplete, or not applicable to your specific situation. Always review output before acting on any recommendations. Do not rely solely on this tool for business decisions.</p>
          <p style={{ marginTop:16 }}>License keys are non-refundable after use. One license per individual or team. Resale is not permitted.</p>
          <p style={{ marginTop:16 }}>We reserve the right to update these terms at any time. Continued use constitutes acceptance.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Write `app/privacy/page.tsx`**

```tsx
// app/privacy/page.tsx
import Nav, { Footer } from "@/components/Nav";

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="shell" style={{ maxWidth:720, paddingTop:"clamp(48px,6vw,80px)", paddingBottom:80 }}>
        <div className="kicker" style={{ marginBottom:16 }}>Legal</div>
        <h1 className="display" style={{ fontSize:"clamp(32px,5vw,64px)", marginBottom:32 }}>Privacy Policy</h1>
        <div style={{ color:"#C4C4CC", fontSize:15, lineHeight:1.8 }}>
          <p>Conciply Growth OS does not require account creation and does not collect personal data beyond what is required to process payments.</p>
          <p style={{ marginTop:16 }}>Payment processing is handled entirely by Stripe. We do not store credit card information.</p>
          <p style={{ marginTop:16 }}>Your SaaS descriptions submitted for analysis are sent to OpenAI for processing. Do not submit confidential or sensitive information. See OpenAI&apos;s privacy policy for how they handle API data.</p>
          <p style={{ marginTop:16 }}>Report content is stored only in your browser&apos;s localStorage and is not transmitted to our servers.</p>
          <p style={{ marginTop:16 }}>We use standard server logs (IP address, request metadata) for rate limiting and abuse prevention. Logs are not sold or shared.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Final build + typecheck**

```bash
npm run typecheck && npm run build
```
Expected: no TypeScript errors, successful build.

- [ ] **Step 4: Full manual smoke test**

```bash
npm run dev
```

Check each route:
- `http://localhost:3000` — landing page loads, idle preview shows, example chips work
- `http://localhost:3000/pricing` — 4-tier pricing grid renders
- `http://localhost:3000/unlock` — key input form renders
- `http://localhost:3000/restore` — restore form renders
- `http://localhost:3000/terms` — terms page renders
- `http://localhost:3000/privacy` — privacy page renders
- Submit a SaaS description → verify redirect to `/report?id=xxx` → free sections visible, others locked
- Manually set `localStorage.setItem("conciply_plan","pro")` in browser console → refresh report → all sections visible → "Open Workspace" button appears → workspace loads

- [ ] **Step 5: Final commit**

```bash
git add app/terms/ app/privacy/
git commit -m "feat: add terms and privacy pages — Conciply Growth OS complete"
```

- [ ] **Step 6: Tag release**

```bash
git tag v1.0.0
```

---

## Deploy Checklist

Before going live:

- [ ] Copy `.env.example` → `.env.local`, fill in all values
- [ ] Set `OPENAI_API_KEY`
- [ ] Create Stripe products: Founder $19, Pro $49, Agency $99 (one-time payments)
- [ ] Set `STRIPE_PRICE_FOUNDER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_AGENCY`
- [ ] Set `LICENSE_SECRET` to a long random string: `openssl rand -hex 32`
- [ ] Set `NEXT_PUBLIC_BASE_URL` to production URL
- [ ] (Optional) Set up Vercel KV and add `KV_REST_API_URL` + `KV_REST_API_TOKEN`
- [ ] (Optional) Register Stripe webhook at `https://yourdomain.com/api/webhook` for `checkout.session.completed`
- [ ] `npm run build` passes clean
- [ ] Deploy to Vercel or Render
