"use client";
import { useState } from "react";
import type { LicenseTier } from "@/lib/types";

const TIERS = [
  {
    tier: null,
    label: "Free",
    price: "$0",
    sub: "No credit card",
    features: ["1 report per IP","Executive Summary","Top 10 ROI Actions","—","—","—"],
    cta: "Start free", href: "/",
    highlight: false,
  },
  {
    tier: "founder" as LicenseTier,
    label: "Founder",
    price: "$19",
    sub: "One-time",
    features: ["5 reports","All 16 sections","Workspace (edit + regen)","—","—","—"],
    cta: "Get Founder →",
    highlight: false,
  },
  {
    tier: "pro" as LicenseTier,
    label: "Pro",
    price: "$49",
    sub: "One-time",
    features: ["20 reports","All 16 sections","Workspace","Asset generators","—","—"],
    cta: "Get Pro →",
    highlight: true,
  },
  {
    tier: "agency" as LicenseTier,
    label: "Agency",
    price: "$99",
    sub: "One-time",
    features: ["Unlimited reports","All 16 sections","Workspace","Asset generators","JSON export","Client use"],
    cta: "Get Agency →",
    highlight: false,
  },
];

export default function PricingTable() {
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
    } finally { setLoading(null); }
  };

  return (
    <div className="cardgrid" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
      {TIERS.map(({ tier, label, price, sub, features, cta, href, highlight }) => (
        <div key={label} style={{ background:"#0A0A0B", padding:"clamp(24px,3vw,40px)",
                                   gridColumn:"span 1",
                                   borderTop: highlight ? "4px solid var(--n1)" : "4px solid transparent" }}>
          <div className="kicker" style={{ marginBottom:12,
                                           color: highlight ? "var(--n1)" : "#C4C4CC" }}>
            {label} {highlight && "★ Most popular"}
          </div>
          <div className="display" style={{ fontSize:48, color:"var(--n3)", marginBottom:4 }}>{price}</div>
          <div className="kicker" style={{ marginBottom:24, color:"#9A9AA8" }}>{sub}</div>
          <ul style={{ listStyle:"none", margin:"0 0 32px", padding:0 }}>
            {features.map((f, i) => (
              <li key={i} style={{ fontSize:14, color: f === "—" ? "#3C3C42" : "#C4C4CC",
                                   lineHeight:1.8, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color: f === "—" ? "#3C3C42" : "var(--n3)", fontSize:11 }}>
                  {f === "—" ? "—" : "✓"}
                </span>
                {f}
              </li>
            ))}
          </ul>
          {href ? (
            <a href={href} className="btn-neon" style={{ display:"block", textAlign:"center",
                                                          padding:"14px 20px", fontSize:14 }}>
              {cta}
            </a>
          ) : (
            <button onClick={() => checkout(tier!)} disabled={loading !== null} className="btn-neon"
              style={{ width:"100%", padding:"14px 20px", fontSize:14,
                       background: highlight ? "var(--n1)" : "var(--n3)",
                       borderColor: highlight ? "var(--n1)" : "var(--n3)" }}>
              {loading === tier ? "Redirecting…" : cta}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
