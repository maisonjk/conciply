"use client";
import { useState } from "react";
import type { GrowthReport, SectionKey } from "@/lib/types";
import { SECTION_LABELS, FREE_SECTIONS } from "@/lib/types";
import SectionCard from "./SectionCard";
import ReportActions from "./ReportActions";
import MobileReportView from "./MobileReportView";
import { useIsMobile } from "@/hooks/useIsMobile";

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
  const isMobile = useIsMobile();
  const [active, setActive] = useState<SectionKey>("executiveSummary");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isPaid = tier !== null;
  const activeGroup = GROUPS.find(g => g.keys.includes(active))!;

  // On mobile: render the native-feeling swipe layout instead of the desktop sidebar layout
  if (isMobile) {
    return <MobileReportView report={report} tier={tier} input={input} reportId={reportId} />;
  }

  return (
    <>
    <div style={{ display:"flex", minHeight:"calc(100vh - 64px)", position:"relative" }}>

      {/* ── Mobile sidebar toggle ──────────────────────────────────────────── */}
      <button
        onClick={() => setSidebarOpen(o => !o)}
        className="font-mono"
        aria-label={sidebarOpen ? "Close sections menu" : "Open sections menu"}
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
      <aside data-sidebar={sidebarOpen ? "open" : "closed"} style={{
        width:260, flexShrink:0,
        borderRight:"2px solid #1E1E22",
        position:"sticky", top:64,
        height:"calc(100vh - 64px)",
        overflow:"hidden",
        display:"flex", flexDirection:"column",
        background:"#0A0A0B",
      }}>

        {/* Report title + tier badge */}
        <div style={{ padding:"16px 16px 14px", borderBottom:"1px solid #1E1E22" }}>
          <div style={{ fontSize:9, fontFamily:"var(--font-mono)", letterSpacing:"0.14em",
                        color:"#5C5C63", textTransform:"uppercase", marginBottom:5 }}>
            Growth Report
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:"#F4F4F1", lineHeight:1.35,
                        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical",
                        overflow:"hidden", marginBottom:10, fontFamily:"var(--font-grotesk), sans-serif" }}>
            {input}
          </div>
          {isPaid ? (
            <span style={{ fontSize:9, fontFamily:"var(--font-mono)", fontWeight:700,
                           letterSpacing:"0.1em", textTransform:"uppercase",
                           color:"#000", background:"var(--n3)", padding:"3px 8px", display:"inline-block" }}>
              {tier} · all sections unlocked
            </span>
          ) : (
            <span style={{ fontSize:9, fontFamily:"var(--font-mono)", color:"var(--n3)",
                           letterSpacing:"0.1em", textTransform:"uppercase" }}>
              Free · 8 of 17 sections
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ padding:"10px 16px", borderBottom:"1px solid #1E1E22" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <span style={{ fontSize:9, fontFamily:"var(--font-mono)", color:"#5C5C63", letterSpacing:"0.1em", textTransform:"uppercase" }}>Progress</span>
            <span style={{ fontSize:9, fontFamily:"var(--font-mono)", color:"#5C5C63" }}>
              {ALL_KEYS.indexOf(active) + 1} / {ALL_KEYS.length}
            </span>
          </div>
          <div style={{ height:2, background:"#1A1A1E", position:"relative" }}>
            <div style={{
              position:"absolute", left:0, top:0, bottom:0,
              width:`${((ALL_KEYS.indexOf(active) + 1) / ALL_KEYS.length) * 100}%`,
              background: activeGroup.color,
              transition:"width 0.3s ease",
            }} />
          </div>
        </div>

        {/* Section groups — only this scrolls, footer stays pinned */}
        <nav style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
          {GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom:4 }}>
              {/* Group label */}
              <div style={{
                padding:"10px 16px 5px",
                fontSize:8, fontFamily:"var(--font-mono)", fontWeight:700,
                letterSpacing:"0.18em", textTransform:"uppercase",
                color: group.color, display:"flex", alignItems:"center", gap:8,
              }}>
                <span style={{ width:14, height:1, background:group.color, display:"inline-block" }} />
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

        {/* ── Top action bar ── */}
        <ReportActions report={report} input={input} tier={tier} />

        {/* Section content */}
        <div style={{ padding:"32px 40px", flex:1 }}>

          {/* Big section title */}
          <div style={{ marginBottom:32, paddingBottom:24, borderBottom:`2px solid ${activeGroup.color}`, position:"relative", overflow:"hidden" }}>
            {/* Watermark number */}
            <div style={{
              position:"absolute", right:-4, top:-28,
              fontSize:"clamp(80px,10vw,140px)",
              fontFamily:"var(--font-archivo), sans-serif", fontWeight:900,
              color:"#111113", letterSpacing:"-0.04em", lineHeight:1,
              userSelect:"none", pointerEvents:"none",
            }}>
              {sectionNum(active)}
            </div>
            <div style={{
              fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:"0.16em",
              textTransform:"uppercase", color: activeGroup.color, marginBottom:12,
              display:"flex", alignItems:"center", gap:8,
            }}>
              <span style={{ width:16, height:1, background:activeGroup.color, display:"inline-block" }} />
              {sectionNum(active)} — {activeGroup.label}
            </div>
            <h2 className="display" style={{
              fontSize:"clamp(28px, 3.2vw, 52px)",
              fontWeight:900, color:"#F4F4F1", lineHeight:1.0,
              margin:0, letterSpacing:"-0.02em", position:"relative",
            }}>
              {SECTION_LABELS[active]}
            </h2>
            {SECTION_SUBTITLES[active] && (
              <p style={{
                margin:"14px 0 0", fontSize:14, color:"#7A7A88",
                lineHeight:1.6, fontFamily:"var(--font-grotesk), sans-serif",
                maxWidth:560, position:"relative",
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
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:40, gap:12 }}>
            {(() => {
              const idx = ALL_KEYS.indexOf(active);
              const prev = idx > 0 ? ALL_KEYS[idx - 1] : null;
              const next = idx < ALL_KEYS.length - 1 ? ALL_KEYS[idx + 1] : null;
              const nextLocked = !isPaid && next !== null && !FREE_SECTIONS.includes(next);
              return (
                <>
                  <button onClick={() => prev && setActive(prev)} disabled={!prev}
                    className="btn-ghost" style={{ padding:"10px 18px", fontSize:12,
                    opacity: prev ? 1 : 0.2, cursor: prev ? "pointer" : "default" }}>
                    ← {prev ? SECTION_LABELS[prev] : ""}
                  </button>

                  {nextLocked ? (
                    <a href="/pricing"
                      style={{
                        display:"inline-flex", alignItems:"center", gap:8,
                        padding:"14px 28px",
                        background:"var(--n2)", border:"2px solid var(--n2)",
                        color:"#000",
                        fontFamily:"var(--font-archivo), sans-serif",
                        fontSize:13, fontWeight:800, letterSpacing:"0.04em",
                        textTransform:"uppercase", textDecoration:"none",
                        cursor:"pointer",
                        transition:"filter .12s, transform .12s, box-shadow .12s",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.filter = "brightness(1.1)";
                        (e.currentTarget as HTMLAnchorElement).style.transform = "translate(-2px,-2px)";
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "6px 6px 0 #F4F4F1";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.filter = "";
                        (e.currentTarget as HTMLAnchorElement).style.transform = "";
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "";
                      }}
                    >
                      🔒 Unlock {ALL_KEYS.length - FREE_SECTIONS.length} more sections →
                    </a>
                  ) : (
                    <button onClick={() => next && setActive(next)} disabled={!next}
                      style={{
                        padding: next ? "14px 28px" : "10px 18px",
                        fontSize: next ? 13 : 12,
                        background: next ? activeGroup.color : "transparent",
                        border: `2px solid ${next ? activeGroup.color : "#3C3C42"}`,
                        color: next ? "#000" : "#F4F4F1",
                        fontFamily:"var(--font-archivo), sans-serif",
                        fontWeight: next ? 800 : 400,
                        letterSpacing: next ? "0.04em" : "0.12em",
                        textTransform:"uppercase",
                        opacity: next ? 1 : 0.2,
                        cursor: next ? "pointer" : "default",
                        transition:"filter .12s, transform .12s, box-shadow .12s",
                      }}
                      onMouseEnter={e => {
                        if (!next) return;
                        (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.08)";
                        (e.currentTarget as HTMLButtonElement).style.transform = "translate(-2px,-2px)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "6px 6px 0 #F4F4F1";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.filter = "";
                        (e.currentTarget as HTMLButtonElement).style.transform = "";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
                      }}
                    >
                      {next ? SECTION_LABELS[next] : ""} {next ? "→" : ""}
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* ── Bottom compact action bar ── */}
        <ReportActions report={report} input={input} tier={tier} compact />

      </main>

      {/* ── Mobile + print styles ─────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          [data-mobile-toggle] { display: block !important; }
          [data-sidebar] {
            position: fixed !important;
            top: 64px !important;
            left: 0 !important;
            height: calc(100vh - 64px) !important;
            z-index: 40;
            transform: translateX(-100%);
            transition: transform 0.2s ease;
            box-shadow: 4px 0 24px rgba(0,0,0,0.6);
          }
          [data-sidebar="open"] {
            transform: translateX(0) !important;
          }
        }
        @media print {
          body > * { display: none !important; }
          #print-report-view { display: block !important; }
        }
      `}</style>
    </div>

    {/* ── Hidden print container — renders as the PDF ── */}
    <div id="print-report-view" style={{ display:"none" }}>
      <div style={{ fontFamily:"Georgia, 'Times New Roman', serif", background:"#fff", color:"#111", maxWidth:800, margin:"0 auto", padding:"40px 48px" }}>

        {/* Cover block */}
        <div style={{ borderBottom:"4px solid #111", paddingBottom:24, marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <div style={{ display:"flex", gap:4 }}>
              <span style={{ width:10, height:20, background:"#00E5FF", display:"inline-block" }} />
              <span style={{ width:10, height:20, background:"#FF2E6E", display:"inline-block" }} />
              <span style={{ width:10, height:20, background:"#D4FF2E", display:"inline-block" }} />
            </div>
            <span style={{ fontFamily:"Arial Black, Arial, sans-serif", fontSize:16, fontWeight:900, letterSpacing:"-0.01em", textTransform:"uppercase" }}>Conciply</span>
            <span style={{ fontFamily:"monospace", fontSize:9, color:"#999", letterSpacing:"0.14em", textTransform:"uppercase" }}>Autonomous Growth OS</span>
          </div>
          <div style={{ fontFamily:"monospace", fontSize:10, color:"#999", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:10 }}>
            Growth Playbook
          </div>
          <h1 style={{ fontFamily:"Arial Black, Arial, sans-serif", fontSize:28, fontWeight:900, margin:"0 0 12px", lineHeight:1.1, textTransform:"uppercase", letterSpacing:"-0.01em" }}>
            {input}
          </h1>
          <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ fontFamily:"monospace", fontSize:10, color:"#666", letterSpacing:"0.1em", textTransform:"uppercase" }}>
              {tier ? `${tier} Plan · All 17 sections` : `Free · ${FREE_SECTIONS.length} of 17 sections`}
            </span>
            <span style={{ fontFamily:"monospace", fontSize:10, color:"#999" }}>conciply.com</span>
            <span style={{ fontFamily:"monospace", fontSize:10, color:"#999" }}>
              {new Date().toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })}
            </span>
          </div>
        </div>

        {/* Privacy note */}
        <div style={{ fontFamily:"monospace", fontSize:9, color:"#bbb", borderLeft:"3px solid #eee", paddingLeft:12, marginBottom:40, lineHeight:1.7 }}>
          Generated privately by Conciply. This report and its data are not stored on our servers.
          AI-generated for strategic inspiration — review before acting. conciply.com/terms
        </div>

        {/* Sections */}
        {ALL_KEYS.map((key, i) => {
          const group = GROUPS.find(g => g.keys.includes(key))!;
          const locked = !isPaid && !FREE_SECTIONS.includes(key);
          if (locked) return null;
          return (
            <div key={key} style={{ marginBottom:48, pageBreakInside:"avoid" }}>
              <div style={{ display:"flex", alignItems:"baseline", gap:12, borderBottom:"2px solid #111", paddingBottom:10, marginBottom:20 }}>
                <span style={{ fontFamily:"monospace", fontSize:9, color:"#999", letterSpacing:"0.14em", textTransform:"uppercase", flexShrink:0 }}>
                  {String(i+1).padStart(2,"0")} — {group.label}
                </span>
                <h2 style={{ fontFamily:"Arial Black, Arial, sans-serif", fontSize:20, fontWeight:900, margin:0, textTransform:"uppercase", letterSpacing:"-0.01em" }}>
                  {SECTION_LABELS[key]}
                </h2>
              </div>
              <SectionCard sectionKey={key} report={report} locked={false} />
            </div>
          );
        })}
        {/* Print footer */}
        <div style={{ borderTop:"2px solid #111", paddingTop:16, marginTop:48, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
          <span style={{ fontFamily:"monospace", fontSize:9, color:"#999", letterSpacing:"0.1em", textTransform:"uppercase" }}>
            Powered by Conciply · conciply.com
          </span>
          <span style={{ fontFamily:"monospace", fontSize:9, color:"#bbb" }}>
            AI-generated for strategic inspiration. Review before acting.
          </span>
        </div>
      </div>
    </div>
    </>
  );
}
