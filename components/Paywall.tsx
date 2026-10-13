"use client";
import { useState } from "react";
import type { LicenseTier } from "@/lib/types";

// Quotas must match REPORT_LIMITS in lib/license.ts.
const TIERS: { tier: LicenseTier; label: string; price: string; reports: string }[] = [
  { tier: "founder", label: "Founder", price: "$19/mo", reports: "5 reports" },
  { tier: "pro",     label: "Pro",     price: "$49/mo", reports: "20 reports" },
  { tier: "agency",  label: "Agency",  price: "$99/mo", reports: "60 reports" },
];

export default function Paywall() {
  const [loading, setLoading] = useState<LicenseTier | null>(null);
  const [error, setError] = useState("");

  const checkout = async (tier: LicenseTier) => {
    setLoading(tier);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || "Checkout is unavailable right now.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ marginTop:"clamp(32px,4vw,48px)" }}>
      <div style={{ border:"2px solid var(--n2)", padding:"clamp(28px,4vw,48px)", background:"#121214" }}>
        <div className="kicker" style={{ marginBottom:18, color:"var(--n2)" }}>Preview limit reached</div>
        <h2 className="display" style={{ fontSize:"clamp(28px,4vw,52px)" }}>
          Unlock your full<br /><span style={{ color:"var(--n2)" }}>growth playbook.</span>
        </h2>
        <p style={{ fontSize:"clamp(15px,1.6vw,18px)", lineHeight:1.5, color:"#C4C4CC", marginTop:18, maxWidth:560 }}>
          Get all 17 sections, the 7/30/90-day plans, marketing assets, and sales scripts.
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:32 }}>
          {TIERS.map(({ tier, label, price, reports }) => {
            const color = tier === "founder" ? "var(--n1)" : tier === "pro" ? "var(--n2)" : "var(--n3)";
            return (
              <button key={tier} onClick={() => checkout(tier)} disabled={loading !== null}
                className="btn-neon"
                style={{ padding:"14px 24px", fontSize:16,
                         background: color, borderColor: color, color:"#000" }}>
                {loading === tier ? "Redirecting…" : `${label} ${price} · ${reports} →`}
              </button>
            );
          })}
        </div>
        {error && (
          <p className="font-mono" role="alert" style={{ fontSize:12, color:"var(--n2)", marginTop:12 }}>{error}</p>
        )}
        <p style={{ marginTop:16 }}>
          <a href="/pricing" style={{ color:"#C4C4CC", fontSize:13, textDecoration:"underline" }}>
            See annual plans and the full feature comparison →
          </a>
        </p>
      </div>
    </div>
  );
}
