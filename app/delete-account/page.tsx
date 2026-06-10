"use client";
import { useState } from "react";
import Nav, { Footer } from "@/components/Nav";

export default function DeleteAccountPage() {
  const [deleted, setDeleted] = useState(false);

  function handleDelete() {
    if (!window.confirm("Delete all Conciply reports from this browser? This cannot be undone.")) return;
    try {
      // Remove Conciply workspace key
      localStorage.removeItem("conciply_reports");
      // Remove any license cookie
      document.cookie = "conciply_license=; Max-Age=0; path=/";
    } catch {
      // localStorage may be unavailable (private browsing, etc.)
    }
    setDeleted(true);
  }

  return (
    <>
      <Nav />
      <main className="shell" style={{ maxWidth: 720, paddingTop: "clamp(48px,6vw,80px)", paddingBottom: 96 }}>
        <div className="kicker" style={{ marginBottom: 16 }}>Privacy</div>
        <h1 className="display" style={{ fontSize: "clamp(28px,4vw,52px)", marginBottom: 8 }}>
          Delete Your Data
        </h1>
        <p className="font-mono" style={{ fontSize: 12, color: "#7A7A88", marginBottom: 48, letterSpacing: "0.06em" }}>
          Last updated: June 2026
        </p>

        {/* How Conciply stores data */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontSize: 18, fontWeight: 900, letterSpacing: "-0.01em",
            textTransform: "uppercase", color: "#F4F4F1", marginBottom: 16,
          }}>
            How Conciply stores your data
          </h2>
          <p style={{ color: "#C4C4CC", lineHeight: 1.7, marginBottom: 12 }}>
            Conciply has no user accounts. There is no login, no profile, and no server-side
            storage of your business inputs or AI-generated reports. Everything you generate
            is saved only in your{" "}
            <strong style={{ color: "#F4F4F1" }}>browser&apos;s local storage</strong> on
            your device.
          </p>
          <p style={{ color: "#C4C4CC", lineHeight: 1.7 }}>
            If you purchased a plan, your license key is stored in a cookie in your browser.
            Billing details are held by Stripe — visit{" "}
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--n1)", textDecoration: "none" }}>
              stripe.com/privacy
            </a>{" "}
            for Stripe&apos;s data deletion process.
          </p>
        </section>

        {/* Delete button */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontSize: 18, fontWeight: 900, letterSpacing: "-0.01em",
            textTransform: "uppercase", color: "#F4F4F1", marginBottom: 16,
          }}>
            Delete your reports now
          </h2>
          <p style={{ color: "#C4C4CC", lineHeight: 1.7, marginBottom: 24 }}>
            Click the button below to permanently delete all reports stored in this browser.
            This action cannot be undone.
          </p>

          {deleted ? (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 24px",
              border: "2px solid #2A6A2A",
              background: "#0D1F0D",
              color: "var(--n3)",
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              <span>✓</span>
              <span>All data cleared from this browser</span>
            </div>
          ) : (
            <button
              onClick={handleDelete}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                height: 48, padding: "0 28px",
                border: "2px solid var(--n2)",
                background: "transparent",
                color: "var(--n2)",
                fontFamily: "var(--font-archivo), sans-serif",
                fontSize: 12, fontWeight: 800,
                letterSpacing: "0.08em", textTransform: "uppercase",
                cursor: "pointer",
                transition: "background .12s, color .12s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--n2)";
                (e.currentTarget as HTMLButtonElement).style.color = "#000";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--n2)";
              }}
            >
              Delete all my data →
            </button>
          )}

          <p style={{ color: "#7A7A88", fontSize: 13, lineHeight: 1.6, marginTop: 16 }}>
            This only clears data in your <em>current browser</em> on this device. If you used
            Conciply on another device or browser, repeat this step there.
          </p>
        </section>

        {/* Manual instructions */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontSize: 18, fontWeight: 900, letterSpacing: "-0.01em",
            textTransform: "uppercase", color: "#F4F4F1", marginBottom: 16,
          }}>
            Manual browser deletion
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                label: "Chrome / Edge",
                steps: "Settings → Privacy and security → Clear browsing data → Advanced → check \"Site data\" → Clear data",
              },
              {
                label: "Safari (iOS)",
                steps: "Settings → Safari → Clear History and Website Data",
              },
              {
                label: "Safari (macOS)",
                steps: 'Safari → Settings → Privacy → Manage Website Data → search "conciply" → Remove',
              },
              {
                label: "Firefox",
                steps: "Settings → Privacy & Security → Cookies and Site Data → Clear Data",
              },
            ].map(({ label, steps }) => (
              <div key={label} style={{ borderLeft: "3px solid #2A2A2E", paddingLeft: 20 }}>
                <p style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#9A9AA8", marginBottom: 6,
                }}>
                  {label}
                </p>
                <p style={{ color: "#C4C4CC", fontSize: 14, lineHeight: 1.6 }}>
                  {steps}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section style={{ borderTop: "1px solid #1E1E22", paddingTop: 32 }}>
          <h2 style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontSize: 18, fontWeight: 900, letterSpacing: "-0.01em",
            textTransform: "uppercase", color: "#F4F4F1", marginBottom: 12,
          }}>
            Still need help?
          </h2>
          <p style={{ color: "#C4C4CC", lineHeight: 1.7 }}>
            Email us at{" "}
            <a
              href="mailto:hello@conciply.com"
              style={{ color: "var(--n1)", textDecoration: "none" }}
            >
              hello@conciply.com
            </a>{" "}
            with the subject line{" "}
            <strong style={{ color: "#F4F4F1" }}>Data Deletion Request</strong>.
            We will respond within 5 business days and confirm that no identifiable data
            is associated with your request on our end.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
