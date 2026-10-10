"use client";
import Link from "next/link";

// Unchecked-by-default affirmative consent required by California's Automatic
// Renewal Law (Bus. & Prof. Code §17602) before any subscription checkout.
export default function RenewalConsent({
  checked, onChange, text, error,
}: { checked: boolean; onChange: (v: boolean) => void; text: string; error?: boolean }) {
  return (
    <label
      style={{
        display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer",
        border: `2px solid ${error ? "var(--n2)" : "#2A2A2E"}`, background: "#0D0D0F",
        padding: "14px 16px", maxWidth: 760, margin: "0 auto", textAlign: "left",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        aria-describedby="renewal-consent-text"
        style={{ marginTop: 3, width: 18, height: 18, accentColor: "#D4FF2E", flex: "0 0 auto" }}
      />
      <span id="renewal-consent-text" style={{ fontSize: 13, lineHeight: 1.55, color: "#C4C4CC" }}>
        {text}{" "}
        <Link href="/terms" style={{ color: "var(--n1)", textDecoration: "underline" }}>Terms</Link>
        {" · "}
        <Link href="/privacy" style={{ color: "var(--n1)", textDecoration: "underline" }}>Privacy</Link>
      </span>
    </label>
  );
}
