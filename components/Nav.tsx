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
            Conciply — Growth Playbook
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
  const icps = [
    { color:"var(--n3)", role:"Solo Founders & Indie Hackers", desc:"Validate ideas, find your market, and build a growth strategy before you write a line of code — or your first dollar in revenue." },
    { color:"var(--n1)", role:"Content Creators", desc:"Run any business, trend, or niche through Conciply and walk away with fresh angles, frameworks, and content that your audience hasn't seen yet." },
    { color:"var(--n2)", role:"Agencies & Consultants", desc:"Generate client-ready growth playbooks in minutes. More time delivering value, less time building decks from scratch." },
  ];
  return (
    <section style={{ borderTop:"2px solid #F4F4F1", marginTop:80 }}>
      <div className="shell vision-grid" style={{ padding:"clamp(48px,7vw,96px) clamp(16px,4vw,40px)" }}>
        <div>
          <p className="font-mono" style={{ fontSize:12, color:"var(--n1)", letterSpacing:"0.14em",
                                            textTransform:"uppercase", margin:"0 0 20px" }}>Built for</p>
          <h2 className="display" style={{ fontSize:"clamp(34px,5vw,58px)", marginBottom:24, marginTop:0 }}>
            Founders. Creators.<br />Builders of all kinds.
          </h2>
          <p style={{ fontSize:15, lineHeight:1.7, color:"#C4C4CC", maxWidth:420, margin:"0 0 32px" }}>
            Conciply gives every founder, creator, and entrepreneur the same strategic firepower
            as a fully-staffed growth org — regardless of team size or budget.
          </p>
          <p className="display" style={{ fontSize:18, color:"var(--n3)", margin:0 }}>
            Acquire. Retain. Expand.
          </p>
        </div>
        <div className="mission-col" style={{ borderLeft:"2px solid #F4F4F1", paddingLeft:"clamp(24px,4vw,56px)" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
            {icps.map(({ color, role, desc }) => (
              <div key={role}>
                <p className="font-mono" style={{ fontSize:12, color, letterSpacing:"0.14em",
                                                  textTransform:"uppercase", margin:"0 0 8px", fontWeight:700 }}>
                  {role}
                </p>
                <p style={{ fontSize:15, lineHeight:1.7, color:"#9A9AA8", margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
