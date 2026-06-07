"use client";
import { useState } from "react";
import type { SectionKey, GrowthReport } from "@/lib/types";
import { SECTION_LABELS } from "@/lib/types";
import { getLicenseKey } from "@/lib/workspace";

interface Props {
  sectionKey: SectionKey;
  input: string;
  report: GrowthReport;
  onClose: () => void;
}

export default function AssetGenerator({ sectionKey, input, report, onClose }: Props) {
  const [assets, setAssets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const key = getLicenseKey();
      const res = await fetch("/api/asset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { "x-conciply-license": key } : {}),
        },
        body: JSON.stringify({ sectionKey, input, report }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error"); return; }
      setAssets(Array.isArray(data.assets) ? data.assets.map((a: unknown) =>
        typeof a === "string" ? a : JSON.stringify(a, null, 2)
      ) : []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100,
                  display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:"#121214", border:"2px solid #F4F4F1", maxWidth:720,
                    width:"100%", maxHeight:"80vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                      padding:"20px 24px", borderBottom:"2px solid #F4F4F1" }}>
          <div>
            <div className="kicker" style={{ color:"var(--n2)", marginBottom:4 }}>Deep Dive</div>
            <div className="display" style={{ fontSize:20 }}>{SECTION_LABELS[sectionKey]}</div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding:"8px 14px", fontSize:12 }}>
            Close ✕
          </button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"24px" }}>
          {assets.length === 0 && !loading && (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <p style={{ color:"#C4C4CC", marginBottom:24, lineHeight:1.6 }}>
                Generate expanded, ready-to-use assets for the <strong>{SECTION_LABELS[sectionKey]}</strong> section.
                Full copy, scripts, and plans — not summaries.
              </p>
              <button onClick={generate} className="btn-neon"
                style={{ padding:"14px 28px", fontSize:16, background:"var(--n2)", borderColor:"var(--n2)" }}>
                ⚡ Generate Assets →
              </button>
            </div>
          )}

          {loading && (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <div className="skel" style={{ height:12, width:"60%", margin:"0 auto 12px" }} />
              <div className="skel" style={{ height:12, width:"45%", margin:"0 auto" }} />
              <div className="kicker" style={{ marginTop:20, color:"var(--n1)" }}>Generating assets…</div>
            </div>
          )}

          {error && (
            <div style={{ color:"var(--n2)", fontFamily:"monospace", fontSize:13, borderLeft:"3px solid var(--n2)", paddingLeft:12 }}>
              {error}
            </div>
          )}

          {assets.map((asset, i) => (
            <div key={i} style={{ border:"1px solid #2A2A2E", padding:"16px 20px", marginBottom:8 }}>
              <div className="kicker" style={{ color:"var(--n3)", marginBottom:10 }}>Asset {i + 1}</div>
              <pre style={{ color:"#E0E0E0", fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap",
                            margin:0, fontFamily:"inherit" }}>
                {asset}
              </pre>
            </div>
          ))}

          {assets.length > 0 && (
            <button onClick={generate} className="btn-ghost"
              style={{ marginTop:8, padding:"10px 18px", fontSize:12 }}>
              ↻ Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
