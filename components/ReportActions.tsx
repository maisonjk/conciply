"use client";
import { useState, useRef } from "react";
import type { GrowthReport, SectionKey } from "@/lib/types";
import { SECTION_LABELS, FREE_SECTIONS } from "@/lib/types";

interface Props {
  report: Partial<GrowthReport>;
  input: string;
  tier: string | null;
  compact?: boolean; // bottom bar is more compact
}

export default function ReportActions({ report, input, tier, compact }: Props) {
  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Print / PDF ──────────────────────────────────────────────────────────
  const triggerPrint = (forDownload = false) => {
    const prev = document.title;
    if (forDownload) {
      document.title = `Conciply Growth Report — ${input.slice(0, 60).replace(/[^\w\s-]/g, "")}`;
    }
    window.print();
    if (forDownload) setTimeout(() => { document.title = prev; }, 2000);
  };

  // ── Email ────────────────────────────────────────────────────────────────
  const openModal = () => {
    setEmailStatus("idle");
    setErrorMsg("");
    setModal(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const sendEmail = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setEmailStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, report, input, tier, optIn }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailStatus("sent");
      } else {
        setErrorMsg(data.error ?? "Failed to send. Please try again.");
        setEmailStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setEmailStatus("error");
    }
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

        {/* Email */}
        <button style={ghost}
          onClick={openModal}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--n1)"; e.currentTarget.style.color = "var(--n1)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#3C3C42"; e.currentTarget.style.color = "#F4F4F1"; }}
        >
          ✉ Email Me This
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

      {/* ── Email modal ──────────────────────────────────────────────────── */}
      {modal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setModal(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.82)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}
        >
          <div style={{
            background: "#111113", border: "2px solid #F4F4F1",
            padding: "clamp(24px,3vw,40px)", maxWidth: 440, width: "100%",
          }}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <p className="font-mono" style={{ fontSize: 9, color: "var(--n1)", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 8px" }}>
                  Email report
                </p>
                <h3 className="display" style={{ fontSize: "clamp(18px,2.5vw,26px)", margin: 0, lineHeight: 1.05 }}>
                  Send to your inbox
                </h3>
              </div>
              <button onClick={() => setModal(false)} style={{
                background: "transparent", border: "none", color: "#5C5C63",
                fontSize: 18, cursor: "pointer", padding: "0 0 0 16px", lineHeight: 1,
              }}>✕</button>
            </div>

            {emailStatus === "sent" ? (
              // ── Success state ──
              <div style={{ padding: "24px 0", textAlign: "center" }}>
                <div className="display" style={{ fontSize: 32, color: "var(--n3)", marginBottom: 12 }}>✓</div>
                <p style={{ color: "#C4C4CC", fontFamily: "var(--font-grotesk), sans-serif", fontSize: 15, lineHeight: 1.6, margin: "0 0 8px" }}>
                  Report sent to <strong style={{ color: "#F4F4F1" }}>{email}</strong>
                </p>
                <p className="font-mono" style={{ fontSize: 9, color: "#3C3C42", letterSpacing: "0.08em" }}>
                  Check your spam folder if it doesn&apos;t arrive within 2 minutes.
                </p>
                <button onClick={() => setModal(false)} className="btn-ghost" style={{ marginTop: 20, padding: "10px 24px", fontSize: 11 }}>
                  Close
                </button>
              </div>
            ) : (
              // ── Input state ──
              <>
                <div style={{ marginBottom: 20 }}>
                  <label className="font-mono" style={{ fontSize: 10, color: "#7A7A88", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                    Your email address
                  </label>
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrorMsg(""); }}
                    onKeyDown={e => { if (e.key === "Enter") sendEmail(); }}
                    placeholder="you@example.com"
                    style={{
                      width: "100%", background: "#0A0A0B",
                      border: `2px solid ${errorMsg ? "var(--n2)" : "#2A2A2E"}`,
                      color: "#F4F4F1", fontFamily: "var(--font-grotesk), sans-serif",
                      fontSize: 15, padding: "12px 14px", outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = "var(--n1)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = errorMsg ? "var(--n2)" : "#2A2A2E"; }}
                  />
                  {errorMsg && (
                    <p className="font-mono" style={{ fontSize: 10, color: "var(--n2)", marginTop: 6, letterSpacing: "0.04em" }}>
                      {errorMsg}
                    </p>
                  )}
                </div>

                {/* Opt-in checkbox */}
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 24 }}>
                  <input
                    type="checkbox"
                    checked={optIn}
                    onChange={e => setOptIn(e.target.checked)}
                    style={{ marginTop: 3, flexShrink: 0, accentColor: "var(--n3)", width: 14, height: 14 }}
                  />
                  <span className="font-mono" style={{ fontSize: 9, color: "#5C5C63", letterSpacing: "0.06em", lineHeight: 1.6 }}>
                    I&apos;d like to receive occasional tips on growth strategy and product updates from Conciply. Unsubscribe any time.
                  </span>
                </label>

                {/* Privacy note */}
                <p className="font-mono" style={{ fontSize: 9, color: "#2A2A2E", letterSpacing: "0.06em", lineHeight: 1.6, marginBottom: 20 }}>
                  Your email is used only to deliver this report. We don&apos;t store it unless you opt in above.
                </p>

                {/* Send button */}
                <button
                  onClick={sendEmail}
                  disabled={emailStatus === "sending"}
                  style={{
                    width: "100%", background: "var(--n1)", border: "2px solid var(--n1)",
                    color: "#000", fontFamily: "var(--font-archivo), sans-serif",
                    fontWeight: 800, fontSize: 13, letterSpacing: "0.04em",
                    textTransform: "uppercase", padding: "13px 0",
                    cursor: emailStatus === "sending" ? "not-allowed" : "pointer",
                    opacity: emailStatus === "sending" ? 0.6 : 1,
                    transition: "filter .12s",
                  }}
                >
                  {emailStatus === "sending" ? "Sending…" : "Send Report →"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
