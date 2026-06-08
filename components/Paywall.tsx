"use client";
import { useState } from "react";
import type { LicenseTier } from "@/lib/types";

const TIERS: { tier: LicenseTier; label: string; price: string; reports: string }[] = [
  { tier: "founder", label: "Founder", price: "$19", reports: "5 reports" },
  { tier: "pro",     label: "Pro",     price: "$49", reports: "20 reports" },
  { tier: "agency",  label: "Agency",  price: "$99", reports: "500/mo" },
];

export default function Paywall() {
  const [loading, setLoading] = useState<LicenseTier | null>(null);

  const checkout = async (tier: LicenseTier) => {
    setLoading(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ marginTop:"clamp(32px,4vw,48px)" }}>
      <div style={{ border:"2px solid var(--n2)", padding:"clamp(28px,4vw,48px)", background:"#121214" }}>
        <div className="kicker" style={{ marginBottom:18, color:"var(--n2)" }}>Free limit reached</div>
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
        <p style={{ marginTop:16 }}>
          <a href="/pricing" style={{ color:"#C4C4CC", fontSize:13, textDecoration:"underline" }}>
            See full feature comparison →
          </a>
        </p>
      </div>
    </div>
  );
}
