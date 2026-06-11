"use client";
import type { GrowthReport, SectionKey } from "@/lib/types";
import { SECTION_LABELS } from "@/lib/types";

interface Props {
  sectionKey: SectionKey;
  report: Partial<GrowthReport>;
  locked: boolean;
  mobile?: boolean;
  onDeepDive?: (key: SectionKey) => void;
  onRegenerate?: (key: SectionKey) => void;
}

// ── Safe string coercion ─────────────────────────────────────────────────────
// The AI sometimes returns objects ({step, action, tool, expectedOutcome}) where
// the schema expects strings. This helper makes every render site crash-proof.
function toStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    // Prefer common text-like keys before falling back to JSON
    const o = val as Record<string, unknown>;
    if (typeof o.action === "string")        return o.action;
    if (typeof o.step === "string")          return o.step;
    if (typeof o.task === "string")          return o.task;
    if (typeof o.description === "string")   return o.description;
    if (typeof o.text === "string")          return o.text;
    // Last resort: readable JSON
    try { return JSON.stringify(val); } catch { return String(val); }
  }
  return String(val);
}

// ── Shared style helpers ─────────────────────────────────────────────────────
const card = (mobile?: boolean) => ({
  border:"1px solid #1E1E22",
  padding: mobile ? "10px 12px" : "14px 16px",
  marginBottom:4,
}) as const;
const label = (color = "#9A9AA8", mobile?: boolean) => ({
  marginBottom: mobile ? 5 : 6,
  color,
  fontSize: mobile ? 10 : 13,
  fontFamily:"var(--font-mono)",
  letterSpacing: mobile ? "0.12em" : "0.1em",
  textTransform:"uppercase" as const,
});
// dir:"auto" applied via attribute (not style) — set on elements individually
const body = { color:"#C4C4CC", fontSize:16, lineHeight:1.6, margin:0 } as const;
const bodyProps = { style:body, dir:"auto" as const };
const pill = (color: string, mobile?: boolean) => ({
  display:"inline-block",
  padding: mobile ? "2px 6px" : "2px 8px",
  fontSize: mobile ? 10 : 13,
  fontFamily:"var(--font-mono)", border:`1px solid ${color}`, color,
} as const);
const nameSize = (mobile?: boolean) => mobile ? 15 : 18;

// dir="auto" lets the browser detect RTL (Arabic, Hebrew) per element
function StringList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin:0, padding:"0 0 0 20px" }}>
      {items.map((t, i) => <li key={i} style={body} dir="auto">{toStr(t)}</li>)}
    </ul>
  );
}

function renderSection(key: SectionKey, report: Partial<GrowthReport>, mobile?: boolean): React.ReactNode {
  const data = (report as Record<string, unknown>)[key];
  if (!data) return null;
  const c$ = () => card(mobile);
  const l$ = (color?: string) => label(color, mobile);
  const p$ = (color: string) => pill(color, mobile);
  const n$ = nameSize(mobile);

  // ── Competitor Analysis ──────────────────────────────────────────────────
  if (key === "competitorAnalysis") {
    const { competitors, gaps, advantages } = data as GrowthReport["competitorAnalysis"];
    return (
      <div>
        {competitors?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={l$()}>Competitors</div>
            {competitors.map((c, i) => (
              <div key={i} style={{ marginBottom:12, border:"1px solid #2A2A2E", overflow:"hidden" }}>
                {/* Competitor name header */}
                <div style={{ padding: mobile ? "10px 12px" : "12px 16px", borderBottom:"1px solid #2A2A2E", background:"#111114",
                              display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"#5C5C63",
                                 letterSpacing:"0.12em", textTransform:"uppercase", flexShrink:0 }}>
                    {String(i+1).padStart(2,"0")}
                  </span>
                  <div style={{ fontWeight:900, fontSize: n$, color:"#F4F4F1",
                                fontFamily:"var(--font-archivo)", letterSpacing:"-0.01em" }}>{c.name}</div>
                </div>
                {/* Strength */}
                <div style={{ padding: mobile ? "10px 12px" : "14px 16px", borderBottom:"1px solid #2A2A2E",
                              borderLeft:"3px solid var(--n3)", background:"rgba(212,255,46,0.03)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                    <span style={{ color:"var(--n3)", fontSize:10, fontFamily:"var(--font-mono)",
                                   letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:700 }}>
                      ▲ Strength
                    </span>
                  </div>
                  <p style={{ ...body, margin:0 }} dir="auto">{c.strength}</p>
                </div>
                {/* Weakness */}
                <div style={{ padding: mobile ? "10px 12px" : "14px 16px",
                              borderLeft:"3px solid var(--n2)", background:"rgba(255,46,110,0.03)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                    <span style={{ color:"var(--n2)", fontSize:10, fontFamily:"var(--font-mono)",
                                   letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:700 }}>
                      ▼ Weakness
                    </span>
                  </div>
                  <p style={{ ...body, margin:0 }} dir="auto">{c.weakness}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {gaps?.length > 0 && <div style={{ marginBottom:16 }}><div style={l$()}>Market Gaps</div><StringList items={gaps} /></div>}
        {advantages?.length > 0 && <div><div style={l$()}>Your Advantages</div><StringList items={advantages} /></div>}
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
            <div style={l$()}>Channels</div>
            {channels.map((c, i) => (
              <div key={i} style={{ ...c$(), display:"flex", alignItems:"flex-start", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize: n$, color:"#F4F4F1", marginBottom:4 }}>{c.name}</div>
                  <p {...bodyProps}>{c.rationale}</p>
                </div>
                <div style={p$(priorityColor(c.priority))}>{c.priority}</div>
              </div>
            ))}
          </div>
        )}
        {tactics?.length > 0 && <div style={{ marginBottom:16 }}><div style={l$()}>Tactics</div><StringList items={tactics} /></div>}
        {budgetGuidance && <div><div style={l$()}>Budget Guidance</div><p style={body}>{budgetGuidance}</p></div>}
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
            <div style={l$()}>Landing Page Copy</div>
            <div style={{ ...c$(), borderLeft:"3px solid var(--n1)" }}>
              <p {...bodyProps}>{landingCopy}</p>
            </div>
          </div>
        )}
        {adCopy?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={l$()}>Ad Headlines</div>
            {adCopy.map((line, i) => (
              <div key={i} style={{ ...c$(), display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ color:"var(--n2)", fontFamily:"var(--font-mono)", fontSize:16 }}>{String(i+1).padStart(2,"0")}</span>
                <span style={{ color:"#F4F4F1", fontSize:16 }}>{line}</span>
              </div>
            ))}
          </div>
        )}
        {emailSequence?.length > 0 && (
          <div>
            <div style={l$()}>Email Sequence</div>
            {emailSequence.map((e, i) => (
              <div key={i} style={{ ...c$(), marginBottom:8 }}>
                <div style={l$("var(--n1)")}>Email {i+1} — {e.subject}</div>
                <p style={{ ...body, marginBottom:8 }} dir="auto">{e.body}</p>
                <div style={l$()}>CTA</div>
                <p style={{ ...body, color:"var(--n3)" }} dir="auto">{e.cta}</p>
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
            <div style={l$()}>Cold Outreach Script</div>
            <div style={{ ...c$(), borderLeft:"3px solid var(--n2)" }}>
              <p style={{ ...body, whiteSpace:"pre-line" }} dir="auto">{outreachScript}</p>
            </div>
          </div>
        )}
        {discoveryQuestions?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={l$()}>Discovery Questions</div>
            {discoveryQuestions.map((q, i) => (
              <div key={i} style={{ ...c$(), display:"flex", gap:12 }}>
                <span style={{ color:"var(--n1)", fontFamily:"var(--font-mono)", fontSize:16, flexShrink:0 }}>Q{i+1}</span>
                <span style={{ color:"#C4C4CC", fontSize:16 }}>{q}</span>
              </div>
            ))}
          </div>
        )}
        {objections?.length > 0 && (
          <div>
            <div style={l$()}>Objection Handling</div>
            {objections.map((o, i) => (
              <div key={i} style={{ ...c$(), marginBottom:8 }}>
                <div style={{ ...l$("var(--n2)"), marginBottom:4 }}>❝ {o.objection}</div>
                <p {...bodyProps}>{o.response}</p>
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
    const freqColor = (f: string) => f === "daily" ? "var(--n3)" : f === "weekly" ? "var(--n1)" : "var(--n2)";
    const freqIcon  = (f: string) => f === "daily" ? "●" : f === "weekly" ? "◆" : "▲";
    return (
      <div>
        {/* Metric stat cards — 2-col grid */}
        {metrics?.length > 0 && (
          <div style={{ marginBottom:28 }}>
            <div style={l$()}>Tracked Metrics</div>
            <div style={{ display:"grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(auto-fill, minmax(180px,1fr))", gap: mobile ? 6 : 8 }}>
              {metrics.map((m, i) => (
                <div key={i} style={{
                  background:"#111114", border:"1px solid #2A2A2E",
                  padding:"18px 16px", position:"relative", overflow:"hidden"
                }}>
                  {/* coloured top bar */}
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:freqColor(m.frequency) }} />
                  <div style={{ fontSize:16, fontFamily:"var(--font-mono)", color:freqColor(m.frequency),
                                letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>
                    {freqIcon(m.frequency)} {m.frequency}
                  </div>
                  <div style={{ fontSize:16, color:"#9A9AA8", marginBottom:6, lineHeight:1.3 }}>{m.metric}</div>
                  <div style={{ fontSize:n$, fontWeight:800, color:"#F4F4F1", fontFamily:"var(--font-archivo)", lineHeight:1 }}>
                    {m.target}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 90-day targets as checklist */}
        {targets?.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={l$()}>90-Day Targets</div>
            <div style={{ border:"1px solid #2A2A2E" }}>
              {targets.map((t, i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"flex-start", gap:12, padding:"12px 16px",
                  borderBottom: i < targets.length - 1 ? "1px solid #1E1E22" : "none"
                }}>
                  <span style={{ color:"var(--n3)", marginTop:2, flexShrink:0, fontSize:13 }}>◉</span>
                  <span style={{ color:"#C4C4CC", fontSize:16, lineHeight:1.5 }}>{toStr(t)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Red flags */}
        {warnings?.length > 0 && (
          <div style={{ background:"rgba(236,72,153,0.06)", border:"1px solid rgba(236,72,153,0.25)", padding:"16px 20px" }}>
            <div style={{ ...l$("var(--n2)"), marginBottom:12 }}>⚠ Red Flags to Watch</div>
            {warnings.map((w, i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom: i < warnings.length-1 ? 10 : 0 }}>
                <span style={{ color:"var(--n2)", flexShrink:0 }}>▸</span>
                <span style={{ color:"#C4C4CC", fontSize:16, lineHeight:1.5 }}>{w}</span>
              </div>
            ))}
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
        {/* Scoring legend */}
        <div style={{
          display:"flex", gap:0, marginBottom:16,
          border:"1px solid #1E1E22", overflow:"hidden",
        }}>
          {[
            { label:"ROI Score", desc:"(Impact × Speed) ÷ Difficulty — higher = do it first", color:"var(--n3)" },
            { label:"Impact",    desc:"Revenue / growth potential (1–10)", color:"var(--n1)" },
            { label:"Speed",     desc:"How fast you'll see results (1–10)", color:"#9A9AA8" },
            { label:"Difficulty",desc:"Time + effort required (1=easy, 10=hard)", color:"var(--n2)" },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              flex:1, padding:"10px 12px",
              borderRight: i < arr.length - 1 ? "1px solid #1E1E22" : "none",
              background:"#111114",
            }}>
              <div style={{ fontSize:14, fontFamily:"var(--font-mono)", fontWeight:700,
                            letterSpacing:"0.1em", textTransform:"uppercase",
                            color: item.color, marginBottom:4 }}>
                {item.label}
              </div>
              <div style={{ fontSize:16, color:"#5C5C63", lineHeight:1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {actions.map((a, i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                                 ...c$() }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:n$, color:"#F4F4F1", marginBottom:4 }}>{a.title}</div>
              <div style={{ fontSize:13, color:"#C4C4CC", lineHeight:1.5, marginBottom:6 }}>{a.description}</div>
              <div className="kicker" style={{ color:"#9A9AA8" }}>
                Impact {a.impact} · Speed {a.speed} · Difficulty {a.difficulty}
              </div>
            </div>
            <div style={{ marginLeft:16, flexShrink:0, textAlign:"center" }}>
              <div className="display" style={{ fontSize:n$, color:"var(--n3)", lineHeight:1 }}>
                {a.score.toFixed(1)}
              </div>
              <div style={{ fontSize:13, fontFamily:"var(--font-mono)", color:"#5C5C63",
                            letterSpacing:"0.1em", textTransform:"uppercase", marginTop:2 }}>
                score
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Plan: 7-Day ──────────────────────────────────────────────────────────
  if (key === "plan7Day") {
    const { days } = data as GrowthReport["plan7Day"];
    const dayColor = (d: number) => d <= 2 ? "var(--n3)" : d <= 5 ? "var(--n1)" : "var(--n2)";
    return (
      <div>
        <div style={{ display:"grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(auto-fill, minmax(220px,1fr))", gap: mobile ? 6 : 8 }}>
          {days.map(d => (
            <div key={d.day} style={{
              background:"#111114", border:"1px solid #2A2A2E",
              padding: mobile ? "14px 12px" : "20px 18px", position:"relative"
            }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:dayColor(d.day) }} />
              {/* Big day number */}
              <div style={{
                fontSize: mobile ? 40 : 66, fontWeight:900, fontFamily:"var(--font-archivo)",
                color: dayColor(d.day), lineHeight:1, marginBottom: mobile ? 10 : 14, opacity:0.9
              }}>
                {String(d.day).padStart(2,"0")}
              </div>
              {/* Tasks as checklist */}
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {d.tasks.map((t, i) => (
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                    <span style={{ color:dayColor(d.day), fontSize:14, marginTop:4, flexShrink:0 }}>▸</span>
                    <span style={{ color:"#C4C4CC", fontSize:13, lineHeight:1.5 }}>{toStr(t)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Plan: 30-Day ─────────────────────────────────────────────────────────
  if (key === "plan30Day") {
    const { weeks } = data as GrowthReport["plan30Day"];
    const weekAccent = ["var(--n3)","var(--n1)","var(--n2)","#9A9AA8"];
    return (
      <div>
        {weeks.map((w, idx) => (
          <div key={w.week} style={{
            borderLeft:`3px solid ${weekAccent[idx % 4]}`,
            paddingLeft:20, marginBottom:24
          }}>
            {/* Week header */}
            <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:12 }}>
              <span style={{
                fontSize:16, fontFamily:"var(--font-mono)", fontWeight:700,
                color: weekAccent[idx % 4], letterSpacing:"0.12em", textTransform:"uppercase"
              }}>Week {w.week}</span>
              <span style={{ color:"#F4F4F1", fontWeight:700, fontSize:n$ }}>{w.focus}</span>
            </div>
            {/* Tasks */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {w.tasks.map((t, i) => (
                <div key={i} style={{
                  display:"flex", gap:10, alignItems:"flex-start",
                  background:"#111114", border:"1px solid #1E1E22", padding:"10px 14px"
                }}>
                  <span style={{ color: weekAccent[idx % 4], fontSize:16, marginTop:3, flexShrink:0 }}>◆</span>
                  <span style={{ color:"#C4C4CC", fontSize:13, lineHeight:1.5 }}>{toStr(t)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Plan: 90-Day ─────────────────────────────────────────────────────────
  if (key === "plan90Day") {
    const { months } = data as GrowthReport["plan90Day"];
    const monthAccent = ["var(--n3)","var(--n1)","var(--n2)"];
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {months.map((m, idx) => (
          <div key={m.month} style={{
            background:"#111114", border:"1px solid #2A2A2E",
            padding:"24px 20px", position:"relative", overflow:"hidden"
          }}>
            {/* Giant faded month number as background */}
            <div style={{
              position:"absolute", top:-10, right:12,
              fontSize:164, fontWeight:900, fontFamily:"var(--font-archivo)",
              color: monthAccent[idx % 3], opacity:0.06, lineHeight:1, userSelect:"none",
              pointerEvents:"none"
            }}>
              {m.month}
            </div>
            {/* Month badge + theme */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <div style={{
                width:40, height:40, background: monthAccent[idx % 3],
                display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:900, fontFamily:"var(--font-archivo)", fontSize:n$, color:"#000", flexShrink:0
              }}>
                {m.month}
              </div>
              <div>
                <div style={{ fontSize:16, fontFamily:"var(--font-mono)", color:"#9A9AA8",
                              letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:2 }}>
                  Month {m.month}
                </div>
                <div style={{ fontWeight:700, fontSize:16, color:"#F4F4F1" }}>{m.theme}</div>
              </div>
            </div>
            {/* Milestones */}
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {m.milestones.map((ms, i) => (
                <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <span style={{ color: monthAccent[idx % 3], flexShrink:0, marginTop:3, fontSize:13 }}>◉</span>
                  <span style={{ color:"#C4C4CC", fontSize:16, lineHeight:1.5 }}>{toStr(ms)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Social Media Strategy ────────────────────────────────────────────────
  if (key === "socialMediaStrategy") {
    const { platforms, contentCalendar, hashtagStrategy, viralFormulas } = data as GrowthReport["socialMediaStrategy"];
    const platformColor = (p: string) => {
      const lp = p.toLowerCase();
      if (lp.includes("instagram")) return "#E1306C";
      if (lp.includes("tiktok"))    return "#69C9D0";
      if (lp.includes("facebook"))  return "#1877F2";
      if (lp.includes("youtube"))   return "#FF0000";
      if (lp.includes("linkedin"))  return "#0A66C2";
      if (lp.includes("twitter") || lp.includes("x/")) return "#1DA1F2";
      if (lp.includes("pinterest")) return "#E60023";
      return "var(--n2)";
    };
    const platformIcon = (p: string) => {
      const lp = p.toLowerCase();
      if (lp.includes("instagram")) return "◈";
      if (lp.includes("tiktok"))    return "▶";
      if (lp.includes("facebook"))  return "◆";
      if (lp.includes("youtube"))   return "▣";
      if (lp.includes("linkedin"))  return "◉";
      if (lp.includes("twitter") || lp.includes("x/")) return "◎";
      if (lp.includes("pinterest")) return "✦";
      return "◈";
    };
    return (
      <div>
        {/* Platform tabs */}
        {platforms?.length > 0 && (
          <div style={{ marginBottom:28 }}>
            <div style={l$()}>Platform Playbooks</div>
            {platforms.map((p, idx) => {
              const pc = platformColor(p.platform);
              return (
                <div key={idx} style={{ marginBottom:16, border:`1px solid #2A2A2E`, background:"#111114", overflow:"hidden" }}>
                  {/* Platform header bar */}
                  <div style={{ background: pc, padding:"12px 20px", display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:n$, color:"#fff" }}>{platformIcon(p.platform)}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:800, color:"#fff", fontFamily:"var(--font-archivo)" }}>
                        {p.platform}
                      </div>
                      {p.handle && (
                        <div style={{ fontSize:16, color:"rgba(255,255,255,0.75)", fontFamily:"var(--font-mono)" }}>
                          {p.handle}
                        </div>
                      )}
                    </div>
                    <div style={{ marginLeft:"auto", textAlign:"right" }}>
                      <div style={{ fontSize:16, color:"rgba(255,255,255,0.75)", fontFamily:"var(--font-mono)", letterSpacing:"0.08em" }}>
                        {p.postingFrequency}
                      </div>
                      <div style={{ fontSize:16, color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-mono)" }}>
                        Best: {p.bestTimes}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding:"16px 20px" }}>
                    {/* Content types */}
                    {p.contentTypes?.length > 0 && (
                      <div style={{ marginBottom:14 }}>
                        <div style={{ ...label(pc), opacity:0.9 }}>Content Formats</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                          {p.contentTypes.map((ct, i) => (
                            <span key={i} style={{ fontSize:16, fontFamily:"var(--font-mono)", border:`1px solid ${pc}`,
                                                    color: pc, padding:"3px 10px", opacity:0.9 }}>
                              {ct}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Content pillars */}
                    {p.contentPillars?.length > 0 && (
                      <div style={{ marginBottom:14 }}>
                        <div style={{ ...label(pc), opacity:0.9 }}>Content Pillars</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          {p.contentPillars.map((cp, i) => (
                            <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                              <span style={{ color: pc, flexShrink:0, fontSize:13 }}>◆</span>
                              <span style={{ color:"#C4C4CC", fontSize:13, lineHeight:1.5 }}>{cp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Post ideas */}
                    {p.postIdeas?.length > 0 && (
                      <div style={{ marginBottom:14 }}>
                        <div style={{ ...label(pc), opacity:0.9 }}>Post Ideas (Ready to Execute)</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          {p.postIdeas.map((pi, i) => (
                            <div key={i} style={{
                              background:"#0A0A0B", border:"1px solid #1E1E22",
                              padding:"10px 14px", display:"flex", gap:10, alignItems:"flex-start"
                            }}>
                              <span style={{ color: pc, fontFamily:"var(--font-mono)", fontSize:16,
                                             flexShrink:0, marginTop:2 }}>
                                {String(i+1).padStart(2,"0")}
                              </span>
                              <span style={{ color:"#C4C4CC", fontSize:13, lineHeight:1.5 }} dir="auto">{pi}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Hooks */}
                    {p.hooks?.length > 0 && (
                      <div>
                        <div style={{ ...label(pc), opacity:0.9 }}>Scroll-Stopping Hooks</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                          {p.hooks.map((h, i) => (
                            <div key={i} style={{
                              background:"rgba(255,255,255,0.03)", border:`1px solid rgba(${pc === "#E1306C" ? "225,48,108" : "100,100,200"},0.2)`,
                              padding:"8px 14px", borderLeft:`3px solid ${pc}`
                            }}>
                              <span style={{ color:"#F4F4F1", fontSize:13, fontStyle:"italic", lineHeight:1.4 }} dir="auto">"{h}"</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4-week content calendar */}
        {contentCalendar?.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={l$()}>4-Week Content Calendar</div>
            {contentCalendar.map((wk, i) => {
              const wc = ["var(--n3)","var(--n1)","var(--n2)","#9A9AA8"][i % 4];
              return (
                <div key={wk.week} style={{ borderLeft:`3px solid ${wc}`, paddingLeft:16, marginBottom:20 }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:10 }}>
                    <span style={{ fontSize:16, fontFamily:"var(--font-mono)", fontWeight:700,
                                   color: wc, letterSpacing:"0.12em", textTransform:"uppercase" }}>
                      Week {wk.week}
                    </span>
                    <span style={{ color:"#F4F4F1", fontWeight:600, fontSize:16 }}>{wk.theme}</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {wk.posts.map((post, j) => (
                      <div key={j} style={{ display:"flex", gap:10, alignItems:"flex-start",
                                            background:"#111114", border:"1px solid #1E1E22", padding:"9px 12px" }}>
                        <span style={{ color: wc, fontSize:14, marginTop:3, flexShrink:0 }}>▸</span>
                        <span style={{ color:"#C4C4CC", fontSize:13, lineHeight:1.4 }}>{post}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Viral formulas */}
        {viralFormulas?.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={l$()}>Viral Content Formulas</div>
            <div style={{ display:"grid", gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill, minmax(240px,1fr))", gap:8 }}>
              {viralFormulas.map((vf, i) => {
                const fc = ["var(--n3)","var(--n1)","var(--n2)","#9A9AA8","var(--n3)","var(--n1)"][i % 6];
                return (
                  <div key={i} style={{ background:"#111114", border:"1px solid #2A2A2E", padding:"16px 14px",
                                        borderTop:`3px solid ${fc}` }}>
                    <div style={{ fontSize:16, fontFamily:"var(--font-mono)", color: fc,
                                  letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>
                      Formula {String(i+1).padStart(2,"0")}
                    </div>
                    <p style={{ ...body, fontSize:13 }} dir="auto">{vf}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hashtag strategy */}
        {hashtagStrategy && (
          <div style={{ background:"rgba(163,230,53,0.05)", border:"1px solid rgba(163,230,53,0.2)", padding:"16px 20px" }}>
            <div style={{ ...l$("var(--n1)"), marginBottom:8 }}># Hashtag Strategy</div>
            <p style={{ ...body, fontSize:13 }} dir="auto">{hashtagStrategy}</p>
          </div>
        )}
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
            <p {...bodyProps}>
              {typeof value === "string" ? value : JSON.stringify(value)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function SectionCard({ sectionKey, report, locked, mobile, onDeepDive, onRegenerate }: Props) {
  if (locked) {
    return (
      <div style={{ position:"relative", overflow:"hidden", marginBottom:2 }}>
        {/* Blurred fake content underneath */}
        <div style={{ filter:"blur(4px)", userSelect:"none", pointerEvents:"none",
                      border:"1px solid #1E1E22", padding:"20px 24px", opacity:0.55 }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ height:12, background:"#2A2A2E", borderRadius:2, width:"72%", marginBottom:8 }} />
            <div style={{ height:12, background:"#2A2A2E", borderRadius:2, width:"88%", marginBottom:8 }} />
            <div style={{ height:12, background:"#2A2A2E", borderRadius:2, width:"60%", marginBottom:8 }} />
            <div style={{ height:12, background:"#2A2A2E", borderRadius:2, width:"80%" }} />
          </div>
          <div style={{ display:"flex", gap:12, marginBottom:16 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ flex:1, border:"1px solid #2A2A2E", padding:"12px 14px" }}>
                <div style={{ height:10, background:"#3A3A42", borderRadius:2, width:"60%", marginBottom:6 }} />
                <div style={{ height:10, background:"#2A2A2E", borderRadius:2, width:"90%", marginBottom:4 }} />
                <div style={{ height:10, background:"#2A2A2E", borderRadius:2, width:"75%" }} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom:8 }}>
            <div style={{ height:10, background:"#2A2A2E", borderRadius:2, width:"95%", marginBottom:6 }} />
            <div style={{ height:10, background:"#2A2A2E", borderRadius:2, width:"82%", marginBottom:6 }} />
            <div style={{ height:10, background:"#2A2A2E", borderRadius:2, width:"70%" }} />
          </div>
        </div>

        {/* Overlay CTA */}
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(to bottom, rgba(10,10,11,0.5) 0%, rgba(10,10,11,0.92) 60%)",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          gap:12, padding:"24px 32px",
        }}>
          <span style={{ fontSize:25 }}>🔒</span>
          <div style={{ textAlign:"center" }}>
            <div className="font-mono" style={{ fontSize:16, letterSpacing:"0.12em",
                           textTransform:"uppercase", color:"var(--n2)", marginBottom:6 }}>
              {SECTION_LABELS[sectionKey]}
            </div>
            <div style={{ fontSize:13, color:"#9A9AA8", lineHeight:1.5 }}>
              Unlock this section with a paid plan.
            </div>
          </div>
          <a href="/pricing" className="btn-neon"
            style={{ padding:"10px 24px", fontSize:13, marginTop:4 }}>
            Unlock from $19 →
          </a>
        </div>
      </div>
    );
  }

  if (mobile) {
    return (
      <div>
        {renderSection(sectionKey, report, true)}
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
              style={{ padding:"6px 12px", fontSize:16 }}>↻ Regen</button>
          )}
          {onDeepDive && (
            <button className="btn-ghost" onClick={() => onDeepDive(sectionKey)}
              style={{ padding:"6px 12px", fontSize:16, borderColor:"var(--n2)", color:"var(--n2)" }}>
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
