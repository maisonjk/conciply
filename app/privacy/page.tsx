import Nav, { Footer } from "@/components/Nav";

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="shell" style={{ maxWidth:720, paddingTop:"clamp(48px,6vw,80px)", paddingBottom:80 }}>
        <div className="kicker" style={{ marginBottom:16 }}>Legal</div>
        <h1 className="display" style={{ fontSize:"clamp(32px,5vw,64px)", marginBottom:32 }}>Privacy Policy</h1>
        <div style={{ color:"#C4C4CC", fontSize:15, lineHeight:1.8 }}>
          <p>Conciply Growth OS does not require account creation and does not collect personal data beyond what is required to process payments.</p>
          <p style={{ marginTop:16 }}>Payment processing is handled entirely by Stripe. We do not store credit card information.</p>
          <p style={{ marginTop:16 }}>Your SaaS descriptions submitted for analysis are sent to OpenAI for processing. Do not submit confidential or sensitive information. See OpenAI&apos;s privacy policy for how they handle API data.</p>
          <p style={{ marginTop:16 }}>Report content is stored only in your browser&apos;s localStorage and is not transmitted to our servers.</p>
          <p style={{ marginTop:16 }}>We use standard server logs (IP address, request metadata) for rate limiting and abuse prevention. Logs are not sold or shared.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
