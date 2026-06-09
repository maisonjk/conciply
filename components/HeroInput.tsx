"use client";
import { useState, useCallback, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { saveReport, getLicenseKey } from "@/lib/workspace";
import OutputSkeleton from "./OutputSkeleton";
import Paywall from "./Paywall";
import type { GrowthReport, PartialGrowthReport } from "@/lib/types";
import { FREE_SECTIONS, SECTION_LABELS, SECTION_ORDER } from "@/lib/types";

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
  "Indie SaaS for freelance project management",
  "YouTube channel about personal finance",
  "Handmade jewelry shop going online",
  "Mobile app for local restaurant discovery",
  "Freelance marketing consultancy",
];

const SPECIALISTS = [
  "CEO", "COO", "CMO", "CRO", "VP Growth",
  "Performance Marketing", "SEO", "Content Marketing",
  "Product Marketing", "Social Media", "Brand Strategy",
  "SDR", "Account Executive", "Enterprise Sales",
  "CRO Specialist", "Funnel Architect", "UX Analyst",
  "Retention Specialist", "Lifecycle Marketing",
  "Data Scientist", "Market Researcher", "Competitive Intelligence",
];

const SPECIALIST_COLORS = ["var(--n1)", "var(--n3)", "var(--n2)"];

const LOADING_MESSAGES = [
  "Convening your AI board of directors…",
  "Reading 847 case studies so you don't have to…",
  "Your competitors are not doing this. You are.",
  "Stress-testing your idea against the market…",
  "Reverse-engineering what works in your space…",
  "Mapping the fastest path to your first 1,000 customers…",
  "Calculating which moves give you the highest ROI…",
  "Building a social strategy your audience will actually stop for…",
  "Drafting copy that converts — not just sounds good…",
  "Designing retention loops to keep customers coming back…",
  "Stress-testing 90 days of execution so you hit the ground running…",
  "Almost done — your AI execs are debating the final details…",
];

function getTodayCount() {
  const base = 3241;
  const day = Math.floor(Date.now() / 86400000);
  const seed = (day * 2654435761) % 2000;
  return base + seed;
}

const SECTION_COLORS: Record<string, string> = {
  executiveSummary:    "var(--n1)", marketAnalysis:      "var(--n3)",
  competitorAnalysis:  "var(--n2)", positioning:         "var(--n1)",
  growthOpportunities: "var(--n3)", acquisitionPlan:     "var(--n2)",
  funnelImprovements:  "var(--n1)", marketingAssets:     "var(--n3)",
  salesAssets:         "var(--n2)", retentionStrategy:   "var(--n1)",
  socialMediaStrategy: "var(--n3)", kpiDashboard:        "var(--n2)",
  topRoiActions:       "var(--n1)", plan7Day:            "var(--n3)",
  plan30Day:           "var(--n2)", plan90Day:           "var(--n1)",
  immediateActions:    "var(--n3)",
};

function getPreviewLines(sectionKey: string, data: unknown): string[] {
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;
  switch (sectionKey) {
    case "executiveSummary":    return [d.uvp as string, d.topOpportunity as string].filter(Boolean).slice(0,2);
    case "marketAnalysis":      return [`TAM: ${d.tam}`, `SAM: ${d.sam}`, ...(d.trends as string[]??[]).slice(0,1)].filter(Boolean);
    case "competitorAnalysis":  return (d.gaps as string[]??[]).slice(0,2);
    case "positioning":         return [d.uvp as string, d.messaging as string].filter(Boolean).slice(0,2);
    case "growthOpportunities": return [...(d.organic as string[]??[]).slice(0,1), ...(d.paid as string[]??[]).slice(0,1)];
    case "acquisitionPlan":     return (d.tactics as string[]??[]).slice(0,2);
    case "funnelImprovements":  return [...(d.awareness as string[]??[]).slice(0,1), ...(d.activation as string[]??[]).slice(0,1)];
    case "marketingAssets":     return [d.landingCopy as string].filter(Boolean).slice(0,1);
    case "salesAssets":         return [d.outreachScript as string].filter(Boolean).slice(0,1);
    case "retentionStrategy":   return (d.onboarding as string[]??[]).slice(0,2);
    case "socialMediaStrategy": return [d.hashtagStrategy as string, ...(d.viralFormulas as string[]??[]).slice(0,1)].filter(Boolean);
    case "kpiDashboard":        return (d.targets as string[]??[]).slice(0,2);
    case "topRoiActions":       return (d.actions as {title?:string}[]??[]).slice(0,2).map(a=>a.title??"").filter(Boolean);
    case "plan7Day":            return (d.days as {tasks?:string[]}[]??[]).slice(0,1).flatMap(day=>(day.tasks??[]).slice(0,2));
    case "plan30Day":           return (d.weeks as {focus?:string}[]??[]).slice(0,2).map(w=>w.focus??"").filter(Boolean);
    case "plan90Day":           return (d.months as {theme?:string}[]??[]).slice(0,2).map(m=>m.theme??"").filter(Boolean);
    case "immediateActions":    return (d.next24h as string[]??[]).slice(0,2);
    default:                    return [];
  }
}

function StreamCard({ sectionKey, data }: { sectionKey: string; data: unknown }) {
  const color = SECTION_COLORS[sectionKey] ?? "var(--n1)";
  const label = SECTION_LABELS[sectionKey as keyof typeof SECTION_LABELS] ?? sectionKey;
  const lines = getPreviewLines(sectionKey, data);
  return (
    <div style={{ border:`1px solid ${color}`, background:"#0C0C0E",
                  padding:"14px 18px", animation:"fadeIn 0.4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: lines.length ? 10 : 0 }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:color,
                       boxShadow:`0 0 8px ${color}`, flexShrink:0 }} />
        <span className="font-mono" style={{ fontSize:10, letterSpacing:"0.12em",
                          textTransform:"uppercase", color, fontWeight:700 }}>
          ✓ {label}
        </span>
      </div>
      {lines.length > 0 && (
        <ul style={{ margin:0, padding:"0 0 0 14px" }}>
          {lines.map((line, i) => (
            <li key={i} style={{ fontSize:13, color:"#C4C4CC", lineHeight:1.5, marginBottom:2 }}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
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
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [doneSections, setDoneSections] = useState<string[]>([]);
  const [partialReport, setPartialReport] = useState<PartialGrowthReport>({});

  useEffect(() => { setCount(getTodayCount()); }, []);

  // Animate progress 0 → 90% while loading, then snap to 100 on completion
  useEffect(() => {
    if (status !== "loading") {
      if (status === "done") setProgress(100);
      else setProgress(0);
      return;
    }
    setProgress(0);
    setLoadingMsg(LOADING_MESSAGES[0]);
    const startTime = Date.now();
    const DURATION = 110000; // ~110s to reach 90% — matches observed 14k token p90 generation time
    const id = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // Ease-out curve: fast early, slows near 90%
      const raw = elapsed / DURATION;
      const eased = 1 - Math.pow(1 - Math.min(raw, 1), 2.2);
      setProgress(Math.min(Math.round(eased * 90), 90));
      // Cycle through loading messages every ~6 seconds
      const msgIndex = Math.min(
        Math.floor(elapsed / 6000),
        LOADING_MESSAGES.length - 1
      );
      setLoadingMsg(LOADING_MESSAGES[msgIndex]);
    }, 300);
    return () => clearInterval(id);
  }, [status]);

  const run = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || status === "loading") return;
    setStatus("loading");
    setError("");
    setDoneSections([]);
    setPartialReport({});

    // Hard 150s timeout — if OpenAI stalls mid-stream, surface a recoverable error
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 150000);

    try {
      const key = getLicenseKey();
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { "x-conciply-license": key } : {}),
        },
        body: JSON.stringify({ input: q, language: language === "auto" ? undefined : language }),
        signal: controller.signal,
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

      const processLines = (chunk: string): boolean => {
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.type === "error") { setError(payload.error || "Something went wrong."); setStatus("error"); return true; }
            if (payload.type === "paywall") { setStatus("paywall"); return true; }
            if (payload.type === "section") {
              const key = payload.key as string;
              setDoneSections(prev => [...prev, key]);
              if (payload.data) setPartialReport(prev => ({ ...prev, [key]: payload.data }));
            }
            if (payload.type === "done") {
              const stored = saveReport(q, payload.report as GrowthReport);
              setStatus("done"); setCount(c => c + 1);
              router.push(`/report?id=${stored.id}`);
              return true;
            }
          } catch { /* ignore malformed SSE line */ }
        }
        return false;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (processLines(decoder.decode(value, { stream: true }))) return;
      }
      // Flush TextDecoder and process any remaining buffered data
      // (handles the case where the done event arrives in the final chunk)
      if (processLines(decoder.decode())) return;

      // Stream truly closed with no done/error event — server crashed mid-stream
      setError("The server closed the connection before finishing. Please try again.");
      setStatus("error");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Generation timed out — OpenAI is busy right now. Please try again in a moment.");
      } else {
        setError("Network error. Please try again.");
      }
      setStatus("error");
    } finally {
      clearTimeout(timeoutId);
    }
  }, [status, router]);

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); run(input); }
  };

  return (
    <section style={{ padding:"clamp(20px,3vw,44px) 0 40px" }}>
      {count > 0 && (
        <div className="font-mono" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <span style={{ width:8, height:8, background:"var(--n3)", display:"inline-block",
                         borderRadius:"50%", animation:"pulseBlock 2s infinite" }} />
          <span style={{ fontSize:12, color:"#9A9AA8", letterSpacing:"0.08em" }}>
            <span style={{ color:"var(--n3)", fontWeight:700 }}>{count.toLocaleString()}</span> growth reports generated today
          </span>
        </div>
      )}

      <div className="kicker" style={{ marginBottom:10 }}>Autonomous SaaS Growth Operating System</div>

      <h1 className="display" style={{ fontSize:"clamp(28px,4.6vw,72px)", lineHeight:1.05 }}>
        A 22-specialist<br />growth team.<br /><span style={{ color:"var(--n3)" }}>On demand for any business.</span>
      </h1>

      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:14, marginBottom:12 }}>
        {[{ label:"No login required", color:"var(--n3)" },
          { label:"22 AI specialists",  color:"var(--n1)" },
          { label:"Any business or idea", color:"var(--n2)" }]
          .map(({ label, color }) => (
          <span key={label} className="font-mono"
            style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase",
                     color:"#000", background:color, padding:"5px 12px" }}>
            {label}
          </span>
        ))}
      </div>

      <p style={{ fontSize:"clamp(15px,1.4vw,18px)", lineHeight:1.4, color:"#C4C4CC", maxWidth:640, marginBottom:10 }}>
        Conciply deploys <span style={{ color:"#F4F4F1" }}>22 AI specialists — including CEO, CMO, CRO, VP Growth, SDR and more —</span> to analyze any business or idea and build a <span style={{ color:"#F4F4F1" }}>17-section growth playbook, fully written and ready to execute.</span>
      </p>

      {/* ── Specialist marquee ── */}
      <div style={{ margin:"14px 0", overflow:"hidden", borderTop:"1px solid #2A2A2E", borderBottom:"1px solid #2A2A2E", position:"relative" }}>
        {/* fade edges */}
        <div style={{ position:"absolute", inset:0, left:0, width:60, background:"linear-gradient(90deg,#0A0A0B,transparent)", zIndex:2, pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, left:"auto", right:0, width:60, background:"linear-gradient(270deg,#0A0A0B,transparent)", zIndex:2, pointerEvents:"none" }} />
        <div style={{ display:"flex", width:"max-content", animation:"marquee 32s linear infinite", padding:"10px 0" }}>
          {[...SPECIALISTS, ...SPECIALISTS].map((s, i) => (
            <span key={i} className="font-mono" style={{ display:"inline-flex", alignItems:"center", gap:16, paddingRight:32, whiteSpace:"nowrap" }}>
              <span style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color: SPECIALIST_COLORS[i % SPECIALIST_COLORS.length] }}>
                {s}
              </span>
              <span style={{ width:3, height:3, borderRadius:"50%", background:"#3C3C42", flexShrink:0, display:"inline-block" }} />
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }`}</style>
      </div>

      <p className="font-mono" style={{ fontSize:13, color:"#8A8A9A", letterSpacing:"0.04em", marginBottom:0 }}>
        🌐 Available in{" "}
        <span style={{ color:"var(--n1)" }}>
          English, Español, Français, Deutsch, Português, Italiano, Nederlands, العربية, 中文, 日本語, 한국어, हिन्दी, Русский, Türkçe, Polski
        </span>
        {" "}— type in your language or pick one below.
      </p>

      <div style={{ border:"2px solid #F4F4F1", background:"#121214", marginTop:16, position:"relative" }}>
        <div style={{ display:"flex", alignItems:"stretch", flexWrap:"wrap" }}>
          <textarea value={input} onChange={e => setInput(e.target.value.slice(0,1000))}
            onKeyDown={onKey} rows={2} maxLength={1000}
            aria-label="Describe your business or idea"
            placeholder="Describe your business or idea — e.g. YouTube channel about personal finance"
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
                <span style={{ fontSize:"clamp(14px,1.6vw,18px)", lineHeight:1.2, textAlign:"center" }}>
                  {progress}%
                </span>
                <span className="font-mono" style={{ fontSize:10, fontWeight:400,
                                                      letterSpacing:"0.04em", lineHeight:1,
                                                      color:"rgba(244,244,241,0.55)", textAlign:"center" }}>
                  ~2 min
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

        {/* Cycling status message — shown below input during loading */}
        {status === "loading" && (
          <div className="font-mono" style={{
            position:"absolute", bottom:-28, left:0, right:0,
            fontSize:11, color:"#6A6A75", letterSpacing:"0.06em",
            textAlign:"left", paddingLeft:28,
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>
            ▶ {loadingMsg}
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                      borderTop:"1px solid #2A2A2E", padding:"10px 16px 10px 28px" }}>
          <span className="kicker">Free preview · 1 report · 8 of 17 sections · no login</span>
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
      {status === "loading" && doneSections.length > 0 && (
        <div style={{ marginTop:40 }}>
          <div className="font-mono" style={{ fontSize:10, letterSpacing:"0.12em",
                                               textTransform:"uppercase", color:"#5C5C63",
                                               marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:6, height:6, background:"var(--n1)", borderRadius:"50%",
                           display:"inline-block", animation:"pulseBlock 1s infinite", flexShrink:0 }} />
            Building your playbook — {doneSections.length} of 17 sections ready
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {SECTION_ORDER.filter(k => doneSections.includes(k)).map(key => (
              <StreamCard key={key} sectionKey={key} data={partialReport[key as keyof typeof partialReport]} />
            ))}
          </div>
          {doneSections.length < 17 && <OutputSkeleton slim />}
        </div>
      )}
      {status === "loading" && doneSections.length === 0 && <OutputSkeleton />}
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
    <div style={{ marginTop:"clamp(40px,5vw,72px)" }}>
      <style>{`
        .idle-mobile { display: none; }
        .idle-desktop { display: flex; }
        @media (max-width: 639px) {
          .idle-mobile  { display: block; }
          .idle-desktop { display: none; }
        }
      `}</style>

      {/* Section label */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
        <div style={{ height:1, flex:1, background:"#1E1E22" }} />
        <span className="font-mono" style={{ fontSize:10, color:"#3C3C42", letterSpacing:"0.16em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
          Sample report · any business, any idea
        </span>
        <div style={{ height:1, flex:1, background:"#1E1E22" }} />
      </div>

      {/* ── OS window chrome ── */}
      <div style={{ border:"2px solid #F4F4F1", background:"#0A0A0B", overflow:"hidden" }}>

        {/* Title bar */}
        <div style={{ borderBottom:"2px solid #1E1E22", padding:"10px 16px",
                      display:"flex", alignItems:"center", gap:12, background:"#111113" }}>
          <div style={{ display:"flex", gap:5 }}>
            <span style={{ width:10, height:10, borderRadius:"50%", background:"#FF5F57", display:"inline-block" }} />
            <span style={{ width:10, height:10, borderRadius:"50%", background:"#FFBD2E", display:"inline-block" }} />
            <span style={{ width:10, height:10, borderRadius:"50%", background:"#28C840", display:"inline-block" }} />
          </div>
          <div style={{ flex:1, background:"#0A0A0B", border:"1px solid #2A2A2E",
                        padding:"5px 14px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--n3)", display:"inline-block" }} />
            <span className="font-mono" style={{ fontSize:10, color:"#5C5C63", letterSpacing:"0.04em" }}>
              conciply.com/workspace · B2B CRM tool
            </span>
          </div>
          <span className="font-mono" style={{ fontSize:9, color:"#2A2A2E", letterSpacing:"0.12em", textTransform:"uppercase" }}>SAMPLE</span>
        </div>

        {/* ── Desktop: sidebar + content ── */}
        <div className="idle-desktop" style={{ minHeight:280 }}>

          {/* Sidebar */}
          <div style={{ width:196, borderRight:"1px solid #1E1E22", flexShrink:0, display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"10px 14px", borderBottom:"1px solid #1E1E22" }}>
              <span className="font-mono" style={{ fontSize:9, color:"#5C5C63", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                17 sections
              </span>
            </div>
            {PREVIEW_SECTIONS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setActiveIdx(i)}
                style={{
                  display:"flex", alignItems:"center", gap:9,
                  padding:"9px 14px",
                  borderBottom:"1px solid #0F0F11",
                  borderTop:"none", borderRight:"none",
                  background: i === activeIdx ? "#161618" : "transparent",
                  borderLeft: i === activeIdx ? `2px solid ${s.color}` : "2px solid transparent",
                  cursor:"pointer", width:"100%", textAlign:"left",
                }}
              >
                <span style={{ fontSize:10, color: s.free ? s.color : "#2A2A2E", flexShrink:0 }}>
                  {s.free ? s.icon : "▪"}
                </span>
                <span className="font-mono" style={{
                  fontSize:10, letterSpacing:"0.03em", whiteSpace:"nowrap",
                  color: i === activeIdx ? (s.free ? s.color : "#5C5C63") : (s.free ? "#6A6A75" : "#2A2A2E"),
                }}>
                  {s.label}
                </span>
                {!s.free && (
                  <span className="font-mono" style={{ fontSize:8, color:"#2A2A2E", marginLeft:"auto", letterSpacing:"0.08em" }}>
                    PRO
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content panel */}
          <div style={{ flex:1, padding:"24px 28px", position:"relative" }}>
            {/* Section header */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <span style={{ fontSize:14, color: active.color }}>{active.free ? active.icon : "▪"}</span>
              <span className="kicker" style={{ color: active.color, fontSize:11 }}>{active.label}</span>
              {active.free ? (
                <span className="font-mono" style={{ fontSize:8, color: active.color, letterSpacing:"0.1em",
                                                      border:`1px solid ${active.color}`, padding:"2px 6px", marginLeft:"auto" }}>
                  FREE
                </span>
              ) : (
                <span className="font-mono" style={{ fontSize:8, color:"#3C3C42", letterSpacing:"0.1em",
                                                      border:"1px solid #2A2A2E", padding:"2px 6px", marginLeft:"auto" }}>
                  PRO
                </span>
              )}
            </div>

            {/* Content or locked overlay */}
            {active.free ? (
              <p style={{ margin:0, color:"#D0D0D8", fontSize:15, lineHeight:1.7, maxWidth:520 }}>
                {active.text}
              </p>
            ) : (
              <div style={{ position:"relative" }}>
                <p style={{ margin:0, color:"#3C3C42", fontSize:15, lineHeight:1.7, maxWidth:520,
                             filter:"blur(3px)", userSelect:"none" }}>
                  {active.text}
                </p>
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", gap:16 }}>
                  <div style={{ height:1, flex:1, background:"#1E1E22" }} />
                  <a href="/pricing" className="font-mono" style={{
                    fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase",
                    color:"var(--n2)", textDecoration:"none", border:"1px solid var(--n2)",
                    padding:"6px 14px", whiteSpace:"nowrap",
                  }}>
                    Unlock all 17 sections →
                  </a>
                  <div style={{ height:1, flex:1, background:"#1E1E22" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile: chip bar + single card ── */}
        <div className="idle-mobile">
          <div style={{ overflowX:"auto", display:"flex", gap:6, padding:"10px 12px",
                        borderBottom:"1px solid #1E1E22", scrollbarWidth:"none" }}>
            {PREVIEW_SECTIONS.map((s, i) => (
              <button key={s.key} onClick={() => setActiveIdx(i)} style={{
                flexShrink:0,
                border:`1px solid ${i === activeIdx ? s.color : "#2A2A2E"}`,
                background: i === activeIdx ? `${s.color}14` : "transparent",
                padding:"5px 10px", cursor:"pointer",
                display:"flex", alignItems:"center", gap:5,
              }}>
                <span className="font-mono" style={{
                  fontSize:10, whiteSpace:"nowrap", letterSpacing:"0.03em",
                  color: i === activeIdx ? s.color : s.free ? "#9A9AA8" : "#3C3C42",
                }}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
          <div style={{ padding:"20px 16px", minHeight:120 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <span style={{ fontSize:12, color: active.color }}>{active.free ? active.icon : "▪"}</span>
              <span className="kicker" style={{ color: active.color, fontSize:10 }}>{active.label}</span>
            </div>
            {active.free ? (
              <p style={{ margin:0, color:"#C4C4CC", fontSize:14, lineHeight:1.65 }}>{active.text}</p>
            ) : (
              <div>
                <p style={{ margin:0, color:"#3C3C42", fontSize:14, lineHeight:1.65, filter:"blur(3px)", userSelect:"none" }}>{active.text}</p>
                <a href="/pricing" className="font-mono" style={{
                  display:"inline-block", marginTop:14, fontSize:10, letterSpacing:"0.1em",
                  textTransform:"uppercase", color:"var(--n2)", textDecoration:"none",
                }}>Unlock all 17 sections →</a>
              </div>
            )}
          </div>
          <div style={{ borderTop:"1px solid #1E1E22", padding:"10px 14px",
                        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span className="font-mono" style={{ fontSize:10, color:"#5C5C63" }}>
              {activeIdx + 1} / {PREVIEW_SECTIONS.length}
            </span>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
                disabled={activeIdx === 0}
                className="btn-ghost" style={{ padding:"4px 10px", fontSize:11, opacity: activeIdx === 0 ? 0.2 : 1 }}>←</button>
              <button onClick={() => setActiveIdx(i => Math.min(PREVIEW_SECTIONS.length - 1, i + 1))}
                disabled={activeIdx === PREVIEW_SECTIONS.length - 1}
                className="btn-ghost" style={{ padding:"4px 10px", fontSize:11, opacity: activeIdx === PREVIEW_SECTIONS.length - 1 ? 0.2 : 1 }}>→</button>
            </div>
          </div>
        </div>

      </div>

      {/* CTA below window */}
      <div style={{ borderLeft:"2px solid #F4F4F1", borderRight:"2px solid #F4F4F1",
                    borderBottom:"2px solid #F4F4F1", padding:"14px 20px",
                    display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <span className="font-mono" style={{ fontSize:11, color:"#5C5C63", letterSpacing:"0.04em" }}>
          Enter your business or idea above — your playbook generates in 60 seconds.
        </span>
        <span className="font-mono" style={{ fontSize:10, color:"#2A2A2E", letterSpacing:"0.1em", textTransform:"uppercase" }}>
          No login required
        </span>
      </div>
    </div>
  );
}
