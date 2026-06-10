"use client";
import { useState } from "react";
import type { LicenseTier } from "@/lib/types";

interface TierDef {
  tier: LicenseTier | null;
  label: string;
  tagline: string;
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
    tagline: "1 report · 8 of 17 sections · no login",
    monthlyPrice: "$0",
    annualPrice: "$0",
    annualBilled: "$0 / year",
    badge: null,
    features: [
      { text: "1 report per IP",          active: true  },
      { text: "8 of 17 sections",         active: true  },
      { text: "Workspace + regenerate",   active: false },
      { text: "Copy & Print / PDF",       active: false },
      { text: "Asset generators",         active: false },
      { text: "Client use",               active: false },
    ],
    cta: "Start free",
    href: "/#analyze",
    accent: "var(--n3)",
    highlight: false,
  },
  {
    tier: "founder",
    label: "Founder",
    tagline: "For solo founders & indie hackers",
    monthlyPrice: "$19",
    annualPrice: "$16",
    annualBilled: "$190 / year",
    badge: null,
    features: [
      { text: "5 reports / month",        active: true  },
      { text: "All 17 sections",          active: true  },
      { text: "Workspace + regenerate",   active: true  },
      { text: "Copy & Print / PDF",       active: true  },
      { text: "Asset generators",         active: false },
      { text: "Client use",               active: false },
    ],
    cta: "Get Founder",
    accent: "var(--n3)",
    highlight: false,
  },
  {
    tier: "pro",
    label: "Pro",
    tagline: "For active builders & content creators",
    monthlyPrice: "$49",
    annualPrice: "$39",
    annualBilled: "$468 / year",
    badge: "Most popular",
    features: [
      { text: "20 reports / month",       active: true  },
      { text: "All 17 sections",          active: true  },
      { text: "Workspace + regenerate",   active: true  },
      { text: "Copy & Print / PDF",       active: true  },
      { text: "Asset generators",         active: true  },
      { text: "Client use",               active: false },
    ],
    cta: "Get Pro",
    accent: "var(--n1)",
    highlight: true,
  },
  {
    tier: "agency",
    label: "Agency",
    tagline: "For consultants & client work",
    monthlyPrice: "$99",
    annualPrice: "$79",
    annualBilled: "$948 / year",
    badge: null,
    features: [
      { text: "60 reports / month",       active: true  },
      { text: "All 17 sections",          active: true  },
      { text: "Workspace + regenerate",   active: true  },
      { text: "Copy & Print / PDF",       active: true  },
      { text: "Asset generators",         active: true  },
      { text: "Client use",               active: true  },
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
            className="font-mono billing-toggle-btn"
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
            className="font-mono billing-toggle-btn"
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
            <span
              className="billing-toggle-badge"
              style={{
                background: annual ? "#000" : "#2A2A2E",
                color: annual ? "var(--n3)" : "#5C5C63",
                transition: "background .15s, color .15s",
              }}
            >
              2 MONTHS FREE
            </span>
          </button>
        </div>
      </div>

      {/* ── Plan cards ── */}
      <div className="pricing-grid">
        {TIERS.map(({ tier, label, tagline, monthlyPrice, annualPrice, annualBilled, badge, features, cta, href, accent, highlight }, idx) => {
          const price   = annual ? annualPrice   : monthlyPrice;
          const subLine = annual ? annualBilled  : "per month";
          const loadKey = tier ? `${tier}${annual ? "_annual" : ""}` : null;

          // ── Shared typographic constants (locked scale) ──────────────────
          // All zones are fixed height so every horizontal band aligns
          // perfectly across the 4 columns regardless of content variance.
          //
          // Scale: 8 · 10 · 11 · 13 · 48 (display)
          // Families: mono = labels | display = prices | grotesk = body | archivo = CTAs

          return (
            <div
              key={label}
              style={{
                background: "#0A0A0B",
                padding: "22px 18px 20px",
                borderRight: idx < TIERS.length - 1 ? "2px solid #F4F4F1" : "none",
                borderTop: `3px solid ${highlight ? accent : "transparent"}`,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* ── Zone 1: Tier name — fixed 20px ──────────────────────── */}
              {/* Badge sits on this row. Non-badged cards get an invisible
                  spacer so the zone height is identical across all cards.   */}
              <div style={{
                height: 20, display: "flex", alignItems: "center",
                gap: 8, marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 9, fontWeight: 700,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: highlight ? accent : "#9A9AA8",
                  lineHeight: 1,
                }}>
                  {label}
                </span>
                {/* Badge always rendered — invisible when absent */}
                <span style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 8, fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#000", background: badge ? accent : "transparent",
                  padding: badge ? "2px 6px" : "2px 0",
                  lineHeight: 1, visibility: badge ? "visible" : "hidden",
                }}>
                  {badge ?? "placeholder"}
                </span>
              </div>

              {/* ── Zone 2: Tagline — fixed 28px (max 2 lines) ──────────── */}
              <div style={{
                height: 28, display: "flex", alignItems: "flex-start",
                overflow: "hidden", marginBottom: 16,
              }}>
                <p style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 10, color: "#7A7A8A",
                  letterSpacing: "0.06em", margin: 0, lineHeight: 1.4,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}>
                  {tagline}
                </p>
              </div>

              {/* ── Zone 3: Price number — fixed 52px ────────────────────── */}
              {/* display class has line-height 0.92 — we override to 1 here
                  and use alignItems flex-end so /mo sits on the cap-height.  */}
              <div style={{
                height: 44, display: "flex",
                alignItems: "flex-end", gap: 4, marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontSize: 40, fontWeight: 900,
                  letterSpacing: "-0.03em", lineHeight: 1,
                  color: accent,
                }}>
                  {price}
                </span>
                {tier && (
                  <span style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 10, color: "#6A6A7A",
                    letterSpacing: "0.06em", lineHeight: 1,
                    paddingBottom: 4,          // sits at cap-height of the price
                  }}>
                    /mo
                  </span>
                )}
              </div>

              {/* ── Zone 4: Billing sub-label — fixed 24px ───────────────── */}
              <div style={{
                height: 20, display: "flex", alignItems: "center",
                marginBottom: 16,
              }}>
                <span style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
                  color: annual && tier ? "var(--n3)" : "#6A6A7A",
                  lineHeight: 1,
                }}>
                  {subLine}
                </span>
              </div>

              {/* ── Divider — always at same Y position ──────────────────── */}
              <div style={{ height: 1, background: "#1E1E22", marginBottom: 16 }} />

              {/* ── Zone 5: Feature list — flex 1, rows fixed at 40px ────── */}
              {/* Fixed row height ensures features align across columns even
                  if one card has an extra feature row.                       */}
              <ul style={{
                listStyle: "none", margin: 0, padding: 0,
                flex: 1, marginBottom: 20,
                display: "flex", flexDirection: "column",
              }}>
                {features.map((f, i) => (
                  <li
                    key={i}
                    style={{
                      height: 36, display: "flex",
                      alignItems: "center", gap: 10,
                      borderBottom: i < features.length - 1 ? "1px solid #1A1A1E" : "none",
                      flexShrink: 0,
                    }}
                  >
                    {/* Checkmark — mono, fixed 14px wide, vertically centered */}
                    <span style={{
                      flexShrink: 0, width: 14, textAlign: "center",
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: 11, lineHeight: 1,
                      color: f.active ? accent : "#555562",
                    }}>
                      {f.active ? "✓" : "—"}
                    </span>
                    {/* Feature text — grotesk, consistent size/weight */}
                    <span style={{
                      fontFamily: "var(--font-grotesk), sans-serif",
                      fontSize: 12, lineHeight: 1, fontWeight: f.active ? 500 : 400,
                      color: f.active ? "#E8E8F0" : "#7A7A8A",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* ── Zone 6: CTA — fixed 44px, identical font across all ─── */}
              {/* Both free (anchor) and paid (button) use the same font,
                  size, weight and height. Only color + border differ.        */}
              {href ? (
                <a
                  href={href}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    height: 44, border: "2px solid #4A4A54",
                    color: "#9A9AA8",
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontSize: 11, fontWeight: 800,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    textDecoration: "none",
                    transition: "border-color .12s, color .12s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "#F4F4F1";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#F4F4F1";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "#4A4A54";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#9A9AA8";
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
                    height: 44, width: "100%",
                    border: `2px solid ${accent}`,
                    background: highlight ? accent : "transparent",
                    color: highlight ? "#000" : accent,
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontSize: 11, fontWeight: 800,
                    letterSpacing: "0.08em", textTransform: "uppercase",
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
          fontSize: 12, color: "#7A7A88", letterSpacing: "0.03em",
          textAlign: "center", margin: "16px 0 0", lineHeight: 1.6,
        }}
      >
        {annual
          ? "Annual plans are billed as a single yearly charge. Renews automatically. Cancel before your renewal date to stop — no refunds for the current year."
          : "Monthly plans renew automatically. Cancel any time — you keep full access until the end of the period you already paid for. No partial refunds."}
      </p>
    </div>
  );
}
