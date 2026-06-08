"use client";
import { useState } from "react";
import type { LicenseTier } from "@/lib/types";

interface TierDef {
  tier: LicenseTier | null;
  label: string;
  monthlyPrice: string;
  annualPrice: string;      // per-month displayed price when billed annually
  annualBilled: string;     // total billed per year
  badge: string | null;
  features: { text: string; active: boolean }[];
  cta: string;
  href?: string;
  accent: string;
  highlight: boolean;
}

const TIERS: TierDef[] = [
  {
    tier: null,
    label: "Free",
    monthlyPrice: "$0",
    annualPrice: "$0",
    annualBilled: "$0 / year",
    badge: null,
    features: [
      { text: "1 report per IP",          active: true  },
      { text: "8 of 17 sections free",    active: true  },
      { text: "Analysis + insights",      active: true  },
      { text: "Growth opportunities",     active: true  },
      { text: "All 17 sections",          active: false },
      { text: "Workspace",                active: false },
      { text: "Asset generators",         active: false },
    ],
    cta: "Start free",
    href: "/",
    accent: "var(--n3)",
    highlight: false,
  },
  {
    tier: "founder",
    label: "Founder",
    monthlyPrice: "$19",
    annualPrice: "$16",
    annualBilled: "$190 / year",
    badge: null,
    features: [
      { text: "5 reports",               active: true  },
      { text: "All 17 sections",         active: true  },
      { text: "Workspace + regenerate",  active: true  },
      { text: "Copy & Print / PDF",      active: true  },
      { text: "Asset generators",        active: false },
      { text: "Client use",              active: false },
    ],
    cta: "Get Founder",
    accent: "var(--n3)",
    highlight: false,
  },
  {
    tier: "pro",
    label: "Pro",
    monthlyPrice: "$49",
    annualPrice: "$39",
    annualBilled: "$468 / year",
    badge: "Most popular",
    features: [
      { text: "20 reports",              active: true  },
      { text: "All 17 sections",         active: true  },
      { text: "Workspace + regenerate",  active: true  },
      { text: "Asset generators",        active: true  },
      { text: "Copy & Print / PDF",      active: true  },
      { text: "Client use",              active: false },
    ],
    cta: "Get Pro",
    accent: "var(--n1)",
    highlight: true,
  },
  {
    tier: "agency",
    label: "Agency",
    monthlyPrice: "$99",
    annualPrice: "$79",
    annualBilled: "$948 / year",
    badge: null,
    features: [
      { text: "500 reports / month",      active: true  },
      { text: "All 17 sections",         active: true  },
      { text: "Workspace + regenerate",  active: true  },
      { text: "Asset generators",        active: true  },
      { text: "Copy & Print / PDF",      active: true  },
      { text: "Client use",              active: true  },
    ],
    cta: "Get Agency",
    accent: "var(--n2)",
    highlight: false,
  },
];

export default function PricingTable() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const checkout = async (tier: LicenseTier) => {
    const key = `${tier}${annual ? "_annual" : ""}`;
    setLoading(key);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, annual }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      {/* ── Billing toggle ── */}
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 14, marginBottom: 48,
      }}>
        {/* Segmented control */}
        <div style={{
          display: "inline-flex",
          border: "2px solid #3C3C42",
          background: "#0A0A0B",
        }}>
          <button
            onClick={() => setAnnual(false)}
            className="font-mono"
            style={{
              padding: "12px 32px",
              fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase",
              fontWeight: 700, border: "none", cursor: "pointer",
              background: !annual ? "#F4F4F1" : "transparent",
              color: !annual ? "#000" : "#5C5C63",
              transition: "background .15s, color .15s",
            }}
          >
            Monthly
          </button>
          <div style={{ width: 2, background: "#3C3C42", flexShrink: 0 }} />
          <button
            onClick={() => setAnnual(true)}
            className="font-mono"
            style={{
              padding: "12px 32px",
              fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase",
              fontWeight: 700, border: "none", cursor: "pointer",
              background: annual ? "var(--n3)" : "transparent",
              color: annual ? "#000" : "#5C5C63",
              transition: "background .15s, color .15s",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            Annual
            <span style={{
              fontSize: 9, letterSpacing: "0.1em", fontWeight: 800,
              background: annual ? "#000" : "#2A2A2E",
              color: annual ? "var(--n3)" : "#5C5C63",
              padding: "2px 6px",
              transition: "background .15s, color .15s",
            }}>
              2 MONTHS FREE
            </span>
          </button>
        </div>
      </div>

      {/* ── Plan cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 0,
        border: "2px solid #F4F4F1",
      }}>
        {TIERS.map(({ tier, label, monthlyPrice, annualPrice, annualBilled, badge, features, cta, href, accent, highlight }) => {
          const price   = annual ? annualPrice   : monthlyPrice;
          const subLine = annual ? annualBilled  : "Per month";
          const loadKey = tier ? `${tier}${annual ? "_annual" : ""}` : null;

          return (
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
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                        textTransform: "uppercase", color: "#000",
                        background: accent, padding: "3px 7px", lineHeight: 1,
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <div
                    className="display"
                    style={{ fontSize: 56, color: accent, lineHeight: 1, marginBottom: 4 }}
                  >
                    {price}
                  </div>
                  {tier && (
                    <span
                      className="font-mono"
                      style={{ fontSize: 11, color: "#5C5C63", letterSpacing: "0.06em" }}
                    >
                      /mo
                    </span>
                  )}
                </div>

                {/* Sub-label */}
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: annual && tier ? "var(--n3)" : "#8A8A9A",
                  }}
                >
                  {subLine}
                </div>

                {/* Billing notice */}
                {tier && (
                  <div
                    className="font-mono"
                    style={{ fontSize: 10, color: "#4A4A55", marginTop: 6, letterSpacing: "0.04em" }}
                  >
                    {annual
                      ? "Billed once per year. Renews annually."
                      : "Billed monthly. Cancel anytime."}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "#1E1E22", marginBottom: 24 }} />

              {/* Feature list */}
              <ul style={{ listStyle: "none", margin: 0, padding: 0, flex: 1, marginBottom: 32 }}>
                {features.map((f, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex", alignItems: "baseline", gap: 10,
                      padding: "6px 0",
                      borderBottom: i < features.length - 1 ? "1px solid #111" : "none",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0, width: 14, fontSize: 11, fontWeight: 700,
                        color: f.active ? accent : "#555560",
                        fontFamily: "var(--font-mono), monospace", letterSpacing: 0,
                      }}
                    >
                      {f.active ? "✓" : "—"}
                    </span>
                    <span
                      style={{
                        fontSize: 13, lineHeight: 1.5,
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
                    display: "flex", alignItems: "center", justifyContent: "center",
                    height: 48, border: "2px solid #3C3C42",
                    color: "#D0D0D8",
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", textDecoration: "none",
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
                    display: "flex", alignItems: "center", justifyContent: "center",
                    height: 48, width: "100%",
                    border: `2px solid ${accent}`,
                    background: highlight ? accent : "transparent",
                    color: highlight ? "#000" : accent,
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontSize: 13, fontWeight: 800, letterSpacing: "0.04em",
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
                  {loading === loadKey ? "Redirecting…" : `${cta} →`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Billing footnote */}
      <p
        className="font-mono"
        style={{
          fontSize: 11, color: "#4A4A55", letterSpacing: "0.04em",
          textAlign: "center", margin: "16px 0 0",
        }}
      >
        {annual
          ? "Annual plans are billed as a yearly subscription. Your card will be charged the full annual amount today and renews automatically each year. Cancel anytime before renewal."
          : "Monthly plans are recurring subscriptions charged each month. Cancel anytime — no lock-in."}
      </p>
      <p
        className="font-mono"
        style={{
          fontSize: 11, color: "#4A4A55", letterSpacing: "0.04em",
          textAlign: "center", margin: "8px 0 0",
        }}
      >
        Each report generation and section regeneration counts as 1 report toward your quota.
      </p>
    </div>
  );
}
