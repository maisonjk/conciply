"use client";
import { useState, useCallback, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { saveReport, getLicenseKey } from "@/lib/workspace";
import OutputSkeleton from "./OutputSkeleton";
import Paywall from "./Paywall";
import type { GrowthReport } from "@/lib/types";
import { FREE_SECTIONS, SECTION_LABELS } from "@/lib/types";

const LANGUAGES = [
  { code: "auto",  label: "🌐 Auto-detect" },
  { code: "en",    label: "🇺🇸 English" },
  { code: "es",    label: "🇪🇸 Español" },
  { code: "fr",    label: "🇫🇷 Français" },
  { code: "de",    label: "🇩🇪 Deutsch" },
  { code: "pt",    label: "🇧🇷 Português" },
  { code: "it",    label: "🇮🇹 Italiano" },
  { code: "nl",    label: "🇳🇱 Nederlands" },
  { code: "ar",    label: "🇸🇦 العربية" },
  { code: "zh",    label: "🇨🇳 中文" },
  { code: "ja",    label: "🇯🇵 日本語" },
  { code: "ko",    label: "🇰🇷 한국어" },
  { code: "hi",    label: "🇮🇳 हिन्दी" },
  { code: "ru",    label: "🇷🇺 Русский" },
  { code: "tr",    label: "🇹🇷 Türkçe" },
  { code: "pl",    label: "🇵🇱 Polski" },
];

const EXAMPLES = [
  "B2B CRM for marketing agencies",
  "AI note-taking app for developers",
  "Restaurant inventory management SaaS",
  "Subscription analytics for ecommerce",
  "Dev tool for API load testing",
];

function getTodayCount() {
  const base = 3241;
  const day = Math.floor(Date.now() / 86400000);
  const seed = (day * 2654435761) % 2000;
  return base + seed;
}

type Status = "idle" | "loading" | "done" | "error" | "paywall";

export default function HeroInput() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("auto");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => { setCount(getTodayCount()); }, []);

  // Animate progress 0 → 90% while loading, then snap to 100 on completion
  useEffect(() => {
    if (status !== "loading") {
      if (status === "done") setProgress(100);
      else setProgress(0);
      return;
    }
    setProgress(0);
    const startTime = Date.now();
    const DURATION = 44000; // ~44s to reach 90% — matches typical generation time
    const id = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // Ease-out curve: fast early, slows near 90%
      const raw = elapsed / DURATION;
      const eased = 1 - Math.pow(1 - Math.min(raw, 1), 2.2);
      setProgress(Math.min(Math.round(eased * 90), 90));
    }, 300);
    return () => clearInterval(id);
  }, [status]);

  const run = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || status === "loading") return;
    setStatus("loading");
    setError("");

    try {
      const key = getLicenseKey();
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { "x-conciply-license": key } : {}),
        },
        body: JSON.stringify({ input: q, language: language === "auto" ? undefined : language }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429 || data?.paywall) { setStatus("paywall"); return; }
        setError(data?.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      // API streams SSE — read line by line until we get the "done" event
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = JSON.parse(line.slice(6));
          if (payload.type === "error") {
            setError(payload.error || "Something went wrong.");
            setStatus("error");
            return;
          }
          if (payload.type === "paywall") {
            setStatus("paywall");
            return;
          }
          if (payload.type === "done") {
            const stored = saveReport(q, payload.report as GrowthReport);
            setStatus("done");
            setCount(c => c + 1);
            router.push(`/report?id=${stored.id}`);
            return;
          }
        }
      }
      // Stream closed without a done/error event — server likely crashed mid-stream
      setError("The server closed the connection before finishing. Please try again.");
      setStatus("error");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }, [status, router]);

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); run(input); }
  };

  return (
    <section style={{ padding:"clamp(40px,6vw,84px) 0 80px" }}>
      {count > 0 && (
        <div className="font-mono" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
          <span style={{ width:8, height:8, background:"var(--n3)", display:"inline-block",
                         borderRadius:"50%", animation:"pulseBlock 2s infinite" }} />
          <span style={{ fontSize:12, color:"#9A9AA8", letterSpacing:"0.08em" }}>
            <span style={{ color:"var(--n3)", fontWeight:700 }}>{count.toLocaleString()}</span> growth reports generated today
          </span>
        </div>
      )}

      <div className="kicker" style={{ marginBottom:16 }}>Autonomous SaaS Growth Operating System</div>

      <h1 className="display" style={{ fontSize:"clamp(44px,8.5vw,128px)" }}>
        Your entire<br />growth team.<br /><span style={{ color:"var(--n2)" }}>On demand.</span>
      </h1>

      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:24, marginBottom:20 }}>
        {[{ label:"No login required", color:"var(--n3)" },
          { label:"16 AI roles",        color:"var(--n1)" },
          { label:"Instant Playbook",   color:"var(--n2)" }]
          .map(({ label, color }) => (
          <span key={label} className="font-mono"
            style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase",
                     color:"#000", background:color, padding:"5px 12px" }}>
            {label}
          </span>
        ))}
      </div>

      <p style={{ fontSize:"clamp(17px,1.8vw,22px)", lineHeight:1.45, color:"#C4C4CC", maxWidth:640, marginBottom:0 }}>
        Conciply deploys a full <span style={{ color:"#F4F4F1" }}>CEO, CMO, CRO, VP Growth, SDR and 11 more AI
        specialists</span> to analyze your SaaS and build a complete growth playbook — in seconds.
      </p>

      <div style={{ border:"2px solid #F4F4F1", background:"#121214", marginTop:32, position:"relative" }}>
        <div style={{ display:"flex", alignItems:"stretch", flexWrap:"wrap" }}>
          <textarea value={input} onChange={e => setInput(e.target.value.slice(0,1000))}
            onKeyDown={onKey} rows={2} maxLength={1000}
            placeholder="Describe your SaaS — e.g. B2B analytics tool for restaurant chains"
            style={{ flex:"1 1 420px", resize:"none", background:"transparent", border:"none",
                     outline:"none", color:"#F4F4F1", fontWeight:600,
                     fontSize:"clamp(20px,2.4vw,30px)", lineHeight:1.18,
                     padding:"26px 28px", minHeight:96,
                     fontFamily:"var(--font-archivo), sans-serif" }} />
          <button className="btn-neon" onClick={() => run(input)}
            disabled={status === "loading" || !input.trim()}
            style={{ flex:"0 0 auto", minWidth:200, fontSize:"clamp(18px,2vw,24px)",
                     padding:"0 36px", borderLeft:"2px solid #F4F4F1",
                     display:"flex", flexDirection:"column", alignItems:"center",
                     justifyContent:"center", gap:4 }}>
            {status === "loading" ? (
              <>
                <span style={{ fontSize:"clamp(18px,2vw,24px)", lineHeight:1 }}>Analyzing…</span>
                <span className="font-mono" style={{ fontSize:13, fontWeight:700,
                                                      letterSpacing:"0.06em", lineHeight:1 }}>
                  {progress}%
                </span>
              </>
            ) : "Analyze ↵"}
          </button>
        </div>

        {/* Progress bar — runs along the bottom edge of the input box */}
        {status === "loading" && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3,
                        background:"#1E1E22", overflow:"hidden" }}>
            <div style={{
              height:"100%",
              width:`${progress}%`,
              background:"var(--n3)",
              transition:"width 0.3s ease-out",
              boxShadow:"0 0 8px var(--n3)",
            }} />
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                      borderTop:"1px solid #2A2A2E", padding:"10px 16px 10px 28px" }}>
          <span className="kicker">Free: Executive Summary + Top 10 ROI Actions</span>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{
                background:"transparent", border:"1px solid #3C3C42",
                color:"#D0D0D8", fontFamily:"var(--font-mono), monospace",
                fontSize:11, letterSpacing:"0.08em", padding:"4px 8px",
                cursor:"pointer", outline:"none",
              }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} style={{ background:"#0A0A0B" }}>
                  {l.label}
                </option>
              ))}
            </select>
            <span className="font-mono" style={{ fontSize:12, color: input.length > 900 ? "var(--n2)" : "#5C5C63" }}>
              {input.length}/1000
            </span>
          </div>
        </div>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:20, alignItems:"center" }}>
        <span className="kicker" style={{ marginRight:4 }}>Try</span>
        {EXAMPLES.map((ex, i) => (
          <button key={i} className="font-mono"
            onClick={() => { setInput(ex); run(ex); }}
            style={{ fontSize:12, border:"1.5px solid #3C3C42", color:"#C4C4CC",
                     padding:"11px 14px", background:"transparent", minHeight:44 }}>
            {ex}
          </button>
        ))}
      </div>

      <p className="font-mono" style={{ fontSize:11, lineHeight:1.6, color:"#9A9AA8",
                                        marginTop:18, maxWidth:720, letterSpacing:"0.02em" }}>
        AI-generated for strategic inspiration. Output may be inaccurate — review before acting.
        See our <a href="/terms" style={{ color:"#C4C4CC", textDecoration:"underline" }}>Terms</a>.
      </p>

      {status === "error" && (
        <div className="font-mono" style={{ marginTop:24, fontSize:13, color:"var(--n2)",
                                            borderLeft:"3px solid var(--n2)", paddingLeft:12 }}>
          {error}
        </div>
      )}
      {status === "loading" && <OutputSkeleton />}
      {status === "paywall" && <Paywall />}
      {status === "idle" && <IdlePreview />}
    </section>
  );
}

const PREVIEW_SECTIONS = [
  { key: "executiveSummary",    label: "Executive Summary",   color: "var(--n1)", icon: "◈", free: true,
    text: "ICP: Agency ops leads frustrated by HubSpot complexity and price. Core advantage: 3x faster pipeline visibility at 40% lower cost." },
  { key: "topRoiActions",       label: "Top ROI Actions",     color: "var(--n1)", icon: "★", free: true,
    text: "#1 Score 9.2 · Launch free PLG tier — removes procurement friction for sub-10 person teams." },
  { key: "marketAnalysis",      label: "Market Analysis",     color: "var(--n2)", icon: "◎", free: false,
    text: "TAM $4.2B · SAM $820M · SOM $41M. Key trend: mid-market abandoning Salesforce for lighter CRMs." },
  { key: "competitorAnalysis",  label: "Competitor Analysis", color: "var(--n2)", icon: "⊕", free: false,
    text: "HubSpot owns 38% share but over-priced for agencies. Pipedrive weak on reporting. Gap: analytics-first CRM." },
  { key: "acquisitionPlan",     label: "Acquisition Plan",    color: "var(--n3)", icon: "➤", free: false,
    text: "Priority: LinkedIn outbound → agency Slack communities → G2 review push. Budget split: 60% content, 40% paid." },
  { key: "socialMediaStrategy", label: "Social Media",        color: "var(--n3)", icon: "◈", free: false,
    text: "LinkedIn: thought leadership on agency ops. YouTube: CRM comparison walkthroughs. Reddit: r/sales community." },
  { key: "plan7Day",            label: "7-Day Sprint",        color: "#9A9AA8",   icon: "①", free: false,
    text: "Day 1-2: cold email sequence live. Day 3-4: G2 profile + 5 reviews. Day 5-7: first LinkedIn post series." },
  { key: "immediateActions",    label: "Immediate Actions",   color: "#9A9AA8",   icon: "⚡", free: false,
    text: "Next 24h: message 10 agency founders on LinkedIn. Next 72h: publish CRM comparison landing page." },
];

function IdlePreview() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = PREVIEW_SECTIONS[activeIdx];

  return (
    <div style={{ marginTop:"clamp(56px,7vw,96px)" }}>
      <style>{`
        .idle-chipbar { display: none; }
        .idle-cardgrid { display: block; }
        @media (max-width: 639px) {
          .idle-chipbar  { display: block; }
          .idle-cardgrid { display: none; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    flexWrap:"wrap", gap:12, border:"2px solid #2A2A2E",
                    padding:"14px 20px", marginBottom:2 }}>
        <div>
          <div className="kicker" style={{ marginBottom:4 }}>Example output · B2B CRM for agencies</div>
          <div style={{ fontFamily:"var(--font-archivo), sans-serif", fontWeight:800,
                        fontSize:"clamp(14px,1.6vw,20px)", textTransform:"uppercase", color:"#5C5C63" }}>
            Enter your SaaS above to generate yours →
          </div>
        </div>
        <span className="font-mono" style={{ fontSize:11, color:"#3C3C42", letterSpacing:"0.1em" }}>SAMPLE</span>
      </div>

      {/* ── Mobile: chip bar + single card ── */}
      <div className="idle-chipbar">
        {/* Scrollable chips */}
        <div style={{ background:"#0A0A0B", border:"1px solid #1E1E22", borderBottom:"none",
                      overflowX:"auto", display:"flex", gap:6, padding:"10px 12px",
                      scrollbarWidth:"none" }}>
          {PREVIEW_SECTIONS.map((s, i) => (
            <button key={s.key} onClick={() => setActiveIdx(i)} style={{
              flexShrink:0,
              border:`1px solid ${i === activeIdx ? s.color : "#2A2A2E"}`,
              background: i === activeIdx ? `${s.color}18` : "transparent",
              padding:"5px 10px", cursor:"pointer",
              display:"flex", alignItems:"center", gap:5,
            }}>
              <span style={{ fontSize:10, color: i === activeIdx ? s.color : s.free ? "#5C5C63" : "#3C3C42" }}>
                {s.free ? s.icon : "🔒"}
              </span>
              <span className="font-mono" style={{
                fontSize:10, whiteSpace:"nowrap", letterSpacing:"0.03em",
                color: i === activeIdx ? s.color : s.free ? "#9A9AA8" : "#3C3C42",
              }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
        {/* Active card */}
        <div style={{ border:"1px solid #1E1E22", background:"#0A0A0B", padding:"20px 16px",
                      opacity: active.free ? 1 : 0.6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <span style={{ fontSize:13, color: active.color }}>{active.free ? active.icon : "🔒"}</span>
            <span className="kicker" style={{ color: active.color }}>{active.label}</span>
            {!active.free && (
              <span className="font-mono" style={{ fontSize:9, color:"#5C5C63",
                                                    letterSpacing:"0.1em", marginLeft:"auto" }}>
                PAID
              </span>
            )}
          </div>
          <p style={{ margin:0, color: active.free ? "#C4C4CC" : "#5C5C63",
                      fontSize:14, lineHeight:1.65 }}>
            {active.text}
          </p>
          {!active.free && (
            <a href="/pricing" className="font-mono" style={{
              display:"inline-block", marginTop:14, fontSize:10, letterSpacing:"0.1em",
              textTransform:"uppercase", color:"var(--n2)", textDecoration:"none",
            }}>
              Unlock all 17 sections →
            </a>
          )}
        </div>
        <div style={{ border:"1px solid #1E1E22", borderTop:"none", padding:"10px 14px",
                      background:"#0A0A0B", display:"flex", justifyContent:"space-between",
                      alignItems:"center" }}>
          <span className="font-mono" style={{ fontSize:10, color:"#5C5C63" }}>
            {activeIdx + 1} / {PREVIEW_SECTIONS.length} sections shown
          </span>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
              disabled={activeIdx === 0}
              className="btn-ghost" style={{ padding:"4px 10px", fontSize:11,
                                             opacity: activeIdx === 0 ? 0.2 : 1 }}>←</button>
            <button onClick={() => setActiveIdx(i => Math.min(PREVIEW_SECTIONS.length - 1, i + 1))}
              disabled={activeIdx === PREVIEW_SECTIONS.length - 1}
              className="btn-ghost" style={{ padding:"4px 10px", fontSize:11,
                                             opacity: activeIdx === PREVIEW_SECTIONS.length - 1 ? 0.2 : 1 }}>→</button>
          </div>
        </div>
      </div>

      {/* ── Desktop: original cardgrid ── */}
      <div className="idle-cardgrid" style={{ opacity:0.5, pointerEvents:"none" }}>
        <div className="cardgrid">
          {FREE_SECTIONS.map(key => (
            <div key={key} style={{ gridColumn:"span 6", background:"#0A0A0B", padding:28 }}>
              <div className="kicker" style={{ marginBottom:12, color:"var(--n1)" }}>
                {SECTION_LABELS[key]}
              </div>
              <div style={{ color:"#C4C4CC", fontSize:15, lineHeight:1.6 }}>
                {key === "executiveSummary"
                  ? "ICP: Agency ops leads frustrated by HubSpot complexity and price. Core advantage: 3x faster pipeline visibility at 40% lower cost."
                  : "#1 Score 9.2 · Launch free PLG tier — removes procurement friction for sub-10 person teams."}
              </div>
            </div>
          ))}
          <div style={{ gridColumn:"span 3", background:"#0A0A0B", padding:28, borderTop:"2px solid var(--n2)" }}>
            <div className="kicker" style={{ color:"var(--n2)", marginBottom:8 }}>🔒 Market Analysis</div>
            <div style={{ color:"#3C3C42", fontSize:13 }}>Unlock to see TAM / SAM / SOM…</div>
          </div>
          <div style={{ gridColumn:"span 3", background:"#0A0A0B", padding:28, borderTop:"2px solid var(--n2)" }}>
            <div className="kicker" style={{ color:"var(--n2)", marginBottom:8 }}>🔒 Acquisition Plan</div>
            <div style={{ color:"#3C3C42", fontSize:13 }}>Cold outreach, SEO, paid channels…</div>
          </div>
        </div>
      </div>
    </div>
  );
}
