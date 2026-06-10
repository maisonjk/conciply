"use client";
import { FREE_SECTIONS } from "@/lib/types";

interface Props {
  input: string;
  tier: string | null;
  compact?: boolean; // bottom bar is more compact
}

export default function ReportActions({ input, tier, compact }: Props) {

  // ── Print / PDF ──────────────────────────────────────────────────────────
  const triggerPrint = (forDownload = false) => {
    const prev = document.title;
    if (forDownload) {
      document.title = `Conciply Growth Report — ${input.slice(0, 60).replace(/[^\w\s-]/g, "")}`;
    }
    window.print();
    if (forDownload) setTimeout(() => { document.title = prev; }, 2000);
  };

  // ── Shared button styles ─────────────────────────────────────────────────
  const neon: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "var(--n2)", border: "2px solid var(--n2)",
    color: "#000", fontFamily: "var(--font-archivo), sans-serif",
    fontWeight: 800, fontSize: compact ? 11 : 12,
    letterSpacing: "0.04em", textTransform: "uppercase",
    padding: compact ? "8px 16px" : "10px 20px",
    cursor: "pointer", transition: "filter .12s, transform .12s, box-shadow .12s",
    flexShrink: 0,
  };
  const ghost: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "transparent", border: "2px solid #3C3C42",
    color: "#F4F4F1", fontFamily: "var(--font-mono), monospace",
    fontSize: compact ? 10 : 11, letterSpacing: "0.1em", textTransform: "uppercase",
    padding: compact ? "8px 14px" : "10px 18px",
    cursor: "pointer", transition: "border-color .12s, color .12s",
    flexShrink: 0,
  };

  const sectionCount = tier ? 17 : FREE_SECTIONS.length;

  return (
    <>
      {/* ── Action bar ──────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: compact ? "14px 24px" : "20px 0",
        borderTop: compact ? "1px solid #1E1E22" : "none",
      }}>

        {/* Download PDF */}
        <button style={neon}
          onClick={() => triggerPrint(true)}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.filter = "brightness(1.08)";
            el.style.transform = "translate(-2px,-2px)";
            el.style.boxShadow = "4px 4px 0 #F4F4F1";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.filter = "";
            el.style.transform = "";
            el.style.boxShadow = "";
          }}
        >
          ↓ Download PDF
        </button>

        {/* Print */}
        <button style={ghost}
          onClick={() => triggerPrint(false)}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#F4F4F1"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#3C3C42"; }}
        >
          ⎙ Print Report
        </button>

        {/* Privacy note */}
        <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
          <span className="font-mono" style={{ fontSize: 9, color: "#3C3C42", letterSpacing: "0.08em" }}>
            {sectionCount} sections · generated privately
          </span>
          <span className="font-mono" style={{ fontSize: 9, color: "#2A2A2E", letterSpacing: "0.06em" }}>
            We don&apos;t store your business data or reports
          </span>
        </div>
      </div>

      {/* ── Privacy trust block (shown only in top position) ──────────────── */}
      {!compact && (
        <div style={{
          padding: "12px 16px", marginBottom: 0,
          background: "#0D0D0F", borderLeft: "2px solid #1E1E22",
          display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p className="font-mono" style={{ fontSize: 10, color: "#4A4A55", letterSpacing: "0.06em", lineHeight: 1.6, margin: 0 }}>
              <span style={{ color: "var(--n3)" }}>Your strategy report is generated privately.</span>{" "}
              We don&apos;t store your business data, AI responses, or competitive analysis.
              All report content exists only in your browser.
            </p>
          </div>
          <p className="font-mono" style={{
            fontSize: 9, color: "#2A2A2E", letterSpacing: "0.06em", lineHeight: 1.6,
            margin: 0, maxWidth: 300,
          }}>
            Built for founders, agencies, consultants, and businesses that value privacy and confidentiality.
          </p>
        </div>
      )}

    </>
  );
}
