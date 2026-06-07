import Nav, { Footer } from "@/components/Nav";

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="shell" style={{ maxWidth:720, paddingTop:"clamp(48px,6vw,80px)", paddingBottom:80 }}>
        <div className="kicker" style={{ marginBottom:16 }}>Legal</div>
        <h1 className="display" style={{ fontSize:"clamp(32px,5vw,64px)", marginBottom:32 }}>Terms of Use</h1>
        <div style={{ color:"#C4C4CC", fontSize:15, lineHeight:1.8 }}>
          <p>Conciply Growth OS is provided as-is for strategic inspiration purposes only.</p>
          <p style={{ marginTop:16 }}>AI-generated content may be inaccurate, incomplete, or not applicable to your specific situation. Always review output before acting on any recommendations. Do not rely solely on this tool for business decisions.</p>
          <p style={{ marginTop:16 }}>License keys are non-refundable after use. One license per individual or team. Resale is not permitted.</p>
          <p style={{ marginTop:16 }}>We reserve the right to update these terms at any time. Continued use constitutes acceptance.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
