"use client";
import { useState, useCallback, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { saveReport, getLicenseKey } from "@/lib/workspace";
import OutputSkeleton from "./OutputSkeleton";
import Paywall from "./Paywall";
import type { GrowthReport, PartialGrowthReport } from "@/lib/types";
import { FREE_SECTIONS, SECTION_LABELS, SECTION_ORDER } from "@/lib/types";
import { useIsMobile } from "@/hooks/useIsMobile";

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

// REMOVED: fake deterministic daily counter. Displaying fabricated usage
// numbers is a legal risk under FTC guidelines (deceptive practices).

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
            <li key={i} style={{ fontSize:20, color:"#C4C4CC", lineHeight:1.5, marginBottom:2 }}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

type Status = "idle" | "loading" | "done" | "error" | "paywall";

export default function HeroInput() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("auto");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const [progress, setProgress] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [doneSections, setDoneSections] = useState<string[]>([]);
  const [partialReport, setPartialReport] = useState<PartialGrowthReport>({});
  const [doneReportId, setDoneReportId] = useState<string | null>(null);


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
              setDoneReportId(stored.id);
              setStatus("done");
              // Record free usage via a normal POST so the cookie is set properly
              // (SSE responses can't reliably set cookies in browsers)
              if (!payload.tier) {
                fetch("/api/free-used", { method: "POST" }).catch(() => {});
              }
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

  // ── Mobile layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <section id="analyze" style={{ padding:"20px 0 140px" }}>
        <style>{`
          @keyframes mobileSlideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
          @keyframes mobilePulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
          @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
          .mobile-input-row { display:flex; flex-direction:column; gap:0; }
          .mobile-analyze-btn {
            width:100%; border:none; padding:20px;
            font-family:var(--font-archivo),sans-serif; font-weight:900;
            font-size:18px; letter-spacing:0.02em; text-transform:uppercase;
            cursor:pointer; transition:filter 0.15s;
          }
          .mobile-analyze-btn:active { filter:brightness(0.9); transform:scale(0.99); }
        `}</style>

        {/* Kicker */}
        <p className="kicker" style={{ marginBottom:10, color:"#7A7A8A", fontSize:11 }}>Autonomous Growth OS</p>

        {/* H1 */}
        <h1 className="display" style={{ fontSize:"clamp(35px,9vw,35px)", lineHeight:0.95, marginBottom:16 }}>
          Your complete<br />growth playbook.<br />
          <span style={{ color:"var(--n1)" }}>Built by 22 AI specialists.</span>
        </h1>

        {/* Badges */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:14 }}>
          {[{ label:"No login", color:"var(--n3)" }, { label:"22 AI specialists", color:"var(--n1)" }, { label:"Any business", color:"var(--n2)" }]
            .map(({ label, color }) => (
            <span key={label} className="font-mono"
              style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
                       color:"#000", background:color, padding:"4px 9px" }}>
              {label}
            </span>
          ))}
        </div>

        {/* Description */}
        <p style={{ fontSize:14, lineHeight:1.65, color:"#9A9AA8", margin:"0 0 14px",
                    fontFamily:"var(--font-grotesk), sans-serif" }}>
          Drop in any business or idea. Your team of{" "}
          <span style={{ color:"#C4C4CC" }}>22 AI specialists</span> — CEO, CMO, CRO, VP Growth and more —
          deliver a <span style={{ color:"#C4C4CC" }}>17-section growth playbook.</span>{" "}
          Fully written. Ready to execute.
        </p>

        {/* Specialist marquee */}
        <div style={{ overflow:"hidden", borderTop:"1px solid #1E1E22", borderBottom:"1px solid #1E1E22",
                      marginBottom:18, padding:"8px 0", background:"#0D0D0F" }}>
          <div style={{ display:"flex", width:"max-content", animation:"marquee 32s linear infinite" }}>
            {[...SPECIALISTS, ...SPECIALISTS].map((s, i) => {
              const colors = ["var(--n1)", "var(--n3)", "var(--n2)", "#9A9AA8"];
              const color = colors[i % colors.length];
              return (
              <span key={i} className="font-mono"
                style={{ fontSize:10, color, letterSpacing:"0.12em", textTransform:"uppercase",
                         whiteSpace:"nowrap", padding:"0 18px" }}>
                {s}
              </span>
            )})}
          </div>
        </div>

        {/* Input box */}
        <div style={{ border:"2px solid #F4F4F1", background:"#121214", position:"relative" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value.slice(0, 1000))}
            rows={3}
            maxLength={1000}
            autoFocus={false}
            aria-label="Describe your business or idea"
            placeholder="Your business, idea, or website — e.g. YouTube channel about personal finance"
            style={{
              width:"100%", resize:"none", background:"transparent", border:"none",
              outline:"none", color:"#F4F4F1", fontWeight:600,
              fontSize:18, lineHeight:1.3, padding:"20px 18px 14px",
              fontFamily:"var(--font-archivo), sans-serif",
              WebkitAppearance:"none",
            }}
          />

          {/* Char count + language row */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                        borderTop:"1px solid #2A2A2E", padding:"8px 14px" }}>
            <span className="kicker" style={{ fontSize:10 }}>Free · 8 of 17 sections</span>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{
                  background:"transparent", border:"1px solid #3C3C42",
                  color:"#D0D0D8", fontFamily:"var(--font-mono), monospace",
                  fontSize:11, letterSpacing:"0.06em", padding:"4px 6px",
                  cursor:"pointer", outline:"none", WebkitAppearance:"none",
                }}
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} style={{ background:"#0A0A0B" }}>{l.label}</option>
                ))}
              </select>
              <span className="font-mono" style={{ fontSize:11, color: input.length > 900 ? "var(--n2)" : "#5C5C63" }}>
                {input.length}/1000
              </span>
            </div>
          </div>

          {/* Progress bar along bottom of input */}
          {status === "loading" && (
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:"#1E1E22", overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${progress}%`, background:"var(--n3)",
                            transition:"width 0.3s ease-out", boxShadow:"0 0 8px var(--n3)" }} />
            </div>
          )}
        </div>

        {/* Analyze button — full width, below input */}
        {status === "done" ? (
          <button
            className="mobile-analyze-btn"
            onClick={() => { setStatus("idle"); setInput(""); setDoneSections([]); setPartialReport({}); setDoneReportId(null); }}
            style={{ background:"#1A1A1E", color:"#9A9AA8", borderTop:"1px solid #2A2A2E" }}
          >
            ← Analyze a new business
          </button>
        ) : (
          <button
            className="mobile-analyze-btn"
            onClick={() => run(input)}
            disabled={status === "loading" || !input.trim()}
            style={{
              background: status === "loading" ? "#1A1A1E" : "var(--n2)",
              color: status === "loading" ? "#7A7A8A" : "#000",
              borderTop: "2px solid var(--n2)",
            }}
          >
            {status === "loading" ? (
              <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:"var(--n1)",
                               display:"inline-block", animation:"mobilePulse 1s infinite" }} />
                <span style={{ fontSize:16 }}>{progress}% — Building your playbook</span>
              </span>
            ) : "Analyze →"}
          </button>
        )}

        {/* Loading message */}
        {status === "loading" && (
          <p className="font-mono" style={{ fontSize:11, color:"#6A6A75", letterSpacing:"0.06em",
                                            marginTop:12, paddingLeft:4, lineHeight:1.5 }}>
            ▶ {loadingMsg}
          </p>
        )}

        {/* Example chips — hidden when done so they can't ghost-trigger a new run */}
        {status !== "done" && (
        <div style={{ display:"flex", gap:8, marginTop:18, overflowX:"auto",
                      paddingBottom:4, WebkitOverflowScrolling:"touch" as React.CSSProperties["WebkitOverflowScrolling"] }}>
          <span className="kicker" style={{ fontSize:10, flexShrink:0, paddingTop:6 }}>Try</span>
          {EXAMPLES.map((ex, i) => (
            <button key={i} className="font-mono"
              onClick={() => { setInput(ex); run(ex); }}
              style={{ fontSize:11, border:"1px solid #2A2A2E", color:"#9A9AA8",
                       padding:"6px 12px", background:"transparent", cursor:"pointer",
                       whiteSpace:"nowrap", flexShrink:0 }}>
              {ex}
            </button>
          ))}
        </div>
        )}

        {/* Disclaimer */}
        <p className="font-mono" style={{ fontSize:10, lineHeight:1.6, color:"#6A6A7A",
                                          marginTop:16, letterSpacing:"0.02em" }}>
          AI-generated for strategic inspiration. Review before acting.{" "}
          <a href="/terms" style={{ color:"#7A7A8A", textDecoration:"underline" }}>Terms</a>
        </p>

        {/* Error */}
        {status === "error" && (
          <div className="font-mono" style={{ marginTop:20, fontSize:13, color:"var(--n2)",
                                              borderLeft:"3px solid var(--n2)", paddingLeft:12 }}>
            {error}
          </div>
        )}

        {/* Streaming sections */}
        {(status === "loading" || status === "done") && doneSections.length > 0 && (
          <div style={{ marginTop:32 }}>
            {/* ── Done banner (mobile) ── */}
            {status === "done" && doneReportId && (
              <div style={{
                marginBottom:20, padding:"18px 20px",
                background:"#0D1A0D", border:"2px solid var(--n3)",
                display:"flex", flexDirection:"column", gap:14,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ width:8, height:8, background:"var(--n3)", borderRadius:"50%",
                                 boxShadow:"0 0 10px var(--n3)", flexShrink:0 }} />
                  <span className="font-mono" style={{ fontSize:11, letterSpacing:"0.12em",
                                                       textTransform:"uppercase", color:"var(--n3)", fontWeight:700 }}>
                    Your playbook is ready
                  </span>
                </div>
                <p style={{ margin:0, fontSize:13, color:"#C4C4CC", lineHeight:1.5,
                            fontFamily:"var(--font-grotesk), sans-serif" }}>
                  {doneSections.length} sections generated. Open your report to read, copy, and print the full playbook.
                </p>
                <a href={`/report?id=${doneReportId}`}
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"center",
                    background:"var(--n3)", color:"#000", border:"none",
                    padding:"16px 20px", textDecoration:"none",
                    fontFamily:"var(--font-archivo), sans-serif",
                    fontSize:23, fontWeight:900, letterSpacing:"0.04em",
                    textTransform:"uppercase",
                  }}>
                  Open your free report →
                </a>
              </div>
            )}

            <div className="font-mono" style={{ fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase",
                                                 color: status === "done" ? "var(--n3)" : "#7A7A8A", marginBottom:12,
                                                 display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ width:6, height:6, background: status === "done" ? "var(--n3)" : "var(--n1)", borderRadius:"50%",
                             display:"inline-block",
                             ...(status === "loading" ? { animation:"mobilePulse 1s infinite" } : {}),
                             flexShrink:0 }} />
              {doneSections.length} of {status === "done" ? doneSections.length : "17"} sections ready
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {SECTION_ORDER.filter(k => doneSections.includes(k)).map(key => (
                <StreamCard key={key} sectionKey={key} data={partialReport[key as keyof typeof partialReport]} />
              ))}
            </div>
            {status === "loading" && doneSections.length < 17 && <OutputSkeleton slim />}
          </div>
        )}
        {status === "loading" && doneSections.length === 0 && <OutputSkeleton />}
        {status === "paywall" && <Paywall />}
        {status === "idle" && <IdlePreview />}
      </section>
    );
  }

  // ── Desktop layout ────────────────────────────────────────────────────────
  return (
    <section id="analyze" style={{ padding:"clamp(20px,3vw,44px) 0 40px" }}>

      {/* ── Kicker ── */}
      <p className="kicker" style={{ marginBottom:14, color:"#7A7A8A" }}>Autonomous Growth OS</p>

      {/* ── H1 — Tier 1: The Claim ── */}
      <h1 className="display" style={{ fontSize:"clamp(56px,7vw,70px)", lineHeight:1.0, marginBottom:20 }}>
        Your complete<br />growth playbook.<br /><span style={{ color:"var(--n1)" }}>Built by 22 AI specialists.</span>
      </h1>

      {/* ── Body — Tier 2: The Proof ── */}
      <p style={{
        fontSize:"clamp(14px,1.1vw,16px)", lineHeight:1.65,
        color:"#7A7A88", maxWidth:520, marginBottom:20,
        fontFamily:"var(--font-grotesk), sans-serif",
      }}>
        Drop in any business or idea. Your team of{" "}
        <span style={{ color:"#C4C4CC" }}>22 AI specialists</span> — CEO, CMO, CRO, VP Growth and more —
        deliver a <span style={{ color:"#C4C4CC" }}>17-section growth playbook</span> — fully written, ready to execute.
        Fully written. Ready to execute.
      </p>

      {/* ── Badges — Tier 3: Proof points ── */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:18 }}>
        {[{ label:"No login required", color:"var(--n3)" },
          { label:"22 AI specialists",  color:"var(--n1)" },
          { label:"Any business or idea", color:"var(--n2)" }]
          .map(({ label, color }) => (
          <span key={label} className="font-mono"
            style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase",
                     color:"#000", background:color, padding:"4px 10px" }}>
            {label}
          </span>
        ))}
      </div>

      {/* ── Specialist marquee — Tier 3 ── */}
      <div style={{ margin:"0 0 12px", overflow:"hidden", borderTop:"1px solid #1E1E22", borderBottom:"1px solid #1E1E22", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, left:0, width:60, background:"linear-gradient(90deg,#0A0A0B,transparent)", zIndex:2, pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, left:"auto", right:0, width:60, background:"linear-gradient(270deg,#0A0A0B,transparent)", zIndex:2, pointerEvents:"none" }} />
        <div style={{ display:"flex", width:"max-content", animation:"marquee 32s linear infinite", padding:"8px 0" }}>
          {[...SPECIALISTS, ...SPECIALISTS].map((s, i) => (
            <span key={i} className="font-mono" style={{ display:"inline-flex", alignItems:"center", gap:16, paddingRight:32, whiteSpace:"nowrap" }}>
              <span style={{ fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color: SPECIALIST_COLORS[i % SPECIALIST_COLORS.length] }}>
                {s}
              </span>
              <span style={{ width:3, height:3, borderRadius:"50%", background:"#2A2A2E", flexShrink:0, display:"inline-block" }} />
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }`}</style>
      </div>

      {/* ── Language line — Tier 4: Utility ── */}
      <p className="font-mono" style={{ fontSize:11, color:"#7A7A8A", letterSpacing:"0.04em", marginBottom:0, lineHeight:1.5 }}>
        Available in{" "}
        <span style={{ color:"#9A9AA8" }}>
          English, Español, Français, Deutsch, Português, Italiano, Nederlands, العربية, 中文, 日本語, 한국어, हिन्दी, Русский, Türkçe, Polski
        </span>
        {" "}— type in your language or pick one below.
      </p>

      <div style={{ border:"2px solid #F4F4F1", background:"#121214", marginTop:16, position:"relative" }}>
        <div style={{ display:"flex", alignItems:"stretch", flexWrap:"wrap" }}>
          <textarea value={input} onChange={e => setInput(e.target.value.slice(0,1000))}
            onKeyDown={onKey} rows={2} maxLength={1000}
            aria-label="Describe your business or idea"
            placeholder="Type your business, idea, or website here — e.g. YouTube channel about personal finance"
            style={{ flex:"1 1 420px", resize:"none", background:"transparent", border:"none",
                     outline:"none", color:"#F4F4F1", fontWeight:600,
                     fontSize:"clamp(20px,2.4vw,30px)", lineHeight:1.18,
                     padding:"26px 28px", minHeight:96,
                     fontFamily:"var(--font-archivo), sans-serif" }} />
          {status === "done" ? (
            <button onClick={() => { setStatus("idle"); setInput(""); setDoneSections([]); setPartialReport({}); setDoneReportId(null); }}
              style={{ flex:"0 0 auto", minWidth:200, fontSize:13,
                       padding:"0 28px", borderLeft:"2px solid #2A2A2E",
                       display:"flex", alignItems:"center", justifyContent:"center",
                       background:"transparent", border:"2px solid #2A2A2E",
                       color:"#7A7A8A", cursor:"pointer",
                       fontFamily:"var(--font-mono), monospace",
                       letterSpacing:"0.06em" }}>
              ← New analysis
            </button>
          ) : (
            <button className="btn-neon" onClick={() => run(input)}
              disabled={status === "loading" || !input.trim()}
              style={{ flex:"0 0 auto", minWidth:200, fontSize:"clamp(18px,2vw,24px)",
                       padding:"0 36px", borderLeft:"2px solid #F4F4F1",
                       display:"flex", flexDirection:"column", alignItems:"center",
                       justifyContent:"center", gap:4,
                       background:"var(--n2)", borderColor:"var(--n2)" }}>
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
          )}
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

      {status !== "done" && (
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:20, alignItems:"center" }}>
        <span className="kicker" style={{ marginRight:4 }}>Try</span>
        {EXAMPLES.map((ex, i) => (
          <button key={i} className="font-mono"
            onClick={() => { setInput(ex); run(ex); }}
            style={{ fontSize:11, border:"1px solid #2A2A2E", color:"#9A9AA8",
                     padding:"6px 11px", background:"transparent", cursor:"pointer" }}>
            {ex}
          </button>
        ))}
      </div>
      )}

      <p className="font-mono" style={{ fontSize:10, lineHeight:1.6, color:"#6A6A7A",
                                        marginTop:18, maxWidth:720, letterSpacing:"0.02em" }}>
        AI-generated for strategic inspiration. Output may be inaccurate — review before acting.
        See our <a href="/terms" style={{ color:"#7A7A8A", textDecoration:"underline", textUnderlineOffset:2 }}>Terms</a>.
      </p>

      {status === "error" && (
        <div className="font-mono" style={{ marginTop:24, fontSize:13, color:"var(--n2)",
                                            borderLeft:"3px solid var(--n2)", paddingLeft:12 }}>
          {error}
        </div>
      )}
      {(status === "loading" || status === "done") && doneSections.length > 0 && (
        <div style={{ marginTop:40 }}>
          {/* ── Done banner (desktop) ── */}
          {status === "done" && doneReportId && (
            <div style={{
              marginBottom:28, padding:"24px 28px",
              background:"#0D1A0D", border:"2px solid var(--n3)",
              display:"flex", alignItems:"center", justifyContent:"space-between",
              gap:24, flexWrap:"wrap",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <span style={{ width:10, height:10, background:"var(--n3)", borderRadius:"50%",
                               boxShadow:"0 0 12px var(--n3)", flexShrink:0 }} />
                <div>
                  <div className="font-mono" style={{ fontSize:11, letterSpacing:"0.14em",
                                                      textTransform:"uppercase", color:"var(--n3)",
                                                      fontWeight:700, marginBottom:4 }}>
                    Your playbook is ready — {doneSections.length} sections generated
                  </div>
                  <div style={{ fontSize:13, color:"#9A9AA8", fontFamily:"var(--font-grotesk), sans-serif", lineHeight:1.4 }}>
                    Open your full report to read every section, copy the content, and print or save as PDF.
                  </div>
                </div>
              </div>
              <a href={`/report?id=${doneReportId}`}
                style={{
                  display:"inline-flex", alignItems:"center", gap:8,
                  background:"var(--n3)", color:"#000", border:"none",
                  padding:"14px 28px", textDecoration:"none", flexShrink:0,
                  fontFamily:"var(--font-archivo), sans-serif",
                  fontSize:13, fontWeight:900, letterSpacing:"0.04em",
                  textTransform:"uppercase",
                  boxShadow:"4px 4px 0 #F4F4F1",
                }}>
                Open your free report →
              </a>
            </div>
          )}

          <div className="font-mono" style={{ fontSize:11, letterSpacing:"0.12em",
                                               textTransform:"uppercase",
                                               color: status === "done" ? "var(--n3)" : "#7A7A8A",
                                               marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:6, height:6,
                           background: status === "done" ? "var(--n3)" : "var(--n1)",
                           borderRadius:"50%", display:"inline-block",
                           ...(status === "loading" ? { animation:"pulseBlock 1s infinite" } : {}),
                           flexShrink:0 }} />
            {status === "done"
              ? `✓ ${doneSections.length} sections complete — preview below`
              : `Building your playbook — ${doneSections.length} of 17 sections ready`}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {SECTION_ORDER.filter(k => doneSections.includes(k)).map(key => (
              <StreamCard key={key} sectionKey={key} data={partialReport[key as keyof typeof partialReport]} />
            ))}
          </div>
          {status === "loading" && doneSections.length < 17 && <OutputSkeleton slim />}
        </div>
      )}
      {status === "loading" && doneSections.length === 0 && <OutputSkeleton />}
      {status === "paywall" && <Paywall />}
      {status === "idle" && <IdlePreview />}
    </section>
  );
}

const PREVIEW_SECTIONS = [
  { key: "executiveSummary", label: "Executive Summary", color: "var(--n1)", icon: "◈", free: true,
    chip: "Score 9.4 / 10",
    metrics: [
      { label: "Opportunity Score", value: "9.4/10" },
      { label: "Market Timing", value: "High" },
      { label: "Confidence", value: "94%" },
    ],
    insight: "Mid-market agencies are actively leaving HubSpot. The switch cycle peaks Q3 — this is the single best window to capture churn.",
    bullets: [
      { label: "ICP", text: "Agency ops leads, 5–50 seats, frustrated by HubSpot's complexity and $800+/mo cost" },
      { label: "Moat", text: "3× faster pipeline visibility at 40% lower total cost of ownership vs nearest competitor" },
      { label: "Channel", text: "LinkedIn outbound + G2 review flywheel is the highest-leverage acquisition path" },
      { label: "Risk", text: "Commoditisation risk is real — differentiate on analytics depth, not price alone" },
      { label: "Next move", text: "PLG free tier removes procurement friction for sub-10-seat teams and seeds viral loops" },
    ],
    tags: ["B2B SaaS", "PLG", "Mid-market", "Agency CRM", "Q3 window"],
  },
  { key: "topRoiActions", label: "Top ROI Actions", color: "var(--n1)", icon: "★", free: true,
    chip: "3 priority moves",
    metrics: [
      { label: "Highest Impact", value: "PLG Tier" },
      { label: "Fastest Win", value: "G2 Push" },
      { label: "Est. CAC", value: "$180" },
    ],
    insight: "These three moves compound. Each one feeds the next: PLG users review on G2, G2 reviews convert LinkedIn traffic, LinkedIn traffic seeds PLG.",
    bullets: [
      { label: "#1 · Impact: Critical", text: "Launch free PLG tier — removes procurement approval for sub-10-seat teams, seeds word-of-mouth" },
      { label: "#2 · Impact: High", text: "G2 review push — 15 verified reviews drives 22% lift in mid-market trial conversions" },
      { label: "#3 · Impact: High", text: "LinkedIn outbound to agency ops directors — 34% response rate on 3-line personalised messages" },
      { label: "#4 · Impact: Medium", text: "CRM comparison landing pages targeting 'HubSpot alternative for agencies' — 8,200 monthly searches" },
      { label: "#5 · Impact: Medium", text: "Partner with agency Slack communities — 6 communities × 800+ members each, zero ad spend" },
    ],
    tags: ["Quick wins", "PLG", "SEO", "Outbound", "Community"],
  },
  { key: "marketAnalysis", label: "Market Analysis", color: "var(--n2)", icon: "◎", free: false,
    chip: "TAM $4.2B",
    metrics: [
      { label: "TAM", value: "$4.2B" },
      { label: "SAM", value: "$820M" },
      { label: "SOM (Yr 1)", value: "$41M" },
    ],
    insight: "Mid-market CRM abandonment is accelerating. 62% of agencies with 10–50 seats report actively evaluating alternatives in the past 6 months.",
    bullets: [
      { label: "Market size", text: "Global CRM market $4.2B TAM, growing at 14.2% CAGR — agency segment outpacing at 19%" },
      { label: "Trend", text: "Mid-market churn from Salesforce and HubSpot running at 2× the 2022 rate — window is open now" },
      { label: "Gap", text: "No analytics-first CRM priced under $50/seat for agency workflows — category is wide open" },
      { label: "Geography", text: "US + UK + AU are primary SAM; all three show elevated 'HubSpot alternative' search volume" },
      { label: "Timing", text: "Annual CRM contract renewals cluster in Q1 and Q3 — Q3 decision cycle begins in 8 weeks" },
    ],
    tags: ["$4.2B TAM", "14.2% CAGR", "Agency segment", "Mid-market"],
  },
  { key: "competitorAnalysis", label: "Competitor Analysis", color: "var(--n2)", icon: "⊕", free: false,
    chip: "4 gaps identified",
    metrics: [
      { label: "HubSpot share", value: "38%" },
      { label: "Top churn reason", value: "Reporting" },
      { label: "Price gap", value: "$420/mo" },
    ],
    insight: "Every major incumbent has the same blind spot: they built for enterprise and bolted on agency features. None owns the analytics-first positioning.",
    bullets: [
      { label: "HubSpot", text: "38% share, over-priced at $800+/mo for agencies under 25 seats — top complaint: bloated features" },
      { label: "Pipedrive", text: "Affordable but weak on reporting — #1 cited reason for churn in G2 reviews (2,340 mentions)" },
      { label: "Salesforce", text: "Requires 1+ FTE admin to maintain — eliminates itself from sub-50-seat agency shortlists" },
      { label: "Monday CRM", text: "Strong UX but no pipeline forecasting — agencies outgrow it within 12 months" },
      { label: "Your gap", text: "Analytics-first CRM at $39–79/seat with agency-native reporting — no credible incumbent here" },
    ],
    tags: ["HubSpot", "Pipedrive", "Salesforce", "Monday", "Gap analysis"],
  },
  { key: "acquisitionPlan", label: "Acquisition Plan", color: "var(--n3)", icon: "➤", free: false,
    chip: "3 primary channels",
    metrics: [
      { label: "Target CAC", value: "$180" },
      { label: "Payback", value: "4.2 mo" },
      { label: "Blended LTV", value: "$1,840" },
    ],
    insight: "Content-led SEO and LinkedIn outbound are your two best channels with a 9:1 LTV:CAC ratio at scale. Run them in parallel from day one.",
    bullets: [
      { label: "Channel 1", text: "LinkedIn outbound — agency ops directors, 3-line personalised message, 34% reply rate, $0 ad spend" },
      { label: "Channel 2", text: "SEO comparison pages — 'HubSpot vs [you]' format, 8,200 monthly searches, 90-day to rank" },
      { label: "Channel 3", text: "Agency Slack / Discord communities — warm intros via community managers, 6 priority targets" },
      { label: "Budget split", text: "60% content / 40% paid. Flip ratio at $500 MRR once paid CAC data validates unit economics" },
      { label: "Milestone", text: "Target 50 trials in 30 days → 12 paid conversions → $940 MRR. Repeatable loop established." },
    ],
    tags: ["LinkedIn", "SEO", "Community", "PLG", "$180 CAC"],
  },
  { key: "socialMediaStrategy", label: "Social Media", color: "var(--n3)", icon: "◈", free: false,
    chip: "4-week calendar",
    metrics: [
      { label: "Primary channel", value: "LinkedIn" },
      { label: "Post frequency", value: "3×/week" },
      { label: "Target CPL", value: "$14" },
    ],
    insight: "Thought leadership on LinkedIn targeting agency ops pain points will outperform broad product marketing by 4× based on category comps.",
    bullets: [
      { label: "LinkedIn", text: "Agency ops thought leadership — 3× per week. Hook: 'We saved this agency 6 hrs/week on reporting'" },
      { label: "YouTube", text: "CRM comparison walkthroughs — 2× per month. 'HubSpot vs [You] for agencies' drives SEO + trust" },
      { label: "Reddit", text: "r/sales + r/agency daily engagement for 30 days before any mention of product — build credibility first" },
      { label: "Twitter/X", text: "Behind-the-scenes build log — founder-mode content, 1× per day, tag early users for social proof" },
      { label: "Week 1 posts", text: "Mon: agency CRM pain stat · Wed: feature demo GIF · Fri: customer testimonial or case study hook" },
    ],
    tags: ["LinkedIn", "YouTube", "Reddit", "Twitter", "Thought leadership"],
  },
  { key: "plan7Day", label: "7-Day Sprint", color: "#9A9AA8", icon: "①", free: false,
    chip: "Day-by-day plan",
    metrics: [
      { label: "Target", value: "50 outreach" },
      { label: "Goal", value: "10 trials" },
      { label: "Budget", value: "$0" },
    ],
    insight: "The first 7 days are about systems, not results. Get the pipes in place so everything compounds automatically from week 2.",
    bullets: [
      { label: "Day 1–2", text: "Cold email sequence live in Instantly or Apollo — 50 prospects loaded, personalisation fields verified" },
      { label: "Day 3", text: "G2 profile fully live with 3 founding customer reviews — screenshots shared on LinkedIn" },
      { label: "Day 4", text: "First LinkedIn post published — agency ops pain angle, 3-paragraph format, no product mention" },
      { label: "Day 5–6", text: "HubSpot comparison landing page live, submitted to Google Search Console, internal links added" },
      { label: "Day 7", text: "Review all metrics: open rate, reply rate, profile views, trial signups — adjust sequences based on data" },
    ],
    tags: ["Email outreach", "G2", "SEO", "LinkedIn", "Day-by-day"],
  },
  { key: "immediateActions", label: "Immediate Actions", color: "#9A9AA8", icon: "⚡", free: false,
    chip: "Next 24–72 hours",
    metrics: [
      { label: "Next 24h", value: "10 DMs" },
      { label: "Next 48h", value: "1 page live" },
      { label: "Next 72h", value: "G2 live" },
    ],
    insight: "These actions take under 2 hours total and generate compounding returns. Start with the LinkedIn DMs — replies will arrive before you finish the other two.",
    bullets: [
      { label: "Now (30 min)", text: "Message 10 agency founders on LinkedIn — use the exact script in Section 9, personalise company name only" },
      { label: "Today (1 hr)", text: "Claim and complete G2 profile — add screenshots, logo, description, request 3 reviews from existing users" },
      { label: "Next 48h", text: "Publish CRM comparison landing page — 'Best HubSpot alternative for agencies' — use Section 3 data as source" },
      { label: "Next 48h", text: "Post first LinkedIn thought leadership piece — agency ops pain, no product pitch, end with a question" },
      { label: "Next 72h", text: "Set up weekly review cadence: Monday 30-min check on pipeline, CAC, trial-to-paid rate" },
    ],
    tags: ["LinkedIn DMs", "G2", "Landing page", "Content", "Tracking"],
  },
];

const PREVIEW_GROUPS = [
  { label: "Analysis", color: "var(--n1)", keys: ["executiveSummary", "topRoiActions"] },
  { label: "Market",   color: "var(--n2)", keys: ["marketAnalysis", "competitorAnalysis"] },
  { label: "Growth",   color: "var(--n3)", keys: ["acquisitionPlan", "socialMediaStrategy"] },
  { label: "Execution",color: "#9A9AA8",   keys: ["plan7Day", "immediateActions"] },
];

function IdlePreview() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = PREVIEW_SECTIONS[activeIdx];

  const ContentPanel = ({ isMobile }: { isMobile?: boolean }) => {
    const pad = isMobile ? "16px 16px" : "20px 28px";
    const inner = (
      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>

        {/* ── Header row ── */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:pad,
                      borderBottom:"1px solid #1A1A1E" }}>
          <span style={{ fontSize:15, color:active.color, lineHeight:1, flexShrink:0 }}>{active.icon}</span>
          <span className="kicker" style={{ color:active.color, fontSize:9, flex:1 }}>{active.label}</span>
          <span className="font-mono" style={{
            fontSize:8, letterSpacing:"0.1em", textTransform:"uppercase",
            padding:"2px 8px", border:`1px solid ${active.free ? active.color : "#2A2A2E"}`,
            color: active.free ? active.color : "#3C3C42",
          }}>{active.free ? "FREE PREVIEW" : "PRO"}</span>
        </div>

        {/* ── Metrics row ── */}
        <div style={{ display:"flex", borderBottom:"1px solid #1A1A1E" }}>
          {active.metrics.map((m, i) => (
            <div key={i} style={{
              flex:1, padding: isMobile ? "10px 12px" : "11px 16px",
              borderRight: i < active.metrics.length - 1 ? "1px solid #1A1A1E" : "none",
            }}>
              <div className="font-mono" style={{ fontSize:8, color:"#4A4A55", letterSpacing:"0.1em",
                                                  textTransform:"uppercase", marginBottom:4 }}>{m.label}</div>
              <div className="display" style={{ fontSize: isMobile ? 15 : 17, color:active.color, lineHeight:1 }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* ── Key insight callout ── */}
        <div style={{
          padding: isMobile ? "10px 14px" : "11px 20px",
          borderBottom:"1px solid #1A1A1E",
          borderLeft:`3px solid ${active.color}`,
          background:`${active.color}07`,
          display:"flex", gap:10, alignItems:"flex-start",
        }}>
          <span className="font-mono" style={{ fontSize:8, color:active.color, letterSpacing:"0.1em",
                                               textTransform:"uppercase", flexShrink:0, marginTop:2 }}>KEY INSIGHT</span>
          <span style={{ fontSize: isMobile ? 12 : 12, color:"#C4C4CC", lineHeight:1.55,
                         fontFamily:"var(--font-grotesk), sans-serif" }}>{active.insight}</span>
        </div>

        {/* ── Bullet list ── */}
        <div style={{ display:"flex", flexDirection:"column" }}>
          {active.bullets.map((b, i) => (
            <div key={i} style={{
              display:"flex", gap:10, alignItems:"flex-start",
              padding: isMobile ? "8px 14px" : "8px 20px",
              borderBottom: i < active.bullets.length - 1 ? "1px solid #111113" : "none",
            }}>
              <span style={{ color:active.color, fontSize:9, flexShrink:0, marginTop:3, lineHeight:1 }}>›</span>
              <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 8, alignItems:"flex-start", flex:1 }}>
                <span className="font-mono" style={{
                  fontSize:8, color: active.color, letterSpacing:"0.06em",
                  flexShrink:0, whiteSpace:"nowrap", marginTop:2, opacity:0.8,
                }}>{b.label}</span>
                <span style={{ fontSize: isMobile ? 12 : 12.5, color:"#BEBEC8", lineHeight:1.55,
                               fontFamily:"var(--font-grotesk), sans-serif" }}>{b.text}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tags row ── */}
        <div style={{ padding: isMobile ? "9px 12px" : "9px 20px", borderTop:"1px solid #1A1A1E",
                      display:"flex", flexWrap:"wrap", gap:6 }}>
          {active.tags.map((tag, i) => (
            <span key={i} className="font-mono" style={{
              fontSize:8, letterSpacing:"0.08em", textTransform:"uppercase",
              color:"#3C3C42", border:"1px solid #1E1E22", padding:"2px 7px",
            }}>{tag}</span>
          ))}
        </div>

      </div>
    );

    if (!active.free) {
      return (
        <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
          <div style={{ filter:"blur(4px)", userSelect:"none", pointerEvents:"none", opacity:0.6 }}>
            {inner}
          </div>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
                        alignItems:"center", justifyContent:"center", gap:12,
                        background:"rgba(10,10,11,0.55)", backdropFilter:"blur(1px)" }}>
            <div className="font-mono" style={{ fontSize:9, color:"#5C5C63", letterSpacing:"0.12em",
                                                textTransform:"uppercase", textAlign:"center" }}>
              {active.label} · Pro section
            </div>
            <a href="/pricing" style={{
              fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase",
              color:"#000", textDecoration:"none",
              background:"var(--n2)", border:"2px solid var(--n2)",
              padding:"9px 20px", fontFamily:"var(--font-archivo), sans-serif",
              fontWeight:800, whiteSpace:"nowrap",
            }}>
              Unlock all 17 sections →
            </a>
          </div>
        </div>
      );
    }

    return <div style={{ flex:1 }}>{inner}</div>;
  };

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

      {/* Divider label */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
        <div style={{ height:1, flex:1, background:"#1E1E22" }} />
        <span className="font-mono" style={{ fontSize:10, color:"#7A7A8A", letterSpacing:"0.16em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
          Sample report · any business, any idea
        </span>
        <div style={{ height:1, flex:1, background:"#1E1E22" }} />
      </div>

      {/* OS window */}
      <div style={{ border:"2px solid #F4F4F1", background:"#0A0A0B", overflow:"hidden" }}>

        {/* Title bar */}
        <div style={{ borderBottom:"2px solid #1E1E22", padding:"9px 16px",
                      display:"flex", alignItems:"center", gap:12, background:"#111113" }}>
          <div style={{ display:"flex", gap:5 }}>
            <span style={{ width:10, height:10, borderRadius:"50%", background:"#FF5F57", display:"inline-block" }} />
            <span style={{ width:10, height:10, borderRadius:"50%", background:"#FFBD2E", display:"inline-block" }} />
            <span style={{ width:10, height:10, borderRadius:"50%", background:"#28C840", display:"inline-block" }} />
          </div>
          <div style={{ flex:1, background:"#0A0A0B", border:"1px solid #1E1E22",
                        padding:"4px 12px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--n3)", display:"inline-block", flexShrink:0 }} />
            <span className="font-mono" style={{ fontSize:10, color:"#4A4A55", letterSpacing:"0.03em" }}>
              conciply.com/workspace
            </span>
            <span style={{ width:1, height:10, background:"#1E1E22", flexShrink:0 }} />
            <span className="font-mono" style={{ fontSize:10, color:"#6A6A75" }}>B2B CRM tool</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span className="font-mono" style={{ fontSize:9, color:"#3C3C42", letterSpacing:"0.06em" }}>
              {activeIdx + 1}/{PREVIEW_SECTIONS.length} sections
            </span>
            <span className="font-mono" style={{ fontSize:8, color:"#2A2A2E", letterSpacing:"0.12em", textTransform:"uppercase", border:"1px solid #1E1E22", padding:"2px 6px" }}>SAMPLE</span>
          </div>
        </div>

        {/* ── Desktop: sidebar + content ── */}
        <div className="idle-desktop">

          {/* Sidebar with groups */}
          <div style={{ width:200, borderRight:"1px solid #1E1E22", flexShrink:0, display:"flex", flexDirection:"column" }}>
            {/* Logo */}
            <div style={{ padding:"10px 14px", borderBottom:"1px solid #1E1E22", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ display:"flex", gap:2, flexShrink:0 }}>
                <span style={{ width:7, height:14, background:"var(--n1)", display:"inline-block" }} />
                <span style={{ width:7, height:14, background:"var(--n2)", display:"inline-block" }} />
                <span style={{ width:7, height:14, background:"var(--n3)", display:"inline-block" }} />
              </span>
              <span className="display" style={{ fontSize:14, letterSpacing:"-0.01em" }}>Conciply</span>
            </div>
            {/* Report meta */}
            <div style={{ padding:"10px 14px 10px", borderBottom:"1px solid #1E1E22" }}>
              <div className="font-mono" style={{ fontSize:9, color:"#5C5C63", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Report</div>
              <div style={{ fontSize:12, fontWeight:700, color:"#C4C4CC", lineHeight:1.3, fontFamily:"var(--font-grotesk), sans-serif" }}>B2B CRM tool</div>
              <div className="font-mono" style={{ fontSize:9, color:"var(--n3)", marginTop:6, letterSpacing:"0.06em" }}>Free · 8 of 17 sections</div>
            </div>

            {/* Section groups */}
            {PREVIEW_GROUPS.map(group => (
              <div key={group.label}>
                <div style={{
                  padding:"8px 14px 4px",
                  fontSize:8, fontFamily:"var(--font-mono)", fontWeight:700,
                  letterSpacing:"0.16em", textTransform:"uppercase",
                  color: group.color, display:"flex", alignItems:"center", gap:7,
                }}>
                  <span style={{ width:12, height:1, background:group.color, display:"inline-block" }} />
                  {group.label}
                </div>
                {PREVIEW_SECTIONS.filter(s => group.keys.includes(s.key)).map(s => {
                  const i = PREVIEW_SECTIONS.indexOf(s);
                  const isActive = i === activeIdx;
                  return (
                    <button key={s.key} onClick={() => setActiveIdx(i)} style={{
                      display:"flex", alignItems:"center", gap:8,
                      padding:"7px 14px",
                      borderBottom:"1px solid #0D0D0F",
                      borderTop:"none", borderRight:"none",
                      borderLeft: isActive ? `2px solid ${s.color}` : "2px solid transparent",
                      background: isActive ? "#13131A" : "transparent",
                      cursor:"pointer", width:"100%", textAlign:"left",
                    }}>
                      <span style={{ fontSize:11, color: s.free ? (isActive ? s.color : "#5C5C63") : "#252528", flexShrink:0 }}>
                        {s.free ? s.icon : "▪"}
                      </span>
                      <span className="font-mono" style={{
                        fontSize:10, letterSpacing:"0.02em",
                        color: isActive ? (s.free ? s.color : "#5C5C63") : (s.free ? "#6A6A75" : "#2A2A2E"),
                        whiteSpace:"nowrap",
                      }}>
                        {s.label}
                      </span>
                      {!s.free && (
                        <span className="font-mono" style={{ fontSize:7, color:"#252528", marginLeft:"auto", letterSpacing:"0.08em", textTransform:"uppercase" }}>PRO</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <ContentPanel />
        </div>

        {/* ── Mobile: chip bar + card ── */}
        <div className="idle-mobile">
          <div style={{ overflowX:"auto", display:"flex", gap:0, borderBottom:"1px solid #1E1E22", scrollbarWidth:"none" }}>
            {PREVIEW_SECTIONS.map((s, i) => (
              <button key={s.key} onClick={() => setActiveIdx(i)} style={{
                flexShrink:0, padding:"8px 12px",
                border:"none", borderBottom: i === activeIdx ? `2px solid ${s.color}` : "2px solid transparent",
                background: "transparent", cursor:"pointer",
              }}>
                <span className="font-mono" style={{
                  fontSize:9, whiteSpace:"nowrap", letterSpacing:"0.06em", textTransform:"uppercase",
                  color: i === activeIdx ? s.color : s.free ? "#6A6A75" : "#2A2A2E",
                }}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
          <ContentPanel isMobile={true} />
          <div style={{ borderTop:"1px solid #1E1E22", padding:"8px 14px",
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
          Enter your business or idea above and get your full growth playbook.
        </span>
        <span className="font-mono" style={{ fontSize:10, color:"#2A2A2E", letterSpacing:"0.1em", textTransform:"uppercase" }}>
          No login required
        </span>
      </div>
    </div>
  );
}
