"use client";
import { useState, useRef, useCallback } from "react";
import type { GrowthReport, SectionKey } from "@/lib/types";
import { SECTION_LABELS, FREE_SECTIONS } from "@/lib/types";
import SectionCard from "./SectionCard";
import ReportActions from "./ReportActions";

interface Props {
  report: Partial<GrowthReport>;
  tier: string | null;
  input: string;
  reportId: string;
}

const GROUPS: { label: string; color: string; keys: SectionKey[] }[] = [
  { label: "Analysis",  color: "var(--n1)", keys: ["executiveSummary","marketAnalysis","competitorAnalysis","positioning"] },
  { label: "Growth",    color: "var(--n3)", keys: ["growthOpportunities","acquisitionPlan","funnelImprovements"] },
  { label: "Assets",    color: "var(--n2)", keys: ["marketingAssets","salesAssets","retentionStrategy","socialMediaStrategy"] },
  { label: "Execution", color: "#9A9AA8",   keys: ["kpiDashboard","topRoiActions","plan7Day","plan30Day","plan90Day","immediateActions"] },
];

const ALL_KEYS: SectionKey[] = GROUPS.flatMap(g => g.keys);
const sectionNum = (key: SectionKey) => String(ALL_KEYS.indexOf(key) + 1).padStart(2, "0");

const ICONS: Record<SectionKey, string> = {
  executiveSummary:"◈", marketAnalysis:"◎", competitorAnalysis:"⊕", positioning:"◆",
  growthOpportunities:"▲", acquisitionPlan:"➤", funnelImprovements:"◑",
  marketingAssets:"✦", salesAssets:"◉", retentionStrategy:"⟳", socialMediaStrategy:"◈",
  kpiDashboard:"▣", topRoiActions:"★", plan7Day:"①", plan30Day:"②", plan90Day:"③", immediateActions:"⚡",
};

export default function MobileReportView({ report, tier, input, reportId }: Props) {
  const [active, setActive] = useState<SectionKey>("executiveSummary");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isPaid = tier !== null;
  const activeIdx = ALL_KEYS.indexOf(active);
  const activeGroup = GROUPS.find(g => g.keys.includes(active))!;

  const goTo = useCallback((key: SectionKey, dir: "left" | "right") => {
    setDirection(dir);
    setTimeout(() => {
      setActive(key);
      setDirection(null);
    }, 220);
  }, []);

  const goNext = useCallback(() => {
    if (activeIdx < ALL_KEYS.length - 1) goTo(ALL_KEYS[activeIdx + 1], "left");
  }, [activeIdx, goTo]);

  const goPrev = useCallback(() => {
    if (activeIdx > 0) goTo(ALL_KEYS[activeIdx - 1], "right");
  }, [activeIdx, goTo]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    // Only trigger on horizontal swipes (not vertical scrolls)
    if (Math.abs(dx) < 60 || dy > Math.abs(dx)) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const animStyle: React.CSSProperties = direction === "left"
    ? { animation: "slideOutLeft 0.22s ease forwards" }
    : direction === "right"
    ? { animation: "slideOutRight 0.22s ease forwards" }
    : {};

  return (
    <>
      <style>{`
        @keyframes slideOutLeft  { to { transform: translateX(-12px); opacity: 0; } }
        @keyframes slideOutRight { to { transform: translateX(12px);  opacity: 0; } }
        @keyframes slideInUp     { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeInSection { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .mobile-report-section { animation: fadeInSection 0.25s ease; }
        .sheet-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:50; }
        .sheet-panel {
          position:fixed; left:0; right:0; bottom:0; z-index:51;
          background:#111113; border-top:2px solid #2A2A2E;
          max-height:75vh; overflow-y:auto;
          animation: slideInUp 0.28s cubic-bezier(0.32,0.72,0,1);
        }
        .section-dot { width:5px; height:5px; border-radius:50%; display:inline-block; flex-shrink:0; }
      `}</style>

      {/* ── Header bar ──────────────────────────────────────────────────────── */}
      <div style={{
        position:"sticky", top:56, zIndex:30,
        background:"rgba(10,10,11,0.97)", backdropFilter:"blur(10px)",
        borderBottom:"1px solid #1E1E22",
        padding:"0 16px", height:44,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:activeGroup.color, display:"inline-block", flexShrink:0 }} />
          <span style={{ fontSize:10, fontFamily:"var(--font-mono)", color:activeGroup.color,
                         letterSpacing:"0.12em", textTransform:"uppercase" }}>
            {activeGroup.label}
          </span>
          <span style={{ color:"#2A2A2E", fontSize:12, margin:"0 2px" }}>›</span>
          <span style={{ fontSize:11, fontFamily:"var(--font-mono)", color:"#F4F4F1",
                         letterSpacing:"0.04em", whiteSpace:"nowrap",
                         overflow:"hidden", textOverflow:"ellipsis", maxWidth:160 }}>
            {SECTION_LABELS[active]}
          </span>
        </div>
        <a href="/"
          style={{ fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:"0.08em",
                   color:"var(--n1)", textTransform:"uppercase", padding:"6px 0 6px 12px",
                   flexShrink:0 }}>
          + New
        </a>
      </div>

      {/* ── Swipeable content area ───────────────────────────────────────────── */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ minHeight:"calc(100dvh - 44px - 56px - 64px)", padding:"24px 20px 120px", overflow:"hidden" }}
      >
        <div style={animStyle}>
          {/* Section header */}
          <div style={{ marginBottom:20 }} className="mobile-report-section">
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <span style={{ fontSize:9, fontFamily:"var(--font-mono)", letterSpacing:"0.16em",
                             textTransform:"uppercase", color:activeGroup.color }}>
                {sectionNum(active)} — {activeGroup.label}
              </span>
            </div>
            <h2 style={{
              fontFamily:"var(--font-archivo), sans-serif", fontWeight:900,
              fontSize:"clamp(26px,7vw,36px)", lineHeight:0.95,
              color:"#F4F4F1", margin:"0 0 10px", letterSpacing:"-0.02em",
            }}>
              {SECTION_LABELS[active]}
            </h2>
            <div style={{ height:2, background:activeGroup.color, width:40, marginBottom:16 }} />
          </div>

          {/* Section content */}
          <div className="mobile-report-section">
            <SectionCard
              sectionKey={active}
              report={report}
              locked={!isPaid && !FREE_SECTIONS.includes(active)}
            />
          </div>
        </div>
      </div>

      {/* ── Fixed bottom nav ─────────────────────────────────────────────────── */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:40,
        background:"rgba(10,10,11,0.98)", backdropFilter:"blur(12px)",
        borderTop:"1px solid #1E1E22",
        padding:"0 16px",
        height:64,
        display:"flex", alignItems:"center", justifyContent:"space-between", gap:8,
      }}>
        {/* Prev */}
        <button
          onClick={goPrev}
          disabled={activeIdx === 0}
          style={{
            width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center",
            border:"1px solid #2A2A2E", background:"transparent",
            color: activeIdx === 0 ? "#2A2A2E" : "#F4F4F1",
            fontSize:18, cursor: activeIdx === 0 ? "default" : "pointer",
            flexShrink:0,
          }}
        >
          ←
        </button>

        {/* Centre — progress dots + sections button */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
          {/* Dot progress */}
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            {ALL_KEYS.map((k, i) => {
              const locked = !isPaid && !FREE_SECTIONS.includes(k);
              const isCurrent = k === active;
              const group = GROUPS.find(g => g.keys.includes(k))!;
              return (
                <span
                  key={k}
                  className="section-dot"
                  style={{
                    background: locked ? "#1E1E22" : isCurrent ? group.color : "#3C3C42",
                    transform: isCurrent ? "scale(1.5)" : "scale(1)",
                    transition:"transform 0.2s ease, background 0.2s ease",
                  }}
                />
              );
            })}
          </div>
          {/* Sections button */}
          <button
            onClick={() => setSheetOpen(true)}
            style={{
              fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:"0.1em",
              textTransform:"uppercase", color:"#7A7A8A",
              background:"transparent", border:"none", padding:0, cursor:"pointer",
            }}
          >
            {activeIdx + 1} / {ALL_KEYS.length} · All sections ↑
          </button>
        </div>

        {/* Next */}
        {activeIdx < ALL_KEYS.length - 1 && !isPaid && !FREE_SECTIONS.includes(ALL_KEYS[activeIdx + 1]) ? (
          <a
            href="/pricing"
            style={{
              width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center",
              background:"var(--n2)", color:"#000",
              fontSize:10, fontFamily:"var(--font-mono)", fontWeight:700,
              letterSpacing:"0.08em", textTransform:"uppercase",
              flexShrink:0, textDecoration:"none",
            }}
          >
            🔒
          </a>
        ) : (
          <button
            onClick={goNext}
            disabled={activeIdx === ALL_KEYS.length - 1}
            style={{
              width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center",
              border:"none",
              background: activeIdx < ALL_KEYS.length - 1 ? activeGroup.color : "transparent",
              borderWidth: activeIdx === ALL_KEYS.length - 1 ? 1 : 0,
              borderStyle:"solid", borderColor:"#2A2A2E",
              color: activeIdx < ALL_KEYS.length - 1 ? "#000" : "#2A2A2E",
              fontSize:18, cursor: activeIdx < ALL_KEYS.length - 1 ? "pointer" : "default",
              flexShrink:0,
            }}
          >
            →
          </button>
        )}
      </div>

      {/* ── Actions bar (email / print / copy) ───────────────────────────────── */}
      <div style={{ position:"fixed", top:"calc(56px + 44px)", right:0, zIndex:35 }}>
        <ReportActions report={report} input={input} tier={tier} compact />
      </div>

      {/* ── Bottom sheet — section list ──────────────────────────────────────── */}
      {sheetOpen && (
        <>
          <div className="sheet-overlay" onClick={() => setSheetOpen(false)} />
          <div className="sheet-panel">
            {/* Handle */}
            <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 8px" }}>
              <div style={{ width:36, height:4, borderRadius:2, background:"#2A2A2E" }} />
            </div>

            {/* Report title */}
            <div style={{ padding:"8px 20px 16px", borderBottom:"1px solid #1E1E22" }}>
              <div style={{ fontSize:9, fontFamily:"var(--font-mono)", letterSpacing:"0.14em",
                            color:"#5C5C63", textTransform:"uppercase", marginBottom:4 }}>
                Growth Report
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:"#F4F4F1", lineHeight:1.3,
                            fontFamily:"var(--font-grotesk), sans-serif",
                            display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                {input}
              </div>
              {isPaid && (
                <div style={{ marginTop:8 }}>
                  <ReportActions report={report} input={input} tier={tier} compact />
                </div>
              )}
            </div>

            {/* Groups + sections */}
            {GROUPS.map(group => (
              <div key={group.label}>
                <div style={{
                  padding:"12px 20px 6px",
                  fontSize:8, fontFamily:"var(--font-mono)", fontWeight:700,
                  letterSpacing:"0.18em", textTransform:"uppercase",
                  color:group.color, display:"flex", alignItems:"center", gap:8,
                }}>
                  <span style={{ width:12, height:1, background:group.color, display:"inline-block" }} />
                  {group.label}
                </div>
                {group.keys.map(key => {
                  const locked = !isPaid && !FREE_SECTIONS.includes(key);
                  const isCurrent = key === active;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        if (!locked) {
                          const dir = ALL_KEYS.indexOf(key) > activeIdx ? "left" : "right";
                          goTo(key, dir);
                        }
                        setSheetOpen(false);
                      }}
                      style={{
                        width:"100%", textAlign:"left", border:"none",
                        padding:"12px 20px",
                        background: isCurrent ? "#16161A" : "transparent",
                        borderLeft: isCurrent ? `3px solid ${group.color}` : "3px solid transparent",
                        display:"flex", alignItems:"center", gap:12,
                        cursor: locked ? "default" : "pointer",
                      }}
                    >
                      <span style={{ fontSize:10, fontFamily:"var(--font-mono)",
                                     color: isCurrent ? group.color : "#3C3C42",
                                     flexShrink:0, width:20 }}>
                        {sectionNum(key)}
                      </span>
                      <span style={{ fontSize:16, color: locked ? "#2A2A2E" : isCurrent ? group.color : "#5C5C63", flexShrink:0 }}>
                        {locked ? "🔒" : ICONS[key]}
                      </span>
                      <span style={{
                        fontSize:13, fontFamily:"var(--font-grotesk), sans-serif",
                        color: locked ? "#3C3C42" : isCurrent ? "#F4F4F1" : "#9A9AA8",
                        lineHeight:1.3, fontWeight: isCurrent ? 700 : 400,
                      }}>
                        {SECTION_LABELS[key]}
                      </span>
                      {isCurrent && (
                        <span style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%",
                                       background:group.color, flexShrink:0 }} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Upgrade CTA if free */}
            {!isPaid && (
              <div style={{ padding:"20px", borderTop:"1px solid #1E1E22", marginTop:8 }}>
                <a href="/pricing" style={{
                  display:"block", textAlign:"center",
                  background:"var(--n2)", color:"#000",
                  fontFamily:"var(--font-archivo), sans-serif", fontWeight:900,
                  fontSize:13, letterSpacing:"0.04em", textTransform:"uppercase",
                  padding:"16px 24px", textDecoration:"none",
                }}>
                  Unlock all 17 sections →
                </a>
              </div>
            )}

            <div style={{ height:32 }} />
          </div>
        </>
      )}
    </>
  );
}
