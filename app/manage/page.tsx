"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Nav, { Footer } from "@/components/Nav";
import { getLicenseKey, getLicensePlan } from "@/lib/workspace";
import { LEGAL } from "@/lib/legal";

// Online cancellation in the same channel the customer signed up through
// (California Bus. & Prof. Code §17602(d)). Opens the Stripe Customer Portal.
export default function ManagePage() {
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStoredKey(getLicenseKey());
    setPlan(getLicensePlan());
  }, []);

  const openPortal = async (key: string) => {
    if (!key.trim()) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers: { "x-conciply-license": key.trim() },
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setStatus("error");
      setMessage(data.error || "Could not open the billing portal.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <>
      <Nav />
      <main className="shell" style={{ maxWidth: 620, paddingTop: "clamp(64px,8vw,100px)", paddingBottom: 80 }}>
        <div className="kicker" style={{ marginBottom: 16 }}>Billing</div>
        <h1 className="display" style={{ fontSize: "clamp(32px,5vw,64px)", marginBottom: 16 }}>
          Manage or<br /><span style={{ color: "var(--n1)" }}>cancel.</span>
        </h1>
        <p style={{ color: "#C4C4CC", fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
          Cancel, switch plans, update your card or download invoices. Cancellation takes effect at the end of
          your current billing period, and you keep access until then.
        </p>

        {storedKey ? (
          <div style={{ border: "2px solid #F4F4F1", padding: 24 }}>
            <p className="font-mono" style={{ fontSize: 12, color: "#9A9AA8", letterSpacing: "0.1em", marginBottom: 16 }}>
              ACTIVE ON THIS BROWSER{plan ? ` · ${plan.toUpperCase()} PLAN` : ""}
            </p>
            <button onClick={() => openPortal(storedKey)} disabled={status === "loading"} className="btn-neon"
              style={{ padding: "16px 24px", fontSize: 15, background: "var(--n3)", borderColor: "var(--n3)", color: "#000" }}>
              {status === "loading" ? "Opening…" : "Manage or cancel subscription →"}
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: "#C4C4CC", fontSize: 15, marginBottom: 12 }}>
              Paste the license key you received after checkout.
            </p>
            <div style={{ border: "2px solid #F4F4F1", display: "flex", flexWrap: "wrap" }}>
              <input value={pasted} onChange={e => setPasted(e.target.value)}
                onKeyDown={e => e.key === "Enter" && openPortal(pasted)}
                aria-label="License key" placeholder="Paste your license key…" className="font-mono"
                style={{ flex: "1 1 280px", background: "transparent", border: "none", outline: "none",
                         color: "#F4F4F1", fontSize: 14, padding: "18px 20px" }} />
              <button onClick={() => openPortal(pasted)} disabled={status === "loading" || !pasted.trim()}
                className="btn-neon" style={{ padding: "0 24px", fontSize: 14, borderLeft: "2px solid #F4F4F1" }}>
                {status === "loading" ? "Opening…" : "Manage →"}
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <p className="font-mono" role="alert" style={{ fontSize: 13, color: "var(--n2)", marginTop: 12 }}>{message}</p>
        )}

        <p style={{ color: "#9A9AA8", fontSize: 14, lineHeight: 1.6, marginTop: 32 }}>
          Lost your key? Email <a href={`mailto:${LEGAL.email}?subject=Cancel%20my%20subscription`}
            style={{ color: "var(--n1)", textDecoration: "underline" }}>{LEGAL.email}</a> from the address you paid with
          and we'll cancel it for you within 2 business days.  See <Link href="/terms" style={{ color: "var(--n1)", textDecoration: "underline" }}>Terms</Link> section 4.
        </p>
      </main>
      <Footer />
    </>
  );
}
