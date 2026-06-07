"use client";
import { useState } from "react";
import type { LicenseTier } from "@/lib/types";

const TIERS = [
  {
    tier: null,
    label: "Free",
    price: "$0",
    sub: "No credit card",
    badge: null,
    features: [
      { text: "1 report per IP",      active: true },
      { text: "Executive Summary",     active: true },
      { text: "Top 10 ROI Actions",    active: true },
      { text: "All 16 sections",       active: false },
      { text: "Workspace",             active: false },
      { text: "Asset generators",      active: false },
    ],
    cta: "Start free",
    href: "/",
    accent: "var(--n3)",
    highlight: false,
  },
  {
    tier: "founder" as LicenseTier,
    label: "Founder",
    price: "$19",
    sub: "One-time payment",
    badge: null,
    features: [
      { text: "5 reports",             active: true },
      { text: "All 16 sections",       active: true },
      { text: "Workspace (edit + regen)", active: true },
      { text: "Asset generators",      active: false },
      { text: "JSON export",           active: false },
      { text: "Client use",            active: false },
    ],
    cta: "Get Founder",
    accent: "var(--n3)",
    highlight: false,
  },
  {
    tier: "pro" as LicenseTier,
    label: "Pro",
    price: "$49",
    sub: "One-time payment",
    badge: "Most popular",
    features: [
      { text: "20 reports",            active: true },
      { text: "All 16 sections",       active: true },
      { text: "Workspace",             active: true },
      { text: "Asset generators",      active: true },
      { text: "JSON export",           active: false },
      { text: "Client use",            active: false },
    ],
    cta: "Get Pro",
    accent: "var(--n1)",
    highlight: true,
  },
  {
    tier: "agency" as LicenseTier,
    label: "Agency",
    price: "$99",
    sub: "One-time payment",
    badge: null,
    features: [
      { text: "Unlimited reports",     active: true },
      { text: "All 16 sections",       active: true },
      { text: "Workspace",             active: true },
      { text: "Asset generators",      active: true },
      { text: "JSON export",           active: true },
      { text: "Client use",            active: true },
    ],
    cta: "Get Agency",
    accent: "var(--n2)",
    highlight: false,
  },
];

export default function PricingTable() {
  const [loading, setLoading] = useState<LicenseTier | null>(null);

  const checkout = async (tier: LicenseTier) => {
    setLoading(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 0,
      border: "2px solid #F4F4F1",
    }}>
      {TIERS.map(({ tier, label, price, sub, badge, features, cta, href, accent, highlight }) => (
        <div
          key={label}
          style={{
            background: "#0A0A0B",
            padding: "32px 28px",
            borderRight: "2px solid #F4F4F1",
            borderTop: `4px solid ${highlight ? accent : "transparent"}`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Tier header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span
                className="kicker"
                style={{ color: highlight ? accent : "#D0D0D8", fontSize: 11 }}
              >
                {label.toUpperCase()}
              </span>
              {badge && (
                <span
                  className="font-mono"
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#000",
                    background: accent,
                    padding: "3px 7px",
                    lineHeight: 1,
                  }}
                >
                  {badge}
                </span>
              )}
            </div>

            {/* Price */}
            <div
              className="display"
              style={{ fontSize: 56, color: accent, lineHeight: 1, marginBottom: 8 }}
            >
              {price}
            </div>

            {/* Sub-label */}
            <div
              className="font-mono"
              style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A8A9A" }}
            >
              {sub}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#1E1E22", marginBottom: 24 }} />

          {/* Feature list */}
          <ul style={{ listStyle: "none", margin: 0, padding: 0, flex: 1, marginBottom: 32 }}>
            {features.map((f, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  padding: "6px 0",
                  borderBottom: i < features.length - 1 ? "1px solid #111" : "none",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 14,
                    fontSize: 11,
                    fontWeight: 700,
                    color: f.active ? accent : "#555560",
                    fontFamily: "var(--font-mono), monospace",
                    letterSpacing: 0,
                  }}
                >
                  {f.active ? "✓" : "—"}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: f.active ? "#EBEBEB" : "#7A7A88",
                    fontFamily: "var(--font-grotesk), sans-serif",
                  }}
                >
                  {f.text}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {href ? (
            <a
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 48,
                border: "2px solid #3C3C42",
                color: "#D0D0D8",
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "border-color .12s, color .12s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#F4F4F1";
                (e.currentTarget as HTMLAnchorElement).style.color = "#F4F4F1";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#3C3C42";
                (e.currentTarget as HTMLAnchorElement).style.color = "#C4C4CC";
              }}
            >
              {cta}
            </a>
          ) : (
            <button
              onClick={() => checkout(tier!)}
              disabled={loading !== null}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 48,
                width: "100%",
                border: `2px solid ${accent}`,
                background: highlight ? accent : "transparent",
                color: highlight ? "#000" : accent,
                fontFamily: "var(--font-archivo), sans-serif",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                cursor: loading !== null ? "not-allowed" : "pointer",
                opacity: loading !== null ? 0.5 : 1,
                transition: "background .12s, color .12s, box-shadow .12s, transform .12s",
              }}
              onMouseEnter={e => {
                if (loading !== null) return;
                const el = e.currentTarget;
                if (highlight) {
                  el.style.boxShadow = "4px 4px 0 #F4F4F1";
                  el.style.transform = "translate(-2px,-2px)";
                } else {
                  el.style.background = accent;
                  el.style.color = "#000";
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.boxShadow = "none";
                el.style.transform = "none";
                if (!highlight) {
                  el.style.background = "transparent";
                  el.style.color = accent;
                }
              }}
            >
              {loading === tier ? "Redirecting…" : `${cta} →`}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
