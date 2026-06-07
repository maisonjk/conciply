import Nav, { Footer } from "@/components/Nav";
import PricingTable from "@/components/PricingTable";

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="shell" style={{ paddingTop:"clamp(48px,6vw,80px)", paddingBottom:80 }}>
        <div className="kicker" style={{ marginBottom:16 }}>Pricing</div>
        <h1 className="display" style={{ fontSize:"clamp(36px,6vw,80px)", marginBottom:12 }}>
          Simple.<br /><span style={{ color:"var(--n2)" }}>One-time.</span>
        </h1>
        <p style={{ fontSize:18, color:"#C4C4CC", maxWidth:560, lineHeight:1.6, marginBottom:48 }}>
          No subscriptions. Pay once, use forever. Upgrade anytime.
        </p>
        <PricingTable />
        <div style={{ marginTop:32, textAlign:"center" }}>
          <p style={{ color:"#9A9AA8", fontSize:14 }}>
            Already purchased?{" "}
            <a href="/unlock" style={{ color:"var(--n1)", textDecoration:"underline" }}>Enter your license key →</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
