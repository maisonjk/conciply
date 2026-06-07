"use client";
import { useState, useCallback, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { saveReport, getLicenseKey } from "@/lib/workspace";
import OutputSkeleton from "./OutputSkeleton";
import Paywall from "./Paywall";
import type { GrowthReport } from "@/lib/types";
import { FREE_SECTIONS, SECTION_LABELS } from "@/lib/types";

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

type Status = "idle" | "loading" | "done" | "error" | "paywall";

export default function HeroInput() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => { setCount(getTodayCount()); }, []);

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
        body: JSON.stringify({ input: q }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 || data?.paywall) { setStatus("paywall"); return; }
        setError(data?.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      const stored = saveReport(q, data.report as GrowthReport);
      setStatus("done");
      setCount(c => c + 1);
      router.push(`/report?id=${stored.id}`);
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

      <h1 className="display" style={{ fontSize:"clamp(44px,8.5vw,128px)" }}>
        Your entire<br />executive team.<br /><span style={{ color:"var(--n2)" }}>AI-powered.</span>
      </h1>

      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:24, marginBottom:20 }}>
        {[{ label:"No login required", color:"var(--n3)" },
          { label:"22 AI specialists",  color:"var(--n1)" },
          { label:"Results in ~30s",    color:"var(--n2)" }]
          .map(({ label, color }) => (
          <span key={label} className="font-mono"
            style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase",
                     color:"#000", background:color, padding:"5px 12px" }}>
            {label}
          </span>
        ))}
      </div>

      <p style={{ fontSize:"clamp(17px,1.8vw,22px)", lineHeight:1.45, color:"#C4C4CC", maxWidth:640, marginBottom:0 }}>
        Conciply deploys a full <span style={{ color:"#F4F4F1" }}>CEO, CMO, CRO, VP Growth, SDR and 17 more AI
        specialists</span> to analyze any business or idea — SaaS, content creator, e-commerce, agency, or anything in between — and build a complete growth playbook in seconds.

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
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                      borderTop:"1px solid #2A2A2E", padding:"10px 16px 10px 28px" }}>
          <span className="kicker">Free: Executive Summary + Top 10 ROI Actions</span>
          <span className="font-mono" style={{ fontSize:12, color: input.length > 900 ? "var(--n2)" : "#5C5C63" }}>
            {input.length}/1000
          </span>
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

function IdlePreview() {
  return (
    <div style={{ marginTop:"clamp(56px,7vw,96px)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    flexWrap:"wrap", gap:12, border:"2px solid #2A2A2E",
                    padding:"18px 28px", marginBottom:2 }}>
        <div>
          <div className="kicker" style={{ marginBottom:4 }}>Example output · B2B CRM for agencies</div>
          <div style={{ fontFamily:"var(--font-archivo), sans-serif", fontWeight:800,
                        fontSize:"clamp(16px,1.8vw,22px)",
                        textTransform:"uppercase", color:"#5C5C63" }}>
            Enter your business or idea above to generate yours →
          </div>
        </div>
        <span className="font-mono" style={{ fontSize:11, color:"#3C3C42", letterSpacing:"0.1em" }}>SAMPLE</span>
      </div>
      <div style={{ opacity:0.5, pointerEvents:"none" }}>
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
