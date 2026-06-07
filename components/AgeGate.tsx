"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "conciply_age_confirmed";

export default function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const confirmed = localStorage.getItem(STORAGE_KEY);
    if (!confirmed) setShow(true);
  }, []);

  const confirm = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  const decline = () => {
    window.location.href = "https://www.google.com";
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#0A0A0B",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        border: "2px solid #F4F4F1",
        background: "#0A0A0B",
        maxWidth: 480,
        width: "100%",
        padding: "48px 40px",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <span style={{ display: "flex", gap: 3 }}>
            <span style={{ width: 9, height: 18, background: "var(--n1)", display: "inline-block" }} />
            <span style={{ width: 9, height: 18, background: "var(--n2)", display: "inline-block" }} />
            <span style={{ width: 9, height: 18, background: "var(--n3)", display: "inline-block" }} />
          </span>
          <span className="display" style={{ fontSize: 20 }}>Conciply</span>
        </div>

        <div className="kicker" style={{ color: "var(--n1)", marginBottom: 12 }}>
          Age Verification
        </div>

        <h2 className="display" style={{ fontSize: "clamp(24px,4vw,36px)", marginBottom: 16, marginTop: 0 }}>
          You must be 18 or older to use this service.
        </h2>

        <p style={{ fontSize: 14, color: "#9A9AA8", lineHeight: 1.65, marginBottom: 36 }}>
          Conciply is a professional business strategy tool intended for adults only.
          By continuing, you confirm that you are at least 18 years of age and agree
          to our{" "}
          <a href="/terms" target="_blank"
            style={{ color: "var(--n1)", textDecoration: "underline", textUnderlineOffset: 3 }}>
            Terms of Use
          </a>{" "}
          and{" "}
          <a href="/privacy" target="_blank"
            style={{ color: "var(--n1)", textDecoration: "underline", textUnderlineOffset: 3 }}>
            Privacy Policy
          </a>.
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={confirm}
            className="btn-neon"
            style={{ flex: 1, padding: "14px 0", fontSize: 13, fontWeight: 700 }}
          >
            I am 18 or older — Continue →
          </button>
          <button
            onClick={decline}
            className="btn-ghost"
            style={{ padding: "14px 20px", fontSize: 13 }}
          >
            I am under 18
          </button>
        </div>

        <p className="font-mono" style={{ fontSize: 11, color: "#5C5C63", marginTop: 20, lineHeight: 1.6 }}>
          Your confirmation is stored locally in your browser. We do not track this on our servers.
        </p>
      </div>
    </div>
  );
}
