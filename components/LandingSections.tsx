"use client";
import type { SectionKey } from "@/lib/types";
import { FREE_SECTIONS } from "@/lib/types";
import PricingTable from "@/components/PricingTable";

// ─────────────────────────────────────────────────────────────────────────────
// PROOF BAR — raw signal, zero fluff
// ─────────────────────────────────────────────────────────────────────────────
export function ProofBar() {
  const stats = [
    { value: "22", label: "AI specialists per report" },
    { value: "17", label: "sections, fully written" },
    { value: "Private", label: "zero data stored — ever" },
    { value: "100%", label: "free for your first report" },
    { value: "0", label: "login required" },
  ];
  return (
    <section style={{ borderTop: "2px solid #F4F4F1", borderBottom: "2px solid #F4F4F1", background: "#0D0D0F" }}>
      <div className="shell">
        <div className="proof-bar-inner" style={{
          display: "flex", flexWrap: "wrap",
          alignItems: "stretch",
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              flex: "1 1 160px",
              padding: "clamp(18px,2.5vw,28px) clamp(16px,2vw,28px)",
              borderRight: i < stats.length - 1 ? "1px solid #1E1E22" : "none",
              display: "flex", flexDirection: "column", gap: 4,
              alignItems: "flex-start",
            }}>
              <span className="display" style={{ fontSize: "clamp(26px,3vw,40px)", color: "var(--n1)", lineHeight: 1 }}>
                {s.value}
              </span>
              <span className="font-mono" style={{ fontSize: 12, color: "#7A7A8A", letterSpacing: "0.14em", textTransform: "uppercase", lineHeight: 1.4 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOW IT WORKS — 3 asymmetric steps
// ─────────────────────────────────────────────────────────────────────────────
export function HowItWorks() {
  const steps = [
    {
      num: "01",
      color: "var(--n1)",
      title: "Drop in any business or idea",
      body: "Type a business description, paste a website, or name a product category. One sentence is enough. The system figures out the rest.",
      detail: "Works for any stage — idea, early revenue, or established business.",
    },
    {
      num: "02",
      color: "var(--n2)",
      title: "22 AI specialists go to work",
      body: "Your virtual CEO, CMO, CRO, VP Growth, Head of Retention and 17 more specialists run in parallel — each focused on their domain.",
      detail: "No generic advice. Each specialist analyses your specific business context.",
    },
    {
      num: "03",
      color: "var(--n3)",
      title: "Execute your 17-section playbook",
      body: "Get a complete growth strategy — market sizing, competitor gaps, acquisition channels, 7/30/90-day plans and more. Ready to execute.",
      detail: "Copy sections, print the full report, or work through each section in the dashboard.",
    },
  ];

  return (
    <section style={{ borderBottom: "2px solid #F4F4F1" }}>
      <div className="shell" style={{ padding: "clamp(56px,7vw,96px) clamp(16px,4vw,40px)" }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: "clamp(40px,5vw,64px)", flexWrap: "wrap" }}>
          <p className="font-mono" style={{ fontSize: 12, color: "var(--n2)", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0, flexShrink: 0 }}>
            How it works
          </p>
          <div style={{ height: 1, flex: 1, minWidth: 40, background: "#1E1E22" }} />
          <p className="font-mono" style={{ fontSize: 11, color: "#7A7A8A", letterSpacing: "0.08em", margin: 0 }}>
            From idea to playbook in three steps
          </p>
        </div>

        {/* Steps */}
        <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2px", background: "#1E1E22" }}>
          {steps.map((step, i) => (
            <div key={i} style={{ background: "#0A0A0B", padding: "clamp(28px,3vw,44px) clamp(20px,2.5vw,36px)", position: "relative", overflow: "hidden" }}>
              {/* Watermark number */}
              <div className="display" style={{
                position: "absolute", right: -8, top: -16,
                fontSize: "clamp(80px,10vw,130px)", color: "#111113",
                lineHeight: 1, userSelect: "none", pointerEvents: "none",
              }}>
                {step.num}
              </div>

              {/* Step number badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{ width: 24, height: 24, background: step.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span className="display" style={{ fontSize: 11, color: "#000", lineHeight: 1 }}>{step.num}</span>
                </span>
                <div style={{ height: 1, flex: 1, background: step.color, opacity: 0.3 }} />
              </div>

              {/* Content */}
              <h3 className="display" style={{ fontSize: "clamp(18px,2vw,26px)", color: "#F4F4F1", marginBottom: 16, position: "relative", lineHeight: 1.05 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 15, color: "#9A9AA8", lineHeight: 1.65, fontFamily: "var(--font-grotesk), sans-serif", margin: "0 0 16px", position: "relative" }}>
                {step.body}
              </p>
              <p className="font-mono" style={{ fontSize: 10, color: step.color, letterSpacing: "0.06em", lineHeight: 1.5, margin: 0, opacity: 0.7, position: "relative" }}>
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .how-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WHAT'S INSIDE — all 17 sections, full depth signal
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_GROUPS: { label: string; color: string; accent: string; keys: SectionKey[]; description: string }[] = [
  {
    label: "Analysis",
    color: "var(--n1)",
    accent: "#00E5FF",
    description: "Market intelligence and strategic positioning",
    keys: ["executiveSummary", "marketAnalysis", "competitorAnalysis", "positioning"],
  },
  {
    label: "Growth",
    color: "var(--n3)",
    accent: "#D4FF2E",
    description: "Revenue channels, funnel and acquisition tactics",
    keys: ["growthOpportunities", "acquisitionPlan", "funnelImprovements"],
  },
  {
    label: "Assets",
    color: "var(--n2)",
    accent: "#FF2E6E",
    description: "Ready-to-use marketing, sales and retention copy",
    keys: ["marketingAssets", "salesAssets", "retentionStrategy", "socialMediaStrategy"],
  },
  {
    label: "Execution",
    color: "#C4C4CC",
    accent: "#9A9AA8",
    description: "KPIs, priority actions and day-by-day plans",
    keys: ["kpiDashboard", "topRoiActions", "plan7Day", "plan30Day", "plan90Day", "immediateActions"],
  },
];

const SECTION_ONE_LINERS: Partial<Record<SectionKey, string>> = {
  executiveSummary:    "ICP, value prop, opportunity score and biggest single lever",
  marketAnalysis:      "TAM / SAM / SOM sizing with trend signals and timing window",
  competitorAnalysis:  "Who you're up against, where they're weak, the exact gap to own",
  positioning:         "The frame that makes your right customers say 'this is for me'",
  growthOpportunities: "Organic, paid, viral and product-led levers ranked by impact",
  acquisitionPlan:     "Channels, budgets, tactics and CAC targets — built for your business",
  funnelImprovements:  "Where revenue is leaking and exactly how to plug each stage",
  marketingAssets:     "Landing copy, ad headlines and a full email welcome sequence",
  salesAssets:         "Cold outreach script, discovery questions, objection playbook",
  retentionStrategy:   "Onboarding steps, engagement loops and upsell trigger moments",
  socialMediaStrategy: "Platform playbooks, hook formulas and 4-week content calendar",
  kpiDashboard:        "The 8 metrics that actually matter and your 90-day targets",
  topRoiActions:       "Your top 5 moves ranked by impact × speed × effort",
  plan7Day:            "Day-by-day actions to ship the most critical foundations this week",
  plan30Day:           "Week-by-week execution to build momentum and hit your first milestone",
  plan90Day:           "Three-month roadmap with themes, milestones and leading indicators",
  immediateActions:    "What to do in the next 24 and 72 hours — starts the flywheel",
};

export function WhatYouGet() {
  let sectionIdx = 0;

  return (
    <section style={{ borderBottom: "2px solid #F4F4F1" }}>
      <div className="shell" style={{ padding: "clamp(56px,7vw,96px) clamp(16px,4vw,40px)" }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: "clamp(40px,5vw,64px)", flexWrap: "wrap" }}>
          <div>
            <p className="font-mono" style={{ fontSize: 12, color: "var(--n3)", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 12px" }}>
              What you get
            </p>
            <h2 className="display" style={{ fontSize: "clamp(40px,4vw,52px)", margin: 0, lineHeight: 1.0 }}>
              17 sections.<br />Every angle covered.
            </h2>
          </div>
          <div style={{ maxWidth: 320 }}>
            <p style={{ fontSize: 15, color: "#9A9AA8", lineHeight: 1.65, margin: "0 0 12px", fontFamily: "var(--font-grotesk), sans-serif" }}>
              Most growth consultants charge $3,000–8,000 for a fraction of this. Conciply generates the full playbook on demand.
            </p>
            <p className="font-mono" style={{ fontSize: 12, color: "#B0B0BC", letterSpacing: "0.08em" }}>
              Free sections marked below · Upgrade for all 17
            </p>
          </div>
        </div>

        {/* Groups */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "2px solid #F4F4F1" }}>
          {SECTION_GROUPS.map((group, gi) => (
            <div key={group.label} style={{ borderBottom: gi < SECTION_GROUPS.length - 1 ? "1px solid #1E1E22" : "none" }}>

              {/* Group header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 20px",
                borderBottom: "1px solid #1A1A1E",
                background: "#0D0D0F",
              }}>
                <span style={{ width: 20, height: 20, background: group.color, display: "inline-block", flexShrink: 0 }} />
                <span className="display" style={{ fontSize: 14, color: group.color }}>{group.label}</span>
                <span style={{ height: 1, flex: 1, background: "#1E1E22" }} />
                <span className="font-mono" style={{ fontSize: 12, color: "#B0B0BC", letterSpacing: "0.08em" }}>{group.description}</span>
              </div>

              {/* Section rows — 2-col grid */}
              <div className="section-rows" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {group.keys.map((key, ki) => {
                  sectionIdx++;
                  const isFree = FREE_SECTIONS.includes(key);
                  const isLast = ki === group.keys.length - 1;
                  const isOdd = ki % 2 === 0;
                  return (
                    <div key={key} style={{
                      padding: "16px 20px",
                      borderBottom: ki < group.keys.length - 2 ? "1px solid #111113" : (isOdd && group.keys.length % 2 !== 0 ? "none" : "1px solid #111113"),
                      borderRight: ki % 2 === 0 ? "1px solid #1A1A1E" : "none",
                      display: "flex", gap: 14, alignItems: "flex-start",
                    }}>
                      {/* Left: number + dot */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0, paddingTop: 2 }}>
                        <span className="font-mono" style={{ fontSize: 11, color: group.color, letterSpacing: "0.1em", opacity: 0.9 }}>
                          {String(sectionIdx).padStart(2, "0")}
                        </span>
                        <div style={{ width: 1, flex: 1, background: `${group.accent}20`, minHeight: 20 }} />
                      </div>

                      {/* Right: name + description */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#F4F4F1", fontFamily: "var(--font-grotesk), sans-serif", lineHeight: 1.2 }}>
                            {key.replace(/([A-Z])/g, " $1").trim().replace(/^\w/, c => c.toUpperCase())}
                          </span>
                          {isFree && (
                            <span className="font-mono" style={{
                              fontSize: 9, letterSpacing: "0.10em", textTransform: "uppercase",
                              color: group.color, border: `1px solid ${group.color}`,
                              padding: "1px 5px", flexShrink: 0,
                            }}>Free</span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: "#C4C4CC", lineHeight: 1.5, margin: 0, fontFamily: "var(--font-grotesk), sans-serif" }}>
                          {SECTION_ONE_LINERS[key] ?? ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <a href="/#analyze" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--n2)", border: "2px solid var(--n2)",
            color: "#000", padding: "13px 28px",
            fontFamily: "var(--font-archivo), sans-serif",
            fontSize: 13, fontWeight: 800, letterSpacing: "0.04em",
            textTransform: "uppercase", textDecoration: "none",
          }}>
            Generate your free report →
          </a>
          <span className="font-mono" style={{ fontSize: 12, color: "#B0B0BC", letterSpacing: "0.08em" }}>
            8 of 17 sections free · no login required
          </span>
        </div>
      </div>
      <style>{`
        @media (max-width: 580px) {
          .section-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS — social proof with real texture
// ─────────────────────────────────────────────────────────────────────────────
const QUOTES = [
  {
    quote: "I used it before our seed pitch. The market sizing and competitor analysis sections alone changed how we framed our TAM. The investor asked where we got our research — I said 'internal.'",
    name: "Marcus Steiner",
    role: "Founder, Opero (B2B logistics SaaS)",
    color: "var(--n1)",
    initial: "M",
  },
  {
    quote: "We run it for every new client before the discovery call. Saves 4–6 hours of research and walks in with a positioning hypothesis already formed. At $49/mo this is embarrassingly good value.",
    name: "Priya Anand",
    role: "Growth consultant, 14 agency clients",
    color: "var(--n2)",
    initial: "P",
  },
  {
    quote: "Dropped my YouTube channel in. Got a full content strategy, hook formulas, monetisation angles, and a 30-day plan. The social media section alone is worth running it every quarter.",
    name: "Daniel Kowalski",
    role: "Creator, 47K subscribers",
    color: "var(--n3)",
    initial: "D",
  },
];

export function Testimonials() {
  return (
    <section style={{ borderBottom: "2px solid #F4F4F1" }}>
      <div className="shell" style={{ padding: "clamp(56px,7vw,96px) clamp(16px,4vw,40px)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "clamp(36px,4vw,56px)", flexWrap: "wrap" }}>
          <p className="font-mono" style={{ fontSize: 11, color: "var(--n1)", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0, flexShrink: 0 }}>
            Early users
          </p>
          <div style={{ height: 1, flex: 1, minWidth: 40, background: "#1E1E22" }} />
        </div>

        {/* Quote cards — asymmetric layout: 50/25/25 split */}
        <div className="testimonial-grid" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gap: "2px", background: "#1E1E22" }}>
          {QUOTES.map((q, i) => (
            <div key={i} style={{
              background: "#0A0A0B",
              padding: i === 0 ? "clamp(28px,3vw,44px)" : "clamp(22px,2.5vw,36px)",
              display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24,
              borderTop: `3px solid ${q.color}`,
            }}>
              {/* Quote mark */}
              <div>
                <div className="display" style={{ fontSize: 48, color: q.color, lineHeight: 0.6, marginBottom: 20, opacity: 0.4 }}>"</div>
                <p style={{
                  fontSize: i === 0 ? "clamp(15px,1.4vw,18px)" : 14,
                  color: "#D0D0D8", lineHeight: 1.7,
                  fontFamily: "var(--font-grotesk), sans-serif",
                  margin: 0, fontStyle: "italic",
                }}>
                  {q.quote}
                </p>
              </div>

              {/* Attribution */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid #1A1A1E" }}>
                {/* Avatar initial */}
                <div style={{
                  width: 32, height: 32, background: q.color, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span className="display" style={{ fontSize: 14, color: "#000", lineHeight: 1 }}>{q.initial}</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#F4F4F1", fontFamily: "var(--font-grotesk), sans-serif", marginBottom: 2 }}>
                    {q.name}
                  </div>
                  <div className="font-mono" style={{ fontSize: 9, color: "#5C5C63", letterSpacing: "0.08em", lineHeight: 1.4 }}>
                    {q.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .testimonial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL CTA STRIP — bottom-of-page conversion push
// ─────────────────────────────────────────────────────────────────────────────
export function FinalCTA() {
  return (
    <section style={{ background: "#0D0D0F", borderBottom: "2px solid #F4F4F1" }}>
      <div className="shell" style={{ padding: "clamp(56px,7vw,88px) clamp(16px,4vw,40px)" }}>
        <div className="final-cta-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "clamp(32px,4vw,64px)", alignItems: "center" }}>

          <div>
            <p className="font-mono" style={{ fontSize: 12, color: "#7A7A8A", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 16px" }}>
              Ready when you are
            </p>
            <h2 className="display" style={{ fontSize: "clamp(40px,4vw,56px)", margin: "0 0 16px", lineHeight: 1.0, color: "#F4F4F1" }}>
              Your growth playbook,<br />on demand.
            </h2>
            <p style={{ fontSize: 15, color: "#9A9AA8", fontFamily: "var(--font-grotesk), sans-serif", margin: 0, lineHeight: 1.6 }}>
              No sign-up. No credit card. Drop in your business and see exactly what a full strategy looks like.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
            <a href="/#analyze" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--n2)", border: "2px solid var(--n2)",
              color: "#000", padding: "16px 36px",
              fontFamily: "var(--font-archivo), sans-serif",
              fontSize: 15, fontWeight: 800, letterSpacing: "0.04em",
              textTransform: "uppercase", textDecoration: "none", whiteSpace: "nowrap",
            }}>
              Start free →
            </a>
            <a href="#pricing" style={{
              display: "inline-flex", alignItems: "center",
              color: "#5C5C63", padding: "4px 0",
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11, letterSpacing: "0.1em",
              textTransform: "uppercase", textDecoration: "none",
              borderBottom: "1px solid #2A2A2E",
            }}>
              See all plans ↓
            </a>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .final-cta-grid { grid-template-columns: 1fr !important; }
          .final-cta-grid > div:last-child { align-items: flex-start !important; }
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LANDING PRICING — embedded pricing table with section header
// ─────────────────────────────────────────────────────────────────────────────
export function LandingPricing() {
  return (
    <section id="pricing" style={{ borderBottom: "2px solid #F4F4F1" }}>
      <div className="shell" style={{ padding: "clamp(32px,4vw,52px) clamp(16px,4vw,40px)" }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: "clamp(24px,3vw,36px)", flexWrap: "wrap" }}>
          <div>
            <p className="font-mono" style={{ fontSize: 12, color: "var(--n2)", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 8px" }}>
              Pricing
            </p>
            <h2 className="display" style={{ fontSize: "clamp(40px,3vw,40px)", margin: 0, lineHeight: 1.0 }}>
              Simple.<br /><span style={{ color: "var(--n2)" }}>Flexible.</span>
            </h2>
          </div>
          <p style={{ fontSize: 12, color: "#7A7A88", lineHeight: 1.6, margin: 0, maxWidth: 320, fontFamily: "var(--font-grotesk), sans-serif" }}>
            Monthly or annual billing. Cancel before your next renewal — no questions asked.
            Already purchased?{" "}
            <a href="/unlock" style={{ color: "var(--n1)", textDecoration: "underline", textUnderlineOffset: 3 }}>
              Restore your license →
            </a>
          </p>
        </div>

        <PricingTable />

      </div>
    </section>
  );
}
