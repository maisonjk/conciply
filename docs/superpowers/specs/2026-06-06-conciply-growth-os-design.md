# Conciply Growth OS — Design Spec
**Date:** 2026-06-06
**Status:** Approved

---

## 1. Overview

Conciply Growth OS is a standalone Next.js web app (new repo, new deploy) that replaces the existing Conciply viral campaign generator. It acts as an autonomous SaaS growth operating system — a full AI team of 16 roles (CEO, CMO, CRO, VP Growth, SDR, Data Scientist, etc.) that analyzes any SaaS product and produces a complete, prioritized growth playbook in ~30 seconds.

The app shares the Neon Dutch design system (near-black background, neon cyan/magenta/lime, Archivo display type, hard edges, thick rules) and the same Stripe + license key monetization model as the original Conciply.

---

## 2. Core User Flow

1. User lands on homepage, enters their SaaS URL or description (+ optional context)
2. App calls OpenAI once and streams back a 16-section structured JSON report
3. **Free tier:** Executive Summary + Top 10 ROI Actions visible; all other sections blurred with titles only
4. Paywall: user purchases a license key via Stripe
5. **Paid:** all 16 sections unlock; report persists in localStorage as a workspace
6. Workspace: user can edit sections inline, regenerate individual sections, and launch deep-dive asset generators per section

---

## 3. Target Users

All three personas are served via pricing tiers:
- **Solo founders / indie hackers** — Founder tier, execute the playbook themselves
- **Early-stage startup teams** — Pro tier, fill growth team gaps
- **Agencies / consultants** — Agency tier, run for clients, export JSON

---

## 4. Architecture

### 4.1 Tech Stack
- **Framework:** Next.js 14 App Router + TypeScript
- **Styling:** Tailwind CSS + Neon Dutch design system (copied from Conciply)
- **Fonts:** Archivo (display), Space Grotesk (UI), Space Mono (monospace/kickers)
- **AI:** OpenAI API — single call per report, `gpt-4o-mini` default, `gpt-4o` optional via env var
- **Payments:** Stripe Checkout + HMAC-signed license keys (identical to Conciply)
- **Persistence:** localStorage only (no database required for v1)
- **Optional:** Vercel KV for durable license storage (same as Conciply)
- **Deploy:** Vercel or Render (standard Next.js)

### 4.2 Single AI Call Architecture

One call to OpenAI per report. The prompt instructs the model to respond with a single structured JSON object containing all 16 sections. No multi-agent orchestration — keeps latency low and cost predictable.

**Response shape:**
```ts
interface GrowthReport {
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
  topRoiActions:       { actions: RoiAction[] }  // scored: (impact × speed) ÷ difficulty
  plan7Day:            { days: DayPlan[] }
  plan30Day:           { weeks: WeekPlan[] }
  plan90Day:           { months: MonthPlan[] }
  immediateActions:    { next24h: string[]; next72h: string[] }
}
```

### 4.3 File Structure

```
app/
  page.tsx                  — landing + input form
  report/page.tsx           — report viewer (free + paid sections, tab layout)
  workspace/page.tsx        — living workspace (paid, edit + asset generators)
  pricing/page.tsx          — 4-tier pricing table
  unlock/page.tsx           — license key entry
  restore/page.tsx          — restore workspace from exported JSON
  terms/page.tsx
  privacy/page.tsx
  api/
    analyze/route.ts        — main AI call + rate limit + license check
    refine/route.ts         — per-section regenerate (paid)
    asset/route.ts          — deep-dive asset generator (Pro+)
    checkout/route.ts       — Stripe checkout session
    verify/route.ts         — license key verification
    webhook/route.ts        — Stripe webhook handler
lib/
  prompt.ts                 — system prompt + JSON schema + response parser
  openai.ts                 — OpenAI client wrapper
  ratelimit.ts              — IP-based rate limiting (same as Conciply)
  license.ts                — HMAC token sign/verify
  stripe.ts                 — Stripe client + price IDs
  workspace.ts              — localStorage read/write helpers (client-only)
  types.ts                  — GrowthReport + all sub-types
components/
  Nav.tsx                   — sticky nav, 3-bar logo, same as Conciply
  HeroInput.tsx             — landing textarea + generate button + loading + paywall
  ReportView.tsx            — 16-section tab layout (free/locked/paid states)
  SectionCard.tsx           — individual section: content + edit + regenerate + deep dive
  AssetGenerator.tsx        — deep-dive modal for marketing/sales assets (Pro+)
  PricingTable.tsx          — 4-tier pricing (Mondrian card grid)
  Paywall.tsx               — free limit reached CTA
  OutputSkeleton.tsx        — loading skeleton (pulsing blocks)
```

### 4.4 localStorage Schema

```ts
// Key: "conciply_reports"  (JSON array, max 20 entries, oldest pruned)
interface StoredReport {
  id: string              // nanoid
  input: string           // user's SaaS description
  createdAt: number       // Date.now()
  report: GrowthReport    // full 16-section JSON from API
  edits: Partial<Record<SectionKey, string>>   // user inline edits
  notes: Partial<Record<SectionKey, string>>   // user notes per section
}

// Key: "conciply_plan"     — active license tier string
// Key: "conciply_key"      — license key
// Key: "conciply_license"  — license token (same as Conciply)
```

---

## 5. Pages

### 5.1 Homepage (`/`)
- Sticky nav: 3-bar neon logo + "Conciply" wordmark + Pricing link + "Start free" CTA
- Hero: large display heading, 3 neon badge pills (No login / 16 AI roles / ~30s), subtitle
- Social proof counter (seeded daily, same technique as Conciply)
- Input block: `border: 2px solid #F4F4F1`, textarea + "Analyze ↵" button flush right, character counter, free tier hint in footer
- Example chips: 5 pre-filled SaaS descriptions
- Dimmed example output below (idle state): shows 2 free sections clearly, remaining sections blurred with lock indicators
- AI disclaimer (same as Conciply)
- Vision statement + Footer (same structure as Conciply)

### 5.2 Report Page (`/report`)
- Report stored in localStorage; loaded client-side by ID (query param `?id=xxx`)
- Sticky tab bar: all 16 section names, scrollable horizontally on mobile
- Active tab shows full section content
- **Free tier:** sections 1 (Executive Summary) and 12 (Top ROI Actions) render fully; all others show title + blurred placeholder + "Unlock" CTA
- **Paid tier:** all sections render, each with Edit / Regenerate / Deep Dive actions
- Top action bar: SaaS name + "New Report" + "Open Workspace" (paid)

### 5.3 Workspace Page (`/workspace`)
- Requires valid license; redirects to `/unlock` if none
- Loads report from localStorage by ID
- Sticky tab bar (same as report) for section navigation
- Each section rendered as a card: header with section name + edit status badge, body (editable inline on click), footer with Edit / Regenerate / Deep Dive buttons
- **Edit mode:** contenteditable div, auto-saves to localStorage on blur
- **Regenerate:** calls `/api/refine` with section key + original input, replaces section content
- **Deep Dive (Pro+):** opens `AssetGenerator` modal; generates expanded assets for that section (e.g. Marketing Assets → full email sequences, ad copy variants, landing page copy)
- Export button (Agency tier): downloads full report JSON

### 5.4 Pricing Page (`/pricing`)
- 4 tiers in Mondrian card grid:

| Tier | Price | Reports | Sections | Workspace | Asset Generators | Export |
|------|-------|---------|----------|-----------|-----------------|--------|
| Free | $0 | 1/IP | 2 of 16 | — | — | — |
| Founder | $19 one-time | 5 | All 16 | ✓ | — | — |
| Pro | $49 one-time | 20 | All 16 | ✓ | ✓ | — |
| Agency | $99 one-time | Unlimited | All 16 | ✓ | ✓ | ✓ JSON |

### 5.5 Unlock / Restore
- `/unlock` — same UX as Conciply: paste license key → verify against `/api/verify` → store in localStorage → redirect to report
- `/restore` — cross-device license restore: enter email or license key to retrieve license tier (same as Conciply). Distinct from JSON export/import — that is a workspace backup feature available to Agency tier users from the Workspace page, not a separate route.

---

## 6. API Routes

### `POST /api/analyze`
- Validates: input length (10–1000 chars), IP rate limit (1 free/IP per 24h), license tier report count
- Builds system prompt from `lib/prompt.ts`
- Calls OpenAI with `response_format: { type: "json_object" }`
- Parses + validates response shape
- Returns: `{ report: Partial<GrowthReport>, remaining: number }`
- Gate is server-enforced: without a valid license the response contains only `executiveSummary` and `topRoiActions`; all other section keys are omitted. A valid license returns the full `GrowthReport`.

### `POST /api/refine`
- License required
- Body: `{ sectionKey: SectionKey, input: string, currentContent: string }`
- Calls OpenAI with a focused prompt for that section only
- Returns: `{ section: <section type> }`

### `POST /api/asset`
- Pro+ license required
- Body: `{ sectionKey: SectionKey, input: string, report: GrowthReport }`
- Calls OpenAI to generate expanded assets for the section
- Returns section-specific asset bundle

---

## 7. Free vs. Paid Gate

Gate is enforced **server-side** (API returns only free sections without a valid license) and **client-side** (blurred overlays + lock indicators for visual feedback).

- **Free:** `executiveSummary` + `topRoiActions` only
- **Founder+:** all 16 sections, workspace edit + regenerate
- **Pro+:** all sections + asset generators (`/api/asset`)
- **Agency+:** all features + JSON export

---

## 8. Design System

Identical to Conciply's Neon Dutch system:
- Background: `#0A0A0B`
- Foreground / borders: `#F4F4F1`
- Cyan: `#00E5FF` (n1)
- Magenta: `#FF2E6E` (n2)
- Lime: `#D4FF2E` (n3)
- Muted text: `#C4C4CC`
- Dim text: `#9A9AA8`
- `.btn-neon`, `.btn-ghost`, `.kicker`, `.display`, `.cardgrid` — copied verbatim
- Free section indicators: cyan (n1)
- Locked/paid indicators: magenta (n2)
- Score highlights: lime (n3)

---

## 9. Environment Variables

```
# Required
OPENAI_API_KEY=

# AI model (optional, default: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini

# Free tier limit
FREE_TOTAL_LIMIT=1

# Stripe (required for paid tiers)
STRIPE_SECRET_KEY=
STRIPE_PRICE_FOUNDER=
STRIPE_PRICE_PRO=
STRIPE_PRICE_AGENCY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# License signing
LICENSE_SECRET=

# Durable license store (optional)
KV_REST_API_URL=
KV_REST_API_TOKEN=
STRIPE_WEBHOOK_SECRET=

# App URL
NEXT_PUBLIC_BASE_URL=
```

---

## 10. Responsive / Mobile

The web app is fully responsive. The Neon Dutch design system holds at mobile widths:
- Input block stacks vertically below ~480px (textarea full width, button below)
- Tab bar scrolls horizontally
- Section cards are full width
- No separate native app for v1; responsive web serves mobile users

---

## 11. Out of Scope (v1)

- User accounts / auth / database
- Cross-device workspace sync (localStorage only)
- Multi-language support
- White-label / agency portal
- Native iOS / Android app
- Real-time competitor data (all analysis is AI-generated, not live-crawled)
