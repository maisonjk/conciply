"use client";
import { useState } from "react";
import { SECTION_LABELS, FREE_SECTIONS } from "@/lib/types";
import type { SectionKey } from "@/lib/types";
import SectionCard from "./SectionCard";
import { DEMO_REPORT, DEMO_INPUT } from "@/lib/demo-report";

const GROUPS: { label: string; color: string; keys: SectionKey[] }[] = [
  {
    label: "Analysis",
    color: "var(--n1)",
    keys: ["executiveSummary", "marketAnalysis", "competitorAnalysis", "positioning"],
  },
  {
    label: "Growth",
    color: "var(--n3)",
    keys: ["growthOpportunities", "acquisitionPlan", "funnelImprovements"],
  },
  {
    label: "Assets",
    color: "var(--n2)",
    keys: ["marketingAssets", "salesAssets", "retentionStrategy", "socialMediaStrategy"],
  },
  {
    label: "Execution",
    color: "#9A9AA8",
    keys: ["kpiDashboard", "topRoiActions", "plan7Day", "plan30Day", "plan90Day", "immediateActions"],
  },
];

const ALL_KEYS: SectionKey[] = GROUPS.flatMap(g => g.keys);
const sectionNum = (key: SectionKey) => String(ALL_KEYS.indexOf(key) + 1).padStart(2, "0");

const ICONS: Record<SectionKey, string> = {
  executiveSummary: "◈", marketAnalysis: "◎", competitorAnalysis: "⊕",
  positioning: "◆", growthOpportunities: "▲", acquisitionPlan: "➤",
  funnelImprovements: "◑", marketingAssets: "✦", salesAssets: "◉",
  retentionStrategy: "⟳", socialMediaStrategy: "◈", kpiDashboard: "▣",
  topRoiActions: "★", plan7Day: "①", plan30Day: "②", plan90Day: "③",
  immediateActions: "⚡",
};

const SECTION_SUBTITLES: Partial<Record<SectionKey, string>> = {
  executiveSummary:    "ICP, unique value proposition, and single biggest opportunity at a glance.",
  marketAnalysis:      "TAM / SAM / SOM sizing and the market trends that matter most.",
  competitorAnalysis:  "Who you're up against, where they're weak, and the gaps you can exploit.",
  positioning:         "How to frame your brand so the right customers immediately get it.",
  growthOpportunities: "Organic, paid, product-led, and viral levers ranked by potential impact.",
  acquisitionPlan:     "Which channels to prioritise, exact tactics, and how to split your budget.",
  funnelImprovements:  "Where you're leaking revenue and how to fix each stage of the funnel.",
  marketingAssets:     "Ready-to-use landing copy, ad headlines, and a full email sequence.",
  salesAssets:         "Cold outreach script, discovery questions, and objection-handling playbook.",
  retentionStrategy:   "Onboarding steps, engagement loops, and upsell moments to reduce churn.",
  socialMediaStrategy: "Platform-by-platform playbooks, post ideas, hooks, and a 4-week calendar.",
  kpiDashboard:        "The metrics you must track, your 90-day targets, and red flags to watch.",
  topRoiActions:       "Highest-leverage moves ranked by impact, speed, and ease — do these first.",
  plan7Day:            "Day-by-day sprint to get critical foundations in place this week.",
  plan30Day:           "Week-by-week execution plan to build momentum and hit your first milestone.",
  plan90Day:           "Three-month roadmap from launch to traction — themes, milestones, metrics.",
  immediateActions:    "What to do in the next 24 and 72 hours to start moving right now.",
};

export default function DemoPreview() {
  const [active, setActive] = useState<SectionKey>("executiveSummary");
  const activeGroup = GROUPS.find(g => g.keys.includes(active))!;
  const isLocked = !FREE_SECTIONS.includes(active);

  return (
    <div style={{ marginTop: "clamp(56px,7vw,96px)" }}>

      {/* ── Header bar ── */}
      <div style={{
        border: "2px solid var(--n1)",
        borderBottom: "none",
        padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(163,230,53,0.04)",
        flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#000", background: "var(--n1)", padding: "3px 8px",
          }}>
            LIVE DEMO
          </span>
          <span className="font-mono" style={{ fontSize: 11, color: "#9A9AA8", letterSpacing: "0.04em" }}>
            {DEMO_INPUT}
          </span>
        </div>
        <a href="/" style={{
          fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--n1)", textDecoration: "none",
        }}>
          ↑ Generate yours free →
        </a>
      </div>

      {/* ── Main workspace ── */}
      <div style={{
        display: "flex",
        border: "2px solid var(--n1)",
        height: "clamp(520px, 65vh, 700px)",
        overflow: "hidden",
      }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: 220, flexShrink: 0,
          borderRight: "1px solid #1E1E22",
          overflowY: "auto",
          background: "#0A0A0B",
          display: "flex", flexDirection: "column",
        }}>
          {/* Report label */}
          <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #1E1E22" }}>
            <div style={{
              fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.12em",
              color: "#5C5C63", textTransform: "uppercase", marginBottom: 5,
            }}>
              Demo Report
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#F4F4F1", lineHeight: 1.4,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {DEMO_INPUT}
            </div>
          </div>

          {/* Section groups */}
          <nav style={{ flex: 1, padding: "6px 0" }}>
            {GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: 2 }}>
                <div style={{
                  padding: "8px 14px 4px",
                  fontSize: 8, fontFamily: "var(--font-mono)", fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: group.color,
                }}>
                  {group.label}
                </div>
                {group.keys.map(key => {
                  const locked = !FREE_SECTIONS.includes(key);
                  const isActive = key === active;
                  return (
                    <button key={key} onClick={() => setActive(key)}
                      style={{
                        width: "100%", textAlign: "left", border: "none", cursor: "pointer",
                        padding: "7px 14px", display: "flex", alignItems: "center", gap: 8,
                        background: isActive ? "#16161A" : "transparent",
                        borderLeft: isActive ? `2px solid ${group.color}` : "2px solid transparent",
                      }}>
                      <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: isActive ? group.color : "#3C3C42", flexShrink: 0, width: 16 }}>
                        {sectionNum(key)}
                      </span>
                      <span style={{ fontSize: 11, color: locked ? "#3C3C42" : isActive ? "#3C3C42" : "#3C3C42", flexShrink: 0 }}>
                        {locked ? "🔒" : ICONS[key]}
                      </span>
                      <span style={{
                        fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.03em",
                        color: locked ? "#3C3C42" : isActive ? "#F4F4F1" : "#9A9AA8",
                        lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {SECTION_LABELS[key]}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* ── Content panel ── */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Breadcrumb toolbar */}
          <div style={{
            borderBottom: "1px solid #1E1E22",
            padding: "0 20px",
            height: 40, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(10,10,11,0.97)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 9, fontFamily: "var(--font-mono)", color: activeGroup.color,
                letterSpacing: "0.12em", textTransform: "uppercase",
              }}>
                {activeGroup.label}
              </span>
              <span style={{ color: "#2A2A2E" }}>›</span>
              <span style={{
                fontSize: 10, fontFamily: "var(--font-mono)", color: "#F4F4F1",
                letterSpacing: "0.06em",
              }}>
                {SECTION_LABELS[active]}
              </span>
            </div>
            <span style={{
              fontSize: 9, fontFamily: "var(--font-mono)", color: "#5C5C63",
              letterSpacing: "0.1em",
            }}>
              {sectionNum(active)} / {ALL_KEYS.length}
            </span>
          </div>

          {/* Section content — scrollable */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            {/* Section heading */}
            <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: `2px solid ${activeGroup.color}` }}>
              <div style={{
                fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.14em",
                textTransform: "uppercase", color: activeGroup.color, marginBottom: 8,
              }}>
                {sectionNum(active)} — {activeGroup.label}
              </div>
              <h3 className="display" style={{
                fontSize: "clamp(22px,2.5vw,36px)", fontWeight: 900, color: "#F4F4F1",
                lineHeight: 1.05, margin: 0, letterSpacing: "-0.02em",
              }}>
                {SECTION_LABELS[active]}
              </h3>
              {SECTION_SUBTITLES[active] && (
                <p style={{
                  margin: "8px 0 0", fontSize: 12, color: "#9A9AA8",
                  lineHeight: 1.5, fontFamily: "var(--font-grotesk), sans-serif",
                }}>
                  {SECTION_SUBTITLES[active]}
                </p>
              )}
            </div>

            <SectionCard
              sectionKey={active}
              report={DEMO_REPORT}
              locked={isLocked}
            />

            {/* Prev / Next */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, gap: 12 }}>
              {(() => {
                const idx = ALL_KEYS.indexOf(active);
                const prev = idx > 0 ? ALL_KEYS[idx - 1] : null;
                const next = idx < ALL_KEYS.length - 1 ? ALL_KEYS[idx + 1] : null;
                return (
                  <>
                    <button onClick={() => prev && setActive(prev)} disabled={!prev}
                      className="btn-ghost" style={{
                        padding: "8px 16px", fontSize: 11,
                        opacity: prev ? 1 : 0.2, cursor: prev ? "pointer" : "default",
                      }}>
                      ← {prev ? SECTION_LABELS[prev] : ""}
                    </button>
                    <button onClick={() => next && setActive(next)} disabled={!next}
                      className="btn-ghost" style={{
                        padding: "8px 16px", fontSize: 11,
                        opacity: next ? 1 : 0.2, cursor: next ? "pointer" : "default",
                        borderColor: next ? activeGroup.color : undefined,
                        color: next ? activeGroup.color : undefined,
                      }}>
                      {next ? SECTION_LABELS[next] : ""} →
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </main>
      </div>

      {/* ── Footer CTA ── */}
      <div style={{
        border: "2px solid #1E1E22",
        borderTop: "none",
        padding: "16px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#0A0A0B",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span className="font-mono" style={{ fontSize: 11, color: "#5C5C63", letterSpacing: "0.04em" }}>
            8 of 17 sections free · no account required
          </span>
          <span style={{ color: "#2A2A2E" }}>·</span>
          <span className="font-mono" style={{ fontSize: 11, color: "#5C5C63" }}>
            🔒 9 sections unlock with any paid plan
          </span>
        </div>
        <a href="/pricing" className="btn-ghost" style={{ padding: "8px 18px", fontSize: 11, letterSpacing: "0.1em" }}>
          See plans from $19 →
        </a>
      </div>
    </div>
  );
}
