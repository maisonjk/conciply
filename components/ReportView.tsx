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

      <SectionCard
        sectionKey={active}
        report={report}
        locked={!isPaid && !FREE_SECTIONS.includes(active)}
      />
    </div>
  );
}
