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
