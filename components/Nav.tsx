"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();
  const navLink = (href: string, label: string) => {
    const active = path === href;
    return (
      <Link href={href} className="font-mono uppercase transition-colors"
        style={{ fontSize:12, letterSpacing:"0.1em", color: active ? "#000" : "#C4C4CC",
                 background: active ? "var(--n3)" : "transparent", padding:"8px 14px" }}>
        {label}
      </Link>
    );
  };

  return (
    <header style={{ position:"sticky", top:0, zIndex:40,
                     background:"rgba(10,10,11,0.82)", backdropFilter:"blur(14px)",
                     borderBottom:"2px solid #F4F4F1" }}>
      <div className="shell" style={{ height:64, display:"flex", alignItems:"center", justifyContent:"space-between",
                                       paddingLeft: path === "/workspace" ? 16 : undefined }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ display:"flex", gap:3 }}>
            <span style={{ width:11, height:22, background:"var(--n1)", display:"inline-block" }} />
            <span style={{ width:11, height:22, background:"var(--n2)", display:"inline-block" }} />
            <span style={{ width:11, height:22, background:"var(--n3)", display:"inline-block" }} />
          </span>
          <span className="display" style={{ fontSize:22 }}>Conciply</span>
        </Link>
        <nav style={{ display:"flex", gap:2, alignItems:"center" }}>
          <span className="nav-links-desktop">
            {navLink("/pricing", "Pricing")}
            {navLink("/restore", "Restore")}
          </span>
          <Link href="/" className="btn-neon" style={{ padding:"9px 18px", fontSize:13, marginLeft:8 }}>
            Start free
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const links: [string, string][] = [
    ["/pricing", "Pricing"],
    ["/restore", "Restore"],
    ["/terms", "Terms"],
    ["/privacy", "Privacy"],
  ];
  return (
    <footer style={{ borderTop:"2px solid #F4F4F1", marginTop:0 }}>
      <div className="shell" style={{ padding:"clamp(28px,4vw,44px) clamp(16px,4vw,40px)",
                                       display:"flex", flexWrap:"wrap", gap:24,
                                       alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ display:"flex", gap:3 }}>
            <span style={{ width:9, height:18, background:"var(--n1)", display:"inline-block" }} />
            <span style={{ width:9, height:18, background:"var(--n2)", display:"inline-block" }} />
            <span style={{ width:9, height:18, background:"var(--n3)", display:"inline-block" }} />
          </span>
          <span className="font-mono" style={{ fontSize:12, color:"#C4C4CC" }}>
            Conciply — Autonomous Growth OS
          </span>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="font-mono"
              style={{ fontSize:11, color:"#C4C4CC", letterSpacing:"0.06em",
                       textTransform:"uppercase", padding:"12px 10px", display:"inline-flex", alignItems:"center" }}>
              {label}
            </Link>
          ))}
          <span className="font-mono" style={{ fontSize:11, color:"#9A9AA8", padding:"12px 10px" }}>
            © {new Date().getFullYear()} CONCIPLY
          </span>
        </div>
      </div>
    </footer>
  );
}

export function VisionStatement() {
  return (
    <section style={{ borderTop:"2px solid #F4F4F1", marginTop:80 }}>
      <div className="shell vision-grid" style={{ padding:"clamp(48px,7vw,96px) clamp(16px,4vw,40px)" }}>
        <div>
          <p className="font-mono" style={{ fontSize:13, color:"var(--n1)", letterSpacing:"0.12em",
                                            textTransform:"uppercase", margin:"0 0 20px" }}>Our Vision</p>
          <h2 className="display" style={{ fontSize:"clamp(28px,4vw,46px)", marginBottom:24, marginTop:0 }}>
            Every business deserves a world-class executive team.
          </h2>
          <p style={{ fontSize:16, lineHeight:1.7, color:"#E0E0E0", maxWidth:420, margin:0 }}>
            Conciply gives every founder, creator, and entrepreneur — regardless of team size or budget —
            the same strategic firepower as a fully-staffed growth org.
          </p>
          <p className="display" style={{ marginTop:32, fontSize:18, color:"var(--n3)", marginBottom:0 }}>
            Think Like Owners. Execute Like a Team.
          </p>
        </div>
        <div className="mission-col" style={{ borderLeft:"2px solid #F4F4F1", paddingLeft:"clamp(24px,4vw,56px)" }}>
          <p className="font-mono" style={{ fontSize:13, color:"var(--n2)", letterSpacing:"0.12em",
                                            textTransform:"uppercase", margin:"0 0 20px" }}>Our Mission</p>
          <p style={{ fontSize:16, lineHeight:1.8, color:"#E0E0E0", marginBottom:20, marginTop:0 }}>
            Conciply exists to level the playing field — whether you're a SaaS founder, a content creator,
            an e-commerce seller, or anyone with a business idea worth growing.
          </p>
          <p style={{ fontSize:16, lineHeight:1.8, color:"#E0E0E0", marginBottom:0 }}>
            Every recommendation is scored by ROI, speed, and difficulty — so you always know exactly
            what to do next, and why it matters.
          </p>
        </div>
      </div>
    </section>
  );
}
