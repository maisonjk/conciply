import Nav, { Footer } from "@/components/Nav";
import { LEGAL, operator, addressSuffix } from "@/lib/legal";

const link = { color: "var(--n1)", textDecoration: "underline" } as const;
const strong = { color: "#F4F4F1" } as const;

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="shell" style={{ maxWidth: 720, paddingTop: "clamp(48px,6vw,80px)", paddingBottom: 96 }}>
        <div className="kicker" style={{ marginBottom: 16 }}>Legal</div>
        <h1 className="display" style={{ fontSize: "clamp(32px,5vw,64px)", marginBottom: 8 }}>Privacy Policy</h1>
        <p className="font-mono" style={{ fontSize: 12, color: "#7A7A88", marginBottom: 48, letterSpacing: "0.06em" }}>
          Last updated: {LEGAL.updated}
        </p>

        <div style={{ color: "#C4C4CC", fontSize: 15, lineHeight: 1.85 }}>

          <Section title="1. Who we are">
            <p>{LEGAL.brand} (&quot;we&quot;, &quot;us&quot;, &quot;the Service&quot;) is operated by {operator()}{addressSuffix()}. We are the &quot;controller&quot; of the personal data described here. Contact us about privacy at <a href={`mailto:${LEGAL.email}`} style={link}>{LEGAL.email}</a>.</p>
            <p style={{ marginTop: 12 }}>Conciply has no user accounts and collects as little personal data as it can. We do not sell your personal information, and we do not share it for cross-context behavioral advertising.</p>
          </Section>

          <Section title="2. What we collect and why">
            <Item title="Business descriptions you submit">
              When you run a report, the text you type and your language choice are sent to OpenAI to generate the playbook. We do not save that text or the generated report on our servers. Please don&apos;t include personal data about other people, trade secrets or confidential information. Legal basis (EU/UK): performance of a contract.
            </Item>
            <Item title="IP address and request data">
              We use your IP address to enforce report limits (1 preview report per IP per calendar month) and to prevent abuse. The IP-based counter is deleted automatically at the end of the calendar month. Our host also keeps standard server logs (IP, time, page requested, browser type) for a limited period for security and debugging. Legal basis: legitimate interests in running a secure, fairly priced service.
            </Item>
            <Item title="Payment and subscription data">
              Payments are processed by Stripe. We never see or store your full card number. Stripe gives us your email address, billing name and country, a customer ID and your subscription status. With each purchase we also record when you agreed to the renewal terms, the plan, price and the exact wording you agreed to, as required by California law. Legal basis: performance of a contract and legal obligation.
            </Item>
            <Item title="License key">
              After checkout we issue a license key that unlocks your plan. It contains your plan and Stripe customer ID, and is signed so it can&apos;t be forged. We store it with your Stripe customer record to revoke it if a subscription ends, and we count how many reports it has used this month.
            </Item>
            <Item title="Email (only if you give it to us)">
              If you ask us to email you a report or join our email list, we use your email address for that purpose only. You can unsubscribe or ask us to delete it at any time.
            </Item>
          </Section>

          <Section title="3. What stays on your device">
            <p>Your reports, workspace notes, license key and plan name are stored in your browser&apos;s local storage. Your license key and plan are also stored in two first-party cookies (<code>conciply_key</code>, <code>conciply_plan</code>) so you don&apos;t lose access if local storage is cleared. If you hit the preview limit, a first-party cookie records that for the month. These are all strictly necessary for the Service to work, so we don&apos;t ask for cookie consent. We use no analytics, advertising or tracking cookies, pixels or third-party scripts.</p>
            <p style={{ marginTop: 12 }}>The Restore feature moves your license key to another browser. It does not move your reports, which never leave the device they were created on. You can delete everything on the <a href="/delete-account" style={link}>Delete Data</a> page.</p>
          </Section>

          <Section title="4. Who we share data with">
            <p>We share data only with service providers that process it on our behalf under contract:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}><strong style={strong}>OpenAI</strong> (USA): generates reports from your submitted text. OpenAI states it does not use API data to train its models by default and may keep API inputs and outputs for a limited period for abuse monitoring. See <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" style={link}>OpenAI&apos;s privacy policy</a>.</li>
              <li style={{ marginBottom: 6 }}><strong style={strong}>Stripe</strong> (USA/Ireland): payments, subscriptions, invoices and the billing portal. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={link}>Stripe&apos;s privacy policy</a>.</li>
              <li style={{ marginBottom: 6 }}><strong style={strong}>Vercel</strong> (USA): website hosting and server logs.</li>
              <li style={{ marginBottom: 6 }}><strong style={strong}>Upstash</strong> (USA/EU): our database for rate-limit counters, license records and any email list sign-ups.</li>
              <li style={{ marginBottom: 6 }}><strong style={strong}>Resend</strong> (USA): delivers emails you ask us to send.</li>
            </ul>
            <p style={{ marginTop: 12 }}>We may also disclose data if the law requires it, to protect our rights or users&apos; safety, or as part of a merger or sale of the business, in which case we will tell you before your data becomes subject to a different policy.</p>
          </Section>

          <Section title="5. International transfers">
            <p>We are based in the United States, and our providers process data in the US. When we transfer personal data from the EU, UK or Switzerland, we rely on our providers&apos; Standard Contractual Clauses or their certification under the EU-U.S. Data Privacy Framework and its UK and Swiss extensions, where available.</p>
          </Section>

          <Section title="6. How long we keep data">
            <ul style={{ paddingLeft: 20 }}>
              <li style={{ marginBottom: 6 }}>Submitted text and generated reports: not stored on our servers.</li>
              <li style={{ marginBottom: 6 }}>IP rate-limit counters: until the end of the calendar month.</li>
              <li style={{ marginBottom: 6 }}>Server logs: for the limited period our host retains them.</li>
              <li style={{ marginBottom: 6 }}>License records and monthly usage counts: while your subscription is active, and afterwards only as long as needed to block revoked keys and handle refunds and disputes.</li>
              <li style={{ marginBottom: 6 }}>Renewal-consent records: at least 3 years, or 1 year after your subscription ends, whichever is longer, as California law requires.</li>
              <li style={{ marginBottom: 6 }}>Payment records: as long as Stripe and tax law require.</li>
              <li style={{ marginBottom: 6 }}>Email list: until you unsubscribe or ask us to delete it.</li>
            </ul>
          </Section>

          <Section title="7. Your rights">
            <p><strong style={strong}>Everyone:</strong> email <a href={`mailto:${LEGAL.email}`} style={link}>{LEGAL.email}</a> to ask what we hold about you, to correct it, or to delete it. We respond within 30 days (45 days for California requests), and may ask you to confirm you own the email address or license key involved.</p>
            <p style={{ marginTop: 12 }}><strong style={strong}>EU, EEA and UK residents (GDPR):</strong> you have the right to access, rectify, erase, restrict and port your personal data, to object to processing based on legitimate interests, and to complain to your local data protection authority.</p>
            <p style={{ marginTop: 12 }}><strong style={strong}>California residents (CCPA/CPRA):</strong> you have the right to know what personal information we collect, use and disclose, to delete it, to correct it, and to not be discriminated against for exercising these rights. In the last 12 months we collected identifiers (IP address, email, customer ID), commercial information (plan and purchase history) and internet activity (server logs), for the purposes above. We do not sell or share personal information and do not use sensitive personal information. You may use an authorized agent. We honor Global Privacy Control signals.</p>
            <p style={{ marginTop: 12 }}><strong style={strong}>Other US states:</strong> residents of states with consumer privacy laws have similar rights and can use the same email address. If we deny a request, you may appeal by replying to our decision.</p>
          </Section>

          <Section title="8. Children">
            <p>Conciply is for adults 18 and over. We don&apos;t knowingly collect personal data from anyone under 18. If you believe a minor has used the Service, contact us and we will delete their data.</p>
          </Section>

          <Section title="9. Security">
            <p>All traffic is encrypted with HTTPS. License keys are cryptographically signed, server credentials are kept out of the browser, and we limit what we store in the first place. No method of transmission or storage is 100% secure. To report a vulnerability, email <a href={`mailto:${LEGAL.email}`} style={link}>{LEGAL.email}</a>.</p>
          </Section>

          <Section title="10. Changes">
            <p>We will post any changes here and update the date at the top. For material changes, we will give notice on the site, and by email to subscribers, before they take effect.</p>
          </Section>

          <Section title="11. Contact">
            <p>{operator()}{addressSuffix()}. Email <a href={`mailto:${LEGAL.email}`} style={link}>{LEGAL.email}</a>.</p>
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

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <p style={{ marginBottom: 16 }}>
      <strong style={{ color: "#F4F4F1" }}>{title}</strong><br />
      {children}
    </p>
  );
}
