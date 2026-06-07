"use client";
import { useState } from "react";
import type { GrowthReport, SectionKey } from "@/lib/types";
import { SECTION_LABELS, FREE_SECTIONS } from "@/lib/types";
import SectionCard from "./SectionCard";

interface Props {
  report: Partial<GrowthReport>;
  tier: string | null;
  input: string;
  reportId: string;
}

// ── Section groups for sidebar nav ──────────────────────────────────────────
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

// Short subtitle shown under the big section title
const SECTION_SUBTITLES: Partial<Record<SectionKey, string>> = {
  executiveSummary:    "Your ICP, unique value proposition, and single biggest opportunity at a glance.",
  marketAnalysis:      "TAM / SAM / SOM sizing and the market trends that matter most for your growth.",
  competitorAnalysis:  "Who you're up against, where they're weak, and the gaps you can exploit.",
  positioning:         "How to frame your brand so the right customers immediately get it.",
  growthOpportunities: "Organic, paid, product-led, and viral levers ranked by potential impact.",
  acquisitionPlan:     "Which channels to prioritise, exact tactics, and how to split your budget.",
  funnelImprovements:  "Where you're leaking revenue and how to fix each stage of the funnel.",
  marketingAssets:     "Ready-to-use landing copy, ad headlines, and a full email sequence.",
  salesAssets:         "Cold outreach script, discovery questions, and objection-handling playbook.",
  retentionStrategy:   "Onboarding steps, engagement loops, and upsell moments to reduce churn.",
  socialMediaStrategy: "Platform-by-platform playbooks, post ideas, hooks, and a 4-week content calendar.",
  kpiDashboard:        "The metrics you must track, your 90-day targets, and red flags to watch.",
  topRoiActions:       "Your highest-leverage moves ranked by impact, speed, and ease — do these first.",
  plan7Day:            "Day-by-day sprint to get the most critical foundations in place this week.",
  plan30Day:           "Week-by-week execution plan to build momentum and hit your first milestone.",
  plan90Day:           "Three-month roadmap from launch to traction — themes, milestones, and metrics.",
  immediateActions:    "What to do in the next 24 and 72 hours to start moving right now.",
};

// Global section index for numbering
const ALL_KEYS: SectionKey[] = GROUPS.flatMap(g => g.keys);
const sectionNum = (key: SectionKey) => String(ALL_KEYS.indexOf(key) + 1).padStart(2, "0");

// Icon per section
const ICONS: Record<SectionKey, string> = {
  executiveSummary:    "◈",
  marketAnalysis:      "◎",
  competitorAnalysis:  "⊕",
  positioning:         "◆",
  growthOpportunities: "▲",
  acquisitionPlan:     "➤",
  funnelImprovements:  "◑",
  marketingAssets:     "✦",
  salesAssets:         "◉",
  retentionStrategy:   "⟳",
  socialMediaStrategy: "◈",
  kpiDashboard:        "▣",
  topRoiActions:       "★",
  plan7Day:            "①",
  plan30Day:           "②",
  plan90Day:           "③",
  immediateActions:    "⚡",
};

export default function ReportView({ report, tier, input, reportId }: Props) {
  const [active, setActive] = useState<SectionKey>("executiveSummary");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isPaid = tier !== null;
  const activeGroup = GROUPS.find(g => g.keys.includes(active))!;

  return (
    <div style={{ display:"flex", minHeight:"calc(100vh - 64px)", position:"relative" }}>

      {/* ── Mobile sidebar toggle ──────────────────────────────────────────── */}
      <button
        onClick={() => setSidebarOpen(o => !o)}
        className="font-mono"
        style={{
          display:"none", position:"fixed", bottom:24, right:24, zIndex:50,
          background:"var(--n1)", color:"#000", border:"none", padding:"12px 18px",
          fontSize:12, letterSpacing:"0.1em", cursor:"pointer",
        }}
        data-mobile-toggle
      >
        {sidebarOpen ? "✕ Close" : "☰ Sections"}
      </button>

      {/* ── Left sidebar ──────────────────────────────────────────────────── */}
      <aside style={{
        width:260, flexShrink:0,
        borderRight:"2px solid #1E1E22",
        position:"sticky", top:64,
        height:"calc(100vh - 64px)",
        overflow:"hidden",
        display:"flex", flexDirection:"column",
        background:"#0A0A0B",
      }}>

        {/* Report title + tier badge */}
        <div style={{ padding:"20px 16px 16px", borderBottom:"1px solid #1E1E22" }}>
          <div style={{ fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:"0.12em",
                        color:"#5C5C63", textTransform:"uppercase", marginBottom:6 }}>
            Report
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:"#F4F4F1", lineHeight:1.4,
                        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical",
                        overflow:"hidden", marginBottom:10 }}>
            {input}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {isPaid ? (
              <span style={{ fontSize:10, fontFamily:"var(--font-mono)", fontWeight:700,
                             letterSpacing:"0.1em", textTransform:"uppercase",
                             color:"#000", background:"var(--n3)", padding:"3px 8px" }}>
                {tier} · unlocked
              </span>
            ) : (
              <span style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"#5C5C63",
                             letterSpacing:"0.1em", textTransform:"uppercase" }}>
                Free · 3 of 17
              </span>
            )}
          </div>
        </div>

        {/* Section groups — only this scrolls, footer stays pinned */}
        <nav style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
          {GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom:4 }}>
              {/* Group label */}
              <div style={{
                padding:"10px 16px 6px",
                fontSize:9, fontFamily:"var(--font-mono)", fontWeight:700,
                letterSpacing:"0.14em", textTransform:"uppercase",
                color: group.color,
              }}>
                {group.label}
              </div>

              {/* Section items */}
              {group.keys.map(key => {
                const locked = !isPaid && !FREE_SECTIONS.includes(key);
                const isActive = key === active;
                return (
                  <button key={key} onClick={() => { setActive(key); setSidebarOpen(false); }}
                    style={{
                      width:"100%", textAlign:"left", border:"none", cursor:"pointer",
                      padding:"9px 16px", display:"flex", alignItems:"center", gap:10,
                      background: isActive ? "#16161A" : "transparent",
                      borderLeft: isActive ? `2px solid ${group.color}` : "2px solid transparent",
                      transition:"background 0.1s",
                    }}>
                    {/* Number */}
                    <span style={{
                      fontSize:9, fontFamily:"var(--font-mono)", color: isActive ? group.color : "#3C3C42",
                      flexShrink:0, width:18,
                    }}>
                      {sectionNum(key)}
                    </span>
                    {/* Icon */}
                    <span style={{ fontSize:13, color: locked ? "#3C3C42" : isActive ? group.color : "#5C5C63", flexShrink:0 }}>
                      {locked ? "🔒" : ICONS[key]}
                    </span>
                    {/* Label */}
                    <span style={{
                      fontSize:12, fontFamily:"var(--font-mono)", letterSpacing:"0.04em",
                      color: locked ? "#3C3C42" : isActive ? "#F4F4F1" : "#9A9AA8",
                      lineHeight:1.3,
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

      {/* ── Right content panel ────────────────────────────────────────────── */}
      <main style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>

        {/* ── Sticky toolbar: breadcrumb + global actions ── */}
        <div style={{
          position:"sticky", top:64, zIndex:20,
          background:"rgba(10,10,11,0.97)", backdropFilter:"blur(8px)",
          borderBottom:"1px solid #1E1E22",
          padding:"0 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          gap:12, height:48, flexWrap:"nowrap", overflowX:"auto",
        }}>
          {/* Breadcrumb — left */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <span style={{ fontSize:10, fontFamily:"var(--font-mono)", color:activeGroup.color,
                           letterSpacing:"0.12em", textTransform:"uppercase" }}>
              {activeGroup.label}
            </span>
            <span style={{ color:"#2A2A2E" }}>›</span>
            <span style={{ fontSize:11, fontFamily:"var(--font-mono)", color:"#F4F4F1",
                           letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
              {SECTION_LABELS[active]}
            </span>
          </div>

          {/* Actions — right */}
          <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
            <a href="/" className="btn-ghost"
              style={{ padding:"5px 10px", fontSize:10, letterSpacing:"0.08em", whiteSpace:"nowrap" }}>
              + New Report
            </a>
            {isPaid && (
              <a href={`/workspace?id=${reportId}`} className="btn-ghost"
                style={{ padding:"5px 10px", fontSize:10, letterSpacing:"0.08em", whiteSpace:"nowrap",
                         color:"var(--n1)", borderColor:"var(--n1)" }}>
                Open Workspace →
              </a>
            )}
            <span style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"#5C5C63",
                           letterSpacing:"0.1em", marginLeft:8, flexShrink:0 }}>
              {sectionNum(active)} / {ALL_KEYS.length}
            </span>
          </div>
        </div>

        {/* Section content */}
        <div style={{ padding:"32px 40px", flex:1 }}>

          {/* Big section title */}
          <div style={{ marginBottom:32, paddingBottom:24, borderBottom:`2px solid ${activeGroup.color}` }}>
            <div style={{
              fontSize:11, fontFamily:"var(--font-mono)", letterSpacing:"0.14em",
              textTransform:"uppercase", color: activeGroup.color, marginBottom:10
            }}>
              {sectionNum(active)} — {activeGroup.label}
            </div>
            <h2 className="display" style={{
              fontSize:"clamp(32px, 3.5vw, 56px)",
              fontWeight:900, color:"#F4F4F1", lineHeight:1.05,
              margin:0, letterSpacing:"-0.02em",
            }}>
              {SECTION_LABELS[active]}
            </h2>
            {SECTION_SUBTITLES[active] && (
              <p style={{
                margin:"12px 0 0", fontSize:13, color:"#9A9AA8",
                lineHeight:1.5, fontFamily:"var(--font-grotesk), sans-serif",
              }}>
                {SECTION_SUBTITLES[active]}
              </p>
            )}
          </div>

          <SectionCard
            sectionKey={active}
            report={report}
            locked={!isPaid && !FREE_SECTIONS.includes(active)}
          />

          {/* Prev / Next navigation */}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:40, gap:12 }}>
            {(() => {
              const idx = ALL_KEYS.indexOf(active);
              const prev = idx > 0 ? ALL_KEYS[idx - 1] : null;
              const next = idx < ALL_KEYS.length - 1 ? ALL_KEYS[idx + 1] : null;
              return (
                <>
                  <button onClick={() => prev && setActive(prev)} disabled={!prev}
                    className="btn-ghost" style={{ padding:"10px 18px", fontSize:12,
                    opacity: prev ? 1 : 0.2, cursor: prev ? "pointer" : "default" }}>
                    ← {prev ? SECTION_LABELS[prev] : ""}
                  </button>
                  <button onClick={() => next && setActive(next)} disabled={!next}
                    className="btn-ghost" style={{ padding:"10px 18px", fontSize:12,
                    opacity: next ? 1 : 0.2, cursor: next ? "pointer" : "default",
                    borderColor: next ? activeGroup.color : undefined,
                    color: next ? activeGroup.color : undefined }}>
                    {next ? SECTION_LABELS[next] : ""} →
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      </main>

      {/* ── Mobile styles injected inline ─────────────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          [data-mobile-toggle] { display: block !important; }
        }
      `}</style>
    </div>
  );
}
