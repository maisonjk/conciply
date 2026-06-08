import Nav, { Footer } from "@/components/Nav";
import PricingTable from "@/components/PricingTable";

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="shell" style={{ paddingTop: "clamp(48px,6vw,80px)", paddingBottom: 96 }}>

        {/* Page header */}
        <div style={{ marginBottom: 48 }}>
          <div
            className="kicker"
            style={{ marginBottom: 16, color: "#B8B8C8" }}
          >
            Pricing
          </div>
          <h1
            className="display"
            style={{ fontSize: "clamp(40px,6vw,80px)", marginBottom: 16, marginTop: 0 }}
          >
            Simple.<br />
            <span style={{ color: "var(--n2)" }}>Flexible.</span>
          </h1>
          <p
            style={{
              fontSize: "clamp(15px,1.4vw,18px)",
              color: "#D4D4DC",
              maxWidth: 480,
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Monthly or annual billing. Cancel before your next renewal and you won&apos;t be charged again.
          </p>
        </div>

        {/* Feature label row — above the grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            marginBottom: 0,
          }}
        >
          {["Free", "Founder", "Pro", "Agency"].map((t, i) => (
            <div
              key={t}
              className="font-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: i === 2 ? "var(--n1)" : "#3C3C42",
                paddingBottom: 8,
                paddingLeft: 2,
              }}
            />
          ))}
        </div>

        <PricingTable />

        {/* Footer note — left-aligned to match grid */}
        <div style={{ marginTop: 24 }}>
          <p
            className="font-mono"
            style={{ fontSize: 12, color: "#9A9AA8", letterSpacing: "0.04em", margin: 0 }}
          >
            Already purchased?{" "}
            <a
              href="/unlock"
              style={{ color: "var(--n1)", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              Enter your license key →
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
