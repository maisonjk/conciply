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
            <p>Conciply ("we", "us", "the Service") is designed to be privacy-light by default. We do not require account creation. We do not sell, rent, or broker your data. This policy explains what limited information we collect, why we collect it, and how it is handled.</p>
            <p style={{ marginTop: 12 }}>By using Conciply, you agree to the data practices described in this Privacy Policy.</p>
          </Section>

          <Section title="2. Information We Collect">

            <p><strong style={{ color: "#F4F4F1" }}>a) Business descriptions you submit</strong><br />
            When you submit a business or idea for analysis, that text is transmitted to OpenAI's API to generate your growth playbook. This text is not stored on our servers after the API response is returned. You should not submit personally identifiable information, confidential trade secrets, or sensitive third-party data in your submissions.</p>

            <p style={{ marginTop: 16 }}><strong style={{ color: "#F4F4F1" }}>b) IP address</strong><br />
            We log your IP address solely for rate limiting (to enforce free plan limits) and abuse prevention. IP addresses are not linked to personal identities, are not shared with third parties (except as required by law), and are purged within 30 days.</p>

            <p style={{ marginTop: 16 }}><strong style={{ color: "#F4F4F1" }}>c) Payment information</strong><br />
            All payment processing is handled entirely by Stripe, Inc. We never receive, see, or store your full credit card number or sensitive payment details. Stripe may collect your billing name, email address, and payment method details. Their handling of this data is governed by the <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--n1)", textDecoration: "underline" }}>Stripe Privacy Policy</a>.</p>

            <p style={{ marginTop: 16 }}><strong style={{ color: "#F4F4F1" }}>d) License key</strong><br />
            Your license key is stored in your browser's localStorage and is sent to our server with each API request to verify your subscription tier. We do not associate license keys with personal identity beyond what Stripe provides at checkout (email address used to purchase).</p>

          </Section>

          <Section title="3. Report Storage">
            <p>All generated reports, workspace edits, and notes are stored exclusively in your browser's localStorage. This data never leaves your device to our servers. As a result:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Clearing your browser data will permanently delete your reports.</li>
              <li style={{ marginBottom: 6 }}>Reports are not accessible from other devices unless you use the Restore feature.</li>
              <li style={{ marginBottom: 6 }}>We cannot retrieve, recover, or access your report data on your behalf.</li>
            </ul>
          </Section>

          <Section title="4. OpenAI Data Processing">
            <p>Conciply uses OpenAI's API to generate reports. When you submit a business description, that text is sent to OpenAI's servers for processing. By using Conciply, you acknowledge and accept that:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Your submitted text is transmitted to OpenAI and processed according to <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--n1)", textDecoration: "underline" }}>OpenAI's Privacy Policy</a>.</li>
              <li style={{ marginBottom: 6 }}>OpenAI does not use API data to train their models by default (as per their API data usage policy).</li>
              <li style={{ marginBottom: 6 }}>Do not submit confidential information, trade secrets, personally identifiable information of third parties, or sensitive data.</li>
            </ul>
          </Section>

          <Section title="5. Cookies and Tracking">
            <p>Conciply does not use cookies, tracking pixels, advertising scripts, or third-party analytics services (including Google Analytics). The only browser storage we use is localStorage for your reports and license key — which stays on your device and is not accessible to us.</p>
          </Section>

          <Section title="6. Data Sharing">
            <p>We do not sell, rent, or share your personal data with third parties except in the following limited circumstances:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}><strong style={{ color: "#F4F4F1" }}>Stripe</strong> — to process subscription payments.</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: "#F4F4F1" }}>OpenAI</strong> — your submitted business description is sent to their API to generate reports.</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: "#F4F4F1" }}>Legal compliance</strong> — if required by law, court order, or governmental authority.</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: "#F4F4F1" }}>Business transfer</strong> — in the event of a merger, acquisition, or sale of assets, your data may be transferred. We will notify users via this page before any such transfer.</li>
            </ul>
          </Section>

          <Section title="7. Data Retention">
            <p>We retain server logs (IP addresses, request metadata) for up to 30 days for abuse prevention, after which they are deleted. Payment records are retained by Stripe in accordance with their legal and regulatory obligations. We hold no other personal data on our servers.</p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>Conciply is not directed at or intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has used the Service, please contact us at <a href="mailto:hello@conciply.com" style={{ color: "var(--n1)", textDecoration: "underline" }}>hello@conciply.com</a> and we will take appropriate steps.</p>
          </Section>

          <Section title="9. International Users — GDPR and CCPA">
            <p><strong style={{ color: "#F4F4F1" }}>European Union (GDPR):</strong> If you are located in the EU or EEA, you have rights under the General Data Protection Regulation, including the right to access, correct, delete, or restrict processing of your personal data. Given that we hold minimal personal data (IP address for up to 30 days, and email via Stripe), most rights can be exercised by contacting us directly. Our legal basis for processing IP addresses is legitimate interest (rate limiting and abuse prevention).</p>
            <p style={{ marginTop: 12 }}><strong style={{ color: "#F4F4F1" }}>California (CCPA):</strong> If you are a California resident, you have the right to know what personal information we collect, request deletion of that information, and opt out of the sale of personal information. We do not sell personal information. To exercise your rights, contact us at <a href="mailto:hello@conciply.com" style={{ color: "var(--n1)", textDecoration: "underline" }}>hello@conciply.com</a>.</p>
          </Section>

          <Section title="10. Security">
            <p>We implement reasonable technical and organizational measures to protect the limited data we hold. All data transmitted between your browser and our servers is encrypted via HTTPS/TLS. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>
          </Section>

          <Section title="11. Your Rights">
            <p>You may contact us at any time to:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Request information about what data we hold related to you.</li>
              <li style={{ marginBottom: 6 }}>Request deletion of any personal data we hold.</li>
              <li style={{ marginBottom: 6 }}>Raise concerns about how your data is handled.</li>
            </ul>
            <p style={{ marginTop: 12 }}>We will respond to all requests within 30 days. Since we hold minimal data, most requests are simple to fulfill.</p>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>We may update this policy from time to time. The "Last updated" date at the top will reflect any changes. Continued use of the Service after changes are posted constitutes acceptance of the updated policy. For material changes, we will make reasonable efforts to provide notice.</p>
          </Section>

          <Section title="13. Contact">
            <p>Privacy questions or requests? Email us at <a href="mailto:hello@conciply.com" style={{ color: "var(--n1)", textDecoration: "underline" }}>hello@conciply.com</a>. We aim to respond within 30 days.</p>
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
