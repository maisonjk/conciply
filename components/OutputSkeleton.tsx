"use client";
import { useEffect, useState } from "react";
import { SECTION_LABELS } from "@/lib/types";
import type { SectionKey } from "@/lib/types";

const SECTIONS: SectionKey[] = [
  "executiveSummary", "marketAnalysis", "competitorAnalysis", "positioning",
  "growthOpportunities", "acquisitionPlan", "funnelImprovements",
  "marketingAssets", "salesAssets", "retentionStrategy", "socialMediaStrategy",
  "kpiDashboard", "topRoiActions", "plan7Day", "plan30Day", "plan90Day", "immediateActions",
];

const COLORS = [
  "var(--n1)", "var(--n3)", "var(--n2)", "var(--n1)",
  "var(--n3)", "var(--n2)", "var(--n1)", "var(--n3)",
  "var(--n2)", "var(--n1)", "var(--n3)", "var(--n2)",
  "var(--n1)", "var(--n3)", "var(--n2)", "var(--n1)", "var(--n3)",
];

export default function OutputSkeleton() {
  const [progress, setProgress] = useState(0);
  const [lit, setLit] = useState(0); // how many section tiles are "lit"

  // Fake progress bar — eases to ~90% then stalls waiting for response
  useEffect(() => {
    const steps = [
      { target: 15,  delay: 300  },
      { target: 35,  delay: 900  },
      { target: 55,  delay: 1800 },
      { target: 70,  delay: 2800 },
      { target: 82,  delay: 4000 },
      { target: 90,  delay: 6000 },
      { target: 94,  delay: 10000 },
    ];
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach(({ target, delay }) => {
      timers.push(setTimeout(() => setProgress(target), delay));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // Light up section tiles one by one
  useEffect(() => {
    if (lit >= SECTIONS.length) return;
    const t = setTimeout(() => setLit(l => l + 1), 680);
    return () => clearTimeout(t);
  }, [lit]);

  return (
    <div style={{ marginTop: 32 }}>

      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span className="font-mono" style={{ fontSize:10, letterSpacing:"0.12em",
                          textTransform:"uppercase", color:"#5C5C63" }}>
            Building your playbook
          </span>
          <span className="font-mono" style={{ fontSize:10, color:"var(--n1)", letterSpacing:"0.08em" }}>
            {progress}%
          </span>
        </div>
        <div style={{ height:3, background:"#1A1A1E", position:"relative", overflow:"hidden" }}>
          {/* Neon fill */}
          <div style={{
            position:"absolute", inset:"0 auto 0 0",
            width:`${progress}%`,
            background:"linear-gradient(90deg, var(--n1), var(--n3))",
            transition:"width 0.8s cubic-bezier(0.4,0,0.2,1)",
          }} />
          {/* Shimmer */}
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
            animation:"shimmer 1.6s linear infinite",
            transform:"translateX(-100%)",
          }} />
        </div>
      </div>

      {/* Section tiles — light up one by one */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))",
        gap:2,
      }}>
        {SECTIONS.map((key, i) => {
          const active = i < lit;
          const color = COLORS[i];
          return (
            <div key={key} style={{
              padding:"10px 12px",
              border:`1px solid ${active ? color : "#1A1A1E"}`,
              background: active ? "rgba(0,0,0,0.4)" : "#0C0C0E",
              transition:"border-color 0.3s, background 0.3s",
              display:"flex", alignItems:"center", gap:8,
            }}>
              {/* Indicator dot */}
              <span style={{
                width:6, height:6, borderRadius:"50%", flexShrink:0,
                background: active ? color : "#2A2A2E",
                boxShadow: active ? `0 0 6px ${color}` : "none",
                transition:"background 0.3s, box-shadow 0.3s",
                animation: active ? "pulseBlock 1.2s ease-in-out infinite" : "none",
              }} />
              <span className="font-mono" style={{
                fontSize:10, letterSpacing:"0.06em", textTransform:"uppercase",
                color: active ? color : "#3C3C42",
                transition:"color 0.3s",
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
              }}>
                {SECTION_LABELS[key]}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
