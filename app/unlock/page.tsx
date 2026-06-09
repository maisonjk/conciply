"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Nav, { Footer } from "@/components/Nav";
import { setLicense } from "@/lib/workspace";

function UnlockContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    // Poll up to 8 times (≈16s) to handle webhook race condition.
    // The webhook fires async — the user's browser may arrive here before
    // Stripe has delivered it and the KV key has been written.
    (async () => {
      setStatus("loading");
      const MAX_ATTEMPTS = 8;
      const DELAY_MS = 2000;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, DELAY_MS));
        }
        const res = await fetch("/api/verify", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: sessionId }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 202 && data.retry) {
          // Webhook not yet processed — keep polling
          continue;
        }

        if (res.ok) {
          // Use the real HMAC license key the API looked up from KV,
          // NOT the Stripe session ID (which would fail future HMAC checks).
          const licenseKey = data.licenseKey ?? sessionId;
          setLicense(licenseKey, data.tier);
          setMessage(`${data.tier} plan unlocked! Redirecting…`);
          setStatus("success");
          setTimeout(() => router.push("/"), 1500);
          return;
        }

        // Non-retryable error — fall through to manual entry
        setStatus("idle");
        setMessage(data.error || "");
        return;
      }

      // Exhausted retries — webhook never arrived
      setStatus("error");
      setMessage("License activation is taking longer than expected. Please paste your key below or try again in a minute.");
    })();
  }, [params, router]);

  const verify = async () => {
    const k = key.trim();
    if (!k) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: k }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus("error"); setMessage(data.error || "Invalid key."); return; }
      setLicense(k, data.tier);
      setMessage(`${data.tier} plan unlocked!`);
      setStatus("success");
      setTimeout(() => router.push("/"), 1200);
    } catch {
      setStatus("error"); setMessage("Network error.");
    }
  };

  return (
    <main className="shell" style={{ maxWidth:560, paddingTop:"clamp(64px,8vw,100px)", paddingBottom:80 }}>
      <div className="kicker" style={{ marginBottom:16 }}>Unlock</div>
      <h1 className="display" style={{ fontSize:"clamp(32px,5vw,64px)", marginBottom:32 }}>
        Enter your<br /><span style={{ color:"var(--n1)" }}>license key.</span>
      </h1>

      {status === "success" ? (
        <div style={{ border:"2px solid var(--n3)", padding:24 }}>
          <span className="font-mono" style={{ color:"var(--n3)", fontWeight:700 }}>✓ {message}</span>
        </div>
      ) : status === "loading" && params.get("session_id") ? (
        // Stripe redirect — show activation progress, not a confusing key form
        <div style={{ border:"2px solid #1E1E22", padding:24 }}>
          <div className="font-mono" style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase",
                                              color:"var(--n2)", marginBottom:16 }}>
            Activating your plan…
          </div>
          <div style={{ width:"100%", height:2, background:"#1E1E22", overflow:"hidden" }}>
            <div style={{ height:"100%", width:"60%", background:"var(--n2)",
                          animation:"slide 1s ease-in-out infinite alternate" }} />
          </div>
          <style>{`@keyframes slide{from{transform:translateX(0)}to{transform:translateX(70%)}}`}</style>
          <p style={{ color:"#9A9AA8", fontSize:12, marginTop:16, fontFamily:"var(--font-mono)" }}>
            Confirming payment with Stripe…
          </p>
        </div>
      ) : (
        <>
          <div style={{ border:"2px solid #F4F4F1", display:"flex", flexWrap:"wrap" }}>
            <input value={key} onChange={e => setKey(e.target.value)}
              onKeyDown={e => e.key === "Enter" && verify()}
              aria-label="License key"
              placeholder="Paste your license key…" className="font-mono"
              style={{ flex:"1 1 280px", background:"transparent", border:"none", outline:"none",
                       color:"#F4F4F1", fontSize:14, padding:"18px 20px" }} />
            <button onClick={verify} disabled={status === "loading" || !key.trim()}
              className="btn-neon"
              style={{ padding:"0 24px", fontSize:14, borderLeft:"2px solid #F4F4F1" }}>
              {status === "loading" ? "Verifying…" : "Unlock →"}
            </button>
          </div>
          {status === "error" && message && (
            <p className="font-mono" style={{ fontSize:13, color:"var(--n2)", marginTop:12 }}>{message}</p>
          )}
          <p style={{ color:"#9A9AA8", fontSize:13, marginTop:20 }}>
            Your license key was emailed after purchase.{" "}
            <a href="/restore" className="font-mono" style={{ color:"var(--n1)", textDecoration:"underline", letterSpacing:"0.06em", textTransform:"uppercase", fontSize:11 }}>Restore access →</a>
          </p>
        </>
      )}
    </main>
  );
}

export default function UnlockPage() {
  return (
    <>
      <Nav />
      <Suspense>
        <UnlockContent />
      </Suspense>
      <Footer />
    </>
  );
}
