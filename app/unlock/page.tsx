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

    (async () => {
      setStatus("loading");
      const res = await fetch("/api/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: sessionId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLicense(sessionId, data.tier);
        setMessage(`${data.tier} plan unlocked! Redirecting…`);
        setStatus("success");
        setTimeout(() => router.push("/"), 1500);
      } else {
        setStatus("idle");
      }
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
      ) : (
        <>
          <div style={{ border:"2px solid #F4F4F1", display:"flex", flexWrap:"wrap" }}>
            <input value={key} onChange={e => setKey(e.target.value)}
              onKeyDown={e => e.key === "Enter" && verify()}
              placeholder="Paste your license key…" className="font-mono"
              style={{ flex:"1 1 280px", background:"transparent", border:"none", outline:"none",
                       color:"#F4F4F1", fontSize:14, padding:"18px 20px" }} />
            <button onClick={verify} disabled={status === "loading" || !key.trim()}
              className="btn-neon"
              style={{ padding:"0 24px", fontSize:14, borderLeft:"2px solid #F4F4F1" }}>
              {status === "loading" ? "Verifying…" : "Unlock →"}
            </button>
          </div>
          {status === "error" && (
            <p className="font-mono" style={{ fontSize:13, color:"var(--n2)", marginTop:12 }}>{message}</p>
          )}
          <p style={{ color:"#9A9AA8", fontSize:13, marginTop:20 }}>
            Your license key was emailed after purchase.{" "}
            <a href="/restore" style={{ color:"var(--n1)", textDecoration:"underline" }}>Can&#39;t find it?</a>
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
