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

// ── Shared style helpers ─────────────────────────────────────────────────────
const card = { border:"1px solid #1E1E22", padding:"14px 16px", marginBottom:4 } as const;
const label = (color = "#9A9AA8") => ({ marginBottom:6, color, fontSize:11, fontFamily:"var(--font-mono)", letterSpacing:"0.1em", textTransform:"uppercase" as const });
const body = { color:"#C4C4CC", fontSize:14, lineHeight:1.6, margin:0 } as const;
const pill = (color: string) => ({
  display:"inline-block", padding:"2px 8px", fontSize:11,
  fontFamily:"var(--font-mono)", border:`1px solid ${color}`, color,
} as const);

function StringList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin:0, padding:"0 0 0 20px" }}>
      {items.map((t, i) => <li key={i} style={body}>{t}</li>)}
    </ul>
  );
}

function renderSection(key: SectionKey, report: Partial<GrowthReport>): React.ReactNode {
  const data = (report as Record<string, unknown>)[key];
  if (!data) return null;

  // ── Competitor Analysis ──────────────────────────────────────────────────
  if (key === "competitorAnalysis") {
    const { competitors, gaps, advantages } = data as GrowthReport["competitorAnalysis"];
    return (
      <div>
        {competitors?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={label()}>Competitors</div>
            {competitors.map((c, i) => (
              <div key={i} style={{ ...card, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:"#F4F4F1", marginBottom:6 }}>{c.name}</div>
                  <div style={label("var(--n3)")}>Strength</div>
                  <p style={body}>{c.strength}</p>
                </div>
                <div>
                  <div style={label("var(--n2)")}>Weakness</div>
                  <p style={body}>{c.weakness}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {gaps?.length > 0 && <div style={{ marginBottom:16 }}><div style={label()}>Market Gaps</div><StringList items={gaps} /></div>}
        {advantages?.length > 0 && <div><div style={label()}>Your Advantages</div><StringList items={advantages} /></div>}
      </div>
    );
  }

  // ── Acquisition Plan ─────────────────────────────────────────────────────
  if (key === "acquisitionPlan") {
    const { channels, tactics, budgetGuidance } = data as GrowthReport["acquisitionPlan"];
    const priorityColor = (p: string) => p === "high" ? "var(--n3)" : p === "medium" ? "var(--n1)" : "#9A9AA8";
    return (
      <div>
        {channels?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={label()}>Channels</div>
            {channels.map((c, i) => (
              <div key={i} style={{ ...card, display:"flex", alignItems:"flex-start", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15, color:"#F4F4F1", marginBottom:4 }}>{c.name}</div>
                  <p style={body}>{c.rationale}</p>
                </div>
                <div style={pill(priorityColor(c.priority))}>{c.priority}</div>
              </div>
            ))}
          </div>
        )}
        {tactics?.length > 0 && <div style={{ marginBottom:16 }}><div style={label()}>Tactics</div><StringList items={tactics} /></div>}
        {budgetGuidance && <div><div style={label()}>Budget Guidance</div><p style={body}>{budgetGuidance}</p></div>}
      </div>
    );
  }

  // ── Marketing Assets ─────────────────────────────────────────────────────
  if (key === "marketingAssets") {
    const { landingCopy, adCopy, emailSequence } = data as GrowthReport["marketingAssets"];
    return (
      <div>
        {landingCopy && (
          <div style={{ marginBottom:20 }}>
            <div style={label()}>Landing Page Copy</div>
            <div style={{ ...card, borderLeft:"3px solid var(--n1)" }}>
              <p style={body}>{landingCopy}</p>
            </div>
          </div>
        )}
        {adCopy?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={label()}>Ad Headlines</div>
            {adCopy.map((line, i) => (
              <div key={i} style={{ ...card, display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ color:"var(--n2)", fontFamily:"var(--font-mono)", fontSize:11 }}>{String(i+1).padStart(2,"0")}</span>
                <span style={{ color:"#F4F4F1", fontSize:14 }}>{line}</span>
              </div>
            ))}
          </div>
        )}
        {emailSequence?.length > 0 && (
          <div>
            <div style={label()}>Email Sequence</div>
            {emailSequence.map((e, i) => (
              <div key={i} style={{ ...card, marginBottom:8 }}>
                <div style={label("var(--n1)")}>Email {i+1} — {e.subject}</div>
                <p style={{ ...body, marginBottom:8 }}>{e.body}</p>
                <div style={label()}>CTA</div>
                <p style={{ ...body, color:"var(--n3)" }}>{e.cta}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Sales Assets ─────────────────────────────────────────────────────────
  if (key === "salesAssets") {
    const { outreachScript, discoveryQuestions, objections } = data as GrowthReport["salesAssets"];
    return (
      <div>
        {outreachScript && (
          <div style={{ marginBottom:20 }}>
            <div style={label()}>Cold Outreach Script</div>
            <div style={{ ...card, borderLeft:"3px solid var(--n2)" }}>
              <p style={{ ...body, whiteSpace:"pre-line" }}>{outreachScript}</p>
            </div>
          </div>
        )}
        {discoveryQuestions?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={label()}>Discovery Questions</div>
            {discoveryQuestions.map((q, i) => (
              <div key={i} style={{ ...card, display:"flex", gap:12 }}>
                <span style={{ color:"var(--n1)", fontFamily:"var(--font-mono)", fontSize:11, flexShrink:0 }}>Q{i+1}</span>
                <span style={{ color:"#C4C4CC", fontSize:14 }}>{q}</span>
              </div>
            ))}
          </div>
        )}
        {objections?.length > 0 && (
          <div>
            <div style={label()}>Objection Handling</div>
            {objections.map((o, i) => (
              <div key={i} style={{ ...card, marginBottom:8 }}>
                <div style={{ ...label("var(--n2)"), marginBottom:4 }}>❝ {o.objection}</div>
                <p style={body}>{o.response}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── KPI Dashboard ────────────────────────────────────────────────────────
  if (key === "kpiDashboard") {
    const { metrics, targets, warnings } = data as GrowthReport["kpiDashboard"];
    const freqColor = (f: string) => f === "daily" ? "var(--n3)" : f === "weekly" ? "var(--n1)" : "#9A9AA8";
    return (
      <div>
        {metrics?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={label()}>Metrics</div>
            {metrics.map((m, i) => (
              <div key={i} style={{ ...card, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:"#F4F4F1" }}>{m.metric}</div>
                  <div style={{ ...body, fontSize:13 }}>Target: {m.target}</div>
                </div>
                <div style={pill(freqColor(m.frequency))}>{m.frequency}</div>
              </div>
            ))}
          </div>
        )}
        {targets?.length > 0 && <div style={{ marginBottom:16 }}><div style={label()}>90-Day Targets</div><StringList items={targets} /></div>}
        {warnings?.length > 0 && (
          <div>
            <div style={label("var(--n2)")}>⚠ Red Flags to Watch</div>
            <StringList items={warnings} />
          </div>
        )}
      </div>
    );
  }

  // ── Top ROI Actions ──────────────────────────────────────────────────────
  if (key === "topRoiActions") {
    const { actions } = data as GrowthReport["topRoiActions"];
    return (
      <div>
        {actions.map((a, i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                                 ...card }}>
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

  // ── Plan: 7-Day ──────────────────────────────────────────────────────────
  if (key === "plan7Day") {
    const { days } = data as GrowthReport["plan7Day"];
    return (
      <div>
        {days.map(d => (
          <div key={d.day} style={{ marginBottom:16 }}>
            <div className="kicker" style={{ color:"var(--n1)", marginBottom:6 }}>Day {d.day}</div>
            <StringList items={d.tasks} />
          </div>
        ))}
      </div>
    );
  }

  // ── Plan: 30-Day ─────────────────────────────────────────────────────────
  if (key === "plan30Day") {
    const { weeks } = data as GrowthReport["plan30Day"];
    return (
      <div>
        {weeks.map(w => (
          <div key={w.week} style={{ marginBottom:16 }}>
            <div className="kicker" style={{ color:"var(--n1)", marginBottom:4 }}>Week {w.week} — {w.focus}</div>
            <StringList items={w.tasks} />
          </div>
        ))}
      </div>
    );
  }

  // ── Plan: 90-Day ─────────────────────────────────────────────────────────
  if (key === "plan90Day") {
    const { months } = data as GrowthReport["plan90Day"];
    return (
      <div>
        {months.map(m => (
          <div key={m.month} style={{ marginBottom:16 }}>
            <div className="kicker" style={{ color:"var(--n1)", marginBottom:4 }}>Month {m.month} — {m.theme}</div>
            <StringList items={m.milestones} />
          </div>
        ))}
      </div>
    );
  }

  // ── Generic fallback (executiveSummary, positioning, growthOpportunities,
  //    funnelImprovements, retentionStrategy, immediateActions) ─────────────
  return (
    <div>
      {Object.entries(data as Record<string, unknown>).map(([field, value]) => (
        <div key={field} style={{ marginBottom:16 }}>
          <div className="kicker" style={{ marginBottom:6, color:"#9A9AA8" }}>
            {field.replace(/([A-Z])/g, " $1").trim().toUpperCase()}
          </div>
          {Array.isArray(value) ? (
            <StringList items={(value as unknown[]).map(v => typeof v === "string" ? v : JSON.stringify(v))} />
          ) : (
            <p style={body}>
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
