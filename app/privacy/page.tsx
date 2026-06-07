import Nav, { Footer } from "@/components/Nav";

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="shell" style={{ maxWidth: 720, paddingTop: "clamp(48px,6vw,80px)", paddingBottom: 96 }}>
        <div className="kicker" style={{ marginBottom: 16 }}>Legal</div>
        <h1 className="display" style={{ fontSize: "clamp(32px,5vw,64px)", marginBottom: 8 }}>Privacy Policy</h1>
        <p className="font-mono" style={{ fontSize: 12, color: "#7A7A88", marginBottom: 48, letterSpacing: "0.06em" }}>
          Effective: June 2025 · Last updated: June 2025
        </p>

        <div style={{ color: "#C4C4CC", fontSize: 15, lineHeight: 1.85 }}>

          <Section title="1. Overview">
            <p>Conciply is designed to be privacy-light by default. We do not require account creation. We do not sell your data. This policy explains what limited information we collect and why.</p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong style={{ color: "#F4F4F1" }}>Business descriptions you submit</strong><br />
            When you submit a business or idea for analysis, that text is sent to OpenAI's API to generate your growth playbook. We do not store this text on our servers after the response is returned. See Section 4 for how OpenAI handles this data.</p>

            <p style={{ marginTop: 16 }}><strong style={{ color: "#F4F4F1" }}>IP address</strong><br />
            We log your IP address for rate limiting (to enforce the free plan limit) and to prevent abuse. IP logs are not linked to any personal identity and are not retained beyond 30 days.</p>

            <p style={{ marginTop: 16 }}><strong style={{ color: "#F4F4F1" }}>Payment information</strong><br />
            Payments are processed entirely by Stripe. We never see or store your credit card details. Stripe may collect billing name, email, and card details as part of their service. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--n1)", textDecoration: "underline" }}>Stripe's Privacy Policy</a>.</p>

            <p style={{ marginTop: 16 }}><strong style={{ color: "#F4F4F1" }}>License key</strong><br />
            Your license key is stored in your browser's localStorage. It is sent to our server on each API request to verify your plan. We do not associate license keys with personal identity beyond what Stripe provides at checkout.</p>
          </Section>

          <Section title="3. Report Storage">
            <p>All generated reports, workspace edits, and notes are stored exclusively in your browser's localStorage. They are never uploaded to or stored on our servers. This means:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Clearing your browser data will delete your reports.</li>
              <li style={{ marginBottom: 6 }}>Reports are not accessible from other devices unless you use the Restore feature with your license key.</li>
              <li style={{ marginBottom: 6 }}>We cannot recover lost reports on your behalf.</li>
            </ul>
          </Section>

          <Section title="4. OpenAI Data Processing">
            <p>Business descriptions you submit are sent to OpenAI's API for processing. By using Conciply, you acknowledge that:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Your input is transmitted to OpenAI's servers to generate the report.</li>
              <li style={{ marginBottom: 6 }}>Do not submit confidential, personally identifiable, or sensitive third-party information.</li>
              <li style={{ marginBottom: 6 }}>OpenAI's data handling is governed by their own <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--n1)", textDecoration: "underline" }}>Privacy Policy</a>. API data is not used to train OpenAI models by default.</li>
            </ul>
          </Section>

          <Section title="5. Cookies and Tracking">
            <p>Conciply does not use tracking cookies, analytics scripts, or advertising pixels. We do not use Google Analytics or any third-party tracking service. The only browser storage we use is localStorage for your reports and license key.</p>
          </Section>

          <Section title="6. Data Sharing">
            <p>We do not sell, rent, or share your data with third parties, except:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Stripe — for payment processing.</li>
              <li style={{ marginBottom: 6 }}>OpenAI — for report generation (your submitted business description only).</li>
              <li style={{ marginBottom: 6 }}>As required by law.</li>
            </ul>
          </Section>

          <Section title="7. Data Retention">
            <p>We retain server logs (IP addresses, request metadata) for up to 30 days for abuse prevention. Payment records are retained by Stripe per their legal obligations. We hold no other personal data on our servers.</p>
          </Section>

          <Section title="8. Your Rights">
            <p>Since we hold minimal data, there is little to request. However, if you believe we hold data about you and would like it reviewed or deleted, contact us at <a href="mailto:hello@conciply.com" style={{ color: "var(--n1)", textDecoration: "underline" }}>hello@conciply.com</a>. We will respond within 30 days.</p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>We may update this policy from time to time. The "Last updated" date at the top will reflect any changes. Continued use of the Service constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="10. Contact">
            <p>Questions or concerns about your privacy? Email us at <a href="mailto:hello@conciply.com" style={{ color: "var(--n1)", textDecoration: "underline" }}>hello@conciply.com</a>.</p>
          </Section>

        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 className="font-mono" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
                                          textTransform: "uppercase", color: "#F4F4F1", marginBottom: 12 }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
