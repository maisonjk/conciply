"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Nav, { Footer } from "@/components/Nav";
import ReportView from "@/components/ReportView";
import { getReport, getLicensePlan } from "@/lib/workspace";
import type { StoredReport } from "@/lib/types";

function ReportContent() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [stored, setStored] = useState<StoredReport | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const r = getReport(id);
    if (!r) { setNotFound(true); return; }
    setStored(r);
    setTier(getLicensePlan());
  }, [id]);

  return (
    <>
      {notFound && (
        <div style={{ textAlign:"center", padding:"80px 24px" }}>
          <div className="kicker" style={{ marginBottom:16 }}>Report not found</div>
          <p style={{ color:"#C4C4CC", marginBottom:24 }}>
            This report may have been cleared from your browser storage.
          </p>
          <a href="/" className="btn-neon" style={{ padding:"12px 24px", fontSize:16 }}>
            Generate a new report →
          </a>
        </div>
      )}
      {stored && (
        <ReportView
          report={stored.report}
          tier={tier}
          input={stored.input}
          reportId={stored.id}
        />
      )}
    </>
  );
}

function PrintBar() {
  return (
    <div style={{
      background:"#111113", borderBottom:"1px solid #1E1E22",
      padding:"10px 24px", display:"flex", alignItems:"center",
      justifyContent:"flex-end", gap:12,
    }}>
      <span style={{ fontFamily:"var(--font-mono)", fontSize:10,
                     letterSpacing:"0.08em", color:"#5C5C63",
                     textTransform:"uppercase", marginRight:"auto" }}>
        Print or save as PDF
      </span>
      <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"#7A7A88" }}>
        Use your browser&apos;s print dialog: <strong style={{ color:"#C4C4CC" }}>Cmd+P</strong> / <strong style={{ color:"#C4C4CC" }}>Ctrl+P</strong> → Save as PDF
      </span>
      <button
        onClick={() => window.print()}
        style={{
          background:"var(--n3)", color:"#000", border:"none",
          padding:"8px 18px", cursor:"pointer",
          fontFamily:"var(--font-archivo), sans-serif",
          fontSize:11, fontWeight:800, letterSpacing:"0.06em",
          textTransform:"uppercase",
        }}
      >
        ⎙ Print / Save PDF
      </button>
    </div>
  );
}

export default function ReportPage() {
  return (
    <>
      <Nav />
      <PrintBar />
      <Suspense fallback={<div style={{ padding:"80px 0", textAlign:"center", color:"#9A9AA8" }}>Loading…</div>}>
        <ReportContent />
      </Suspense>
      <Footer />
    </>
  );
}
