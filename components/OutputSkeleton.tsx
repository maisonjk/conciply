export default function OutputSkeleton() {
  return (
    <div role="status" aria-label="Generating your growth report" style={{ marginTop:2 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:28, borderBottom:"2px solid #F4F4F1" }}>
        <span className="skel" style={{ width:14, height:14 }} />
        <span className="kicker" style={{ color:"var(--n1)" }}>
          Deploying 16 AI growth roles…
        </span>
      </div>
      <div className="cardgrid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ gridColumn:"span 6", background:"#0A0A0B", padding:28 }}>
            <div className="skel" style={{ height:10, width:"25%", marginBottom:16 }} />
            <div className="skel" style={{ height:20, width:"80%", marginBottom:8 }} />
            <div className="skel" style={{ height:20, width: i % 2 ? "55%" : "70%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
