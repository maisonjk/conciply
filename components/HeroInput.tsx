"use client";
import { useState, useCallback, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { saveReport, getLicenseKey } from "@/lib/workspace";
import OutputSkeleton from "./OutputSkeleton";
import Paywall from "./Paywall";
import DemoPreview from "./DemoPreview";
import type { GrowthReport } from "@/lib/types";

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
  "YouTube channel about personal finance",
  "Online boutique selling handmade jewelry",
  "Freelance graphic design studio",
  "Mobile app for local restaurant discovery",
];

function getTodayCount() {
  const base = 3241;
  const day = Math.floor(Date.now() / 86400000);
  const seed = (day * 2654435761) % 2000;
  return base + seed;
}

const LOADING_MESSAGES = [
  "Assembling your AI executive team…",
  "Analyzing market size and trends…",
  "Studying your competitors…",
  "Identifying growth opportunities…",
  "Building your acquisition plan…",
  "Crafting your social media strategy…",
  "Writing your sales playbook…",
  "Designing your retention strategy…",
  "Calculating your top ROI actions…",
  "Writing your 7-day sprint plan…",
  "Finalizing your growth playbook…",
];

type Status = "idle" | "loading" | "done" | "error" | "paywall";

export default function HeroInput() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("auto");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  useEffect(() => { setCount(getTodayCount()); }, []);

  // Cycle through status messages while loading
  useEffect(() => {
    if (status !== "loading") return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 2200);
    return () => clearInterval(interval);
  }, [status]);

  const run = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || status === "loading") return;
    setStatus("loading");
    setLoadingMsg(LOADING_MESSAGES[0]);
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

      // Non-streaming error (quota exceeded, auth failure etc.)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429 || data?.paywall) { setStatus("paywall"); return; }
        setError(data?.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      // Consume SSE stream
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse complete SSE lines
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "chunk") {
              // Progress ping — message cycling handled by useEffect above
            } else if (event.type === "done") {
              const stored = saveReport(q, event.report as GrowthReport);
              setStatus("done");
              setCount(c => c + 1);
              router.push(`/report?id=${stored.id}`);
            } else if (event.type === "error") {
              setError(event.error || "Something went wrong.");
              setStatus("error");
            }
          } catch { /* partial JSON chunk, skip */ }
        }
      }
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

      <div className="kicker" style={{ marginBottom:16 }}>Autonomous Growth Operating System</div>

      <h1 className="display" style={{ fontSize:"clamp(36px,6.5vw,96px)" }}>
        Every great idea deserves<br />a <span style={{ color:"var(--n2)" }}>growth playbook.</span>
      </h1>

      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:24, marginBottom:20 }}>
        {[{ label:"No login required", color:"var(--n3)" },
          { label:"20 AI specialists",  color:"var(--n1)" },
          { label:"Results in under 60s", color:"var(--n2)" },
          { label:"15 languages",       color:"var(--n3)" }]
          .map(({ label, color }) => (
          <span key={label} className="font-mono"
            style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase",
                     color:"#000", background:color, padding:"5px 12px" }}>
            {label}
          </span>
        ))}
      </div>

      <p style={{ fontSize:"clamp(17px,1.8vw,22px)", lineHeight:1.45, color:"#C4C4CC", maxWidth:640, marginBottom:16 }}>
        Conciply deploys an <span style={{ color:"#F4F4F1" }}>AI executive team of 20 specialists</span> to analyze any business or idea and generate a custom growth playbook in seconds.
      </p>

      <p className="font-mono" style={{ fontSize:13, color:"#8A8A9A", letterSpacing:"0.04em", marginBottom:0 }}>
        🌐 Available in{" "}
        <span style={{ color:"var(--n1)" }}>
          English, Español, Français, Deutsch, Português, Italiano, Nederlands, العربية, 中文, 日本語, 한국어, हिन्दी, Русский, Türkçe, Polski
        </span>
        {" "}— type in your language or pick one below.
      </p>

      <div style={{ border:"2px solid #F4F4F1", background:"#121214", marginTop:32 }}>
        <div style={{ display:"flex", alignItems:"stretch", flexWrap:"wrap" }}>
          <textarea value={input} onChange={e => setInput(e.target.value.slice(0,1000))}
            onKeyDown={onKey} rows={2} maxLength={1000}
            placeholder="Describe your business or idea — e.g. YouTube channel about personal finance"
            style={{ flex:"1 1 420px", resize:"none", background:"transparent", border:"none",
                     outline:"none", color:"#F4F4F1", fontWeight:600,
                     fontSize:"clamp(20px,2.4vw,30px)", lineHeight:1.18,
                     padding:"26px 28px", minHeight:96,
                     fontFamily:"var(--font-archivo), sans-serif" }} />
          <button className="btn-neon" onClick={() => run(input)}
            disabled={status === "loading" || !input.trim()}
            style={{ flex:"0 0 auto", minWidth:200, fontSize:"clamp(18px,2vw,24px)",
                     padding:"0 36px", borderLeft:"2px solid #F4F4F1" }}>
            {status === "loading" ? "Analyzing…" : "Analyze ↵"}
          </button>
        </div>

        {/* Live status message while loading */}
        {status === "loading" && (
          <div style={{ borderTop:"1px solid #2A2A2E", padding:"12px 28px",
                        display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ width:7, height:7, background:"var(--n1)", display:"inline-block",
                           borderRadius:"50%", animation:"pulseBlock 1s infinite", flexShrink:0 }} />
            <span className="font-mono" style={{ fontSize:12, color:"var(--n1)",
                            letterSpacing:"0.06em", transition:"opacity 0.3s" }}>
              {loadingMsg}
            </span>
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                      borderTop:"1px solid #2A2A2E", padding:"10px 16px 10px 28px" }}>
          <span className="kicker">Free: 8 of 17 sections — no login required</span>
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
      {status === "idle" && <DemoPreview />}
    </section>
  );
}

