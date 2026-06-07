"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav, { Footer } from "@/components/Nav";
import SectionCard from "@/components/SectionCard";
import AssetGenerator from "@/components/AssetGenerator";
import { getReport, getLicensePlan, getLicenseKey, updateReportSection, exportReport } from "@/lib/workspace";
import { SECTION_ORDER, SECTION_LABELS } from "@/lib/types";
import type { StoredReport, SectionKey, GrowthReport } from "@/lib/types";

function WorkspaceContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";

  const [stored, setStored] = useState<StoredReport | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [active, setActive] = useState<SectionKey>("executiveSummary");
  const [deepDiveKey, setDeepDiveKey] = useState<SectionKey | null>(null);
  const [regenLoading, setRegenLoading] = useState<SectionKey | null>(null);

  useEffect(() => {
    const plan = getLicensePlan();
    if (!plan) { router.push("/unlock"); return; }
    const r = getReport(id);
    if (!r) { router.push("/"); return; }
    setStored(r);
    setTier(plan);
  }, [id, router]);

  const handleRegenerate = async (key: SectionKey) => {
    if (!stored) return;
    setRegenLoading(key);
    try {
      const licenseKey = getLicenseKey();
      const sectionData = JSON.stringify((stored.report as unknown as Record<string, unknown>)[key] ?? {});
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(licenseKey ? { "x-conciply-license": licenseKey } : {}),
        },
        body: JSON.stringify({ sectionKey: key, input: stored.input, currentContent: sectionData }),
      });
      const data = await res.json();
      if (res.ok && data.section) {
        updateReportSection(stored.id, key, data.section as GrowthReport[typeof key]);
        setStored(getReport(stored.id));
      }
    } finally {
      setRegenLoading(null);
    }
  };

  if (!stored) return null;

  const isPro = tier === "pro" || tier === "agency";
  const isAgency = tier === "agency";

  return (
    <>
      <main className="shell" style={{ paddingTop:32, paddingBottom:80 }}>
        <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between",
                      gap:12, borderBottom:"2px solid #F4F4F1", paddingBottom:16, marginBottom:0 }}>
          <div>
            <div className="kicker" style={{ color:"var(--n3)", marginBottom:6 }}>
              {tier} plan · workspace
            </div>
            <h1 className="display" style={{ fontSize:"clamp(20px,3vw,40px)",
                                              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                                              maxWidth:"60vw" }}>
              {stored.input}
            </h1>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <a href={`/report?id=${stored.id}`} className="btn-ghost" style={{ padding:"8px 14px", fontSize:12 }}>
              View Report
            </a>
            {isAgency && (
              <button onClick={() => exportReport(stored)} className="btn-ghost"
                style={{ padding:"8px 14px", fontSize:12 }}>
                Export JSON
              </button>
            )}
            <a href="/" className="btn-neon" style={{ padding:"8px 14px", fontSize:12 }}>
              New Report
            </a>
          </div>
        </div>

        <div style={{ position:"sticky", top:64, zIndex:30, background:"rgba(10,10,11,0.95)",
                      borderBottom:"2px solid #2A2A2E", overflowX:"auto", display:"flex" }}>
          {SECTION_ORDER.map((key, i) => (
            <button key={key} onClick={() => setActive(key)} className="font-mono"
              style={{ flexShrink:0, padding:"12px 16px", fontSize:10, letterSpacing:"0.1em",
                       textTransform:"uppercase", whiteSpace:"nowrap", border:"none",
                       borderBottom: key === active ? "2px solid var(--n1)" : "2px solid transparent",
                       marginBottom:-2, cursor:"pointer",
                       color: key === active ? "var(--n1)" : "#C4C4CC",
                       background:"transparent" }}>
              {String(i+1).padStart(2,"0")} {SECTION_LABELS[key]}
            </button>
          ))}
        </div>

        <div style={{ marginTop:2 }}>
          {regenLoading === active ? (
            <div style={{ padding:"32px 24px" }}>
              <div className="skel" style={{ height:12, width:"40%", marginBottom:12 }} />
              <div className="skel" style={{ height:12, width:"65%", marginBottom:8 }} />
              <div className="skel" style={{ height:12, width:"50%" }} />
              <div className="kicker" style={{ marginTop:20, color:"var(--n1)" }}>Regenerating section…</div>
            </div>
          ) : (
            <SectionCard
              sectionKey={active}
              report={stored.report}
              locked={false}
              onRegenerate={handleRegenerate}
              onDeepDive={isPro ? (key) => setDeepDiveKey(key) : undefined}
            />
          )}
        </div>
      </main>

      {deepDiveKey && stored && (
        <AssetGenerator
          sectionKey={deepDiveKey}
          input={stored.input}
          report={stored.report}
          onClose={() => setDeepDiveKey(null)}
        />
      )}
    </>
  );
}

export default function WorkspacePage() {
  return (
    <>
      <Nav />
      <Suspense>
        <WorkspaceContent />
      </Suspense>
      <Footer />
    </>
  );
}
