"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav, { Footer } from "@/components/Nav";
import { setLicense } from "@/lib/workspace";

export default function RestorePage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");

  const restore = async () => {
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
      setMessage(`${data.tier} plan restored!`);
      setStatus("success");
      setTimeout(() => router.push("/"), 1200);
    } catch {
      setStatus("error"); setMessage("Network error.");
    }
  };

  return (
    <>
      <Nav />
      <main className="shell" style={{ maxWidth:560, paddingTop:"clamp(64px,8vw,100px)", paddingBottom:80 }}>
        <div className="kicker" style={{ marginBottom:16 }}>Restore</div>
        <h1 className="display" style={{ fontSize:"clamp(32px,5vw,64px)", marginBottom:16 }}>
          Restore your<br /><span style={{ color:"var(--n1)" }}>license.</span>
        </h1>
        <p style={{ color:"#C4C4CC", fontSize:16, lineHeight:1.6, marginBottom:32 }}>
          Paste your license key to restore access on a new device or browser.
          Your key was emailed when you purchased.
        </p>

        {status === "success" ? (
          <div style={{ border:"2px solid var(--n3)", padding:24 }}>
            <span className="font-mono" style={{ color:"var(--n3)", fontWeight:700 }}>✓ {message}</span>
          </div>
        ) : (
          <>
            <div style={{ border:"2px solid #F4F4F1", display:"flex", flexWrap:"wrap" }}>
              <input value={key} onChange={e => setKey(e.target.value)}
                onKeyDown={e => e.key === "Enter" && restore()}
                aria-label="License key"
                placeholder="Paste your license key…" className="font-mono"
                style={{ flex:"1 1 280px", background:"transparent", border:"none", outline:"none",
                         color:"#F4F4F1", fontSize:14, padding:"18px 20px" }} />
              <button onClick={restore} disabled={status === "loading" || !key.trim()}
                className="btn-neon"
                style={{ padding:"0 24px", fontSize:14, borderLeft:"2px solid #F4F4F1" }}>
                {status === "loading" ? "Restoring…" : "Restore →"}
              </button>
            </div>
            {status === "error" && (
              <p className="font-mono" style={{ fontSize:13, color:"var(--n2)", marginTop:12 }}>{message}</p>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
