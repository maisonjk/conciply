import Nav, { Footer } from "@/components/Nav";
import { LEGAL } from "@/lib/legal";

export default function AccessibilityPage() {
  return (
    <>
      <Nav />
      <main className="shell" style={{ maxWidth: 720, paddingTop: "clamp(48px,6vw,80px)", paddingBottom: 96 }}>
        <div className="kicker" style={{ marginBottom: 16 }}>Accessibility</div>
        <h1 className="display" style={{ fontSize: "clamp(32px,5vw,64px)", marginBottom: 8 }}>Accessibility</h1>
        <p className="font-mono" style={{ fontSize: 12, color: "#7A7A88", marginBottom: 48, letterSpacing: "0.06em" }}>
          Last updated: {LEGAL.updated}
        </p>
        <div style={{ color: "#C4C4CC", fontSize: 15, lineHeight: 1.85 }}>
          <p>We want Conciply to work for everyone. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, and we test key flows (running a report, viewing it, checkout and cancellation) with a keyboard and screen readers.</p>
          <p style={{ marginTop: 12 }}>If something is hard to use, or you need a report in another format, email <a href={`mailto:${LEGAL.email}?subject=Accessibility`} style={{ color: "var(--n1)", textDecoration: "underline" }}>{LEGAL.email}</a>. We reply within 2 business days and will help you get what you need.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
