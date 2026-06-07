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
        <div style={{ textAlign:"center", padding:"80px 0" }}>
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
        <>
          <div style={{ borderBottom:"2px solid #F4F4F1", paddingBottom:16, marginBottom:0 }}>
            <div className="kicker" style={{ marginBottom:8 }}>Report generated</div>
            <h1 className="display" style={{ fontSize:"clamp(24px,4vw,48px)",
                                             whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {stored.input}
            </h1>
          </div>
          <ReportView
            report={stored.report}
            tier={tier}
            input={stored.input}
            reportId={stored.id}
          />
        </>
      )}
    </>
  );
}

export default function ReportPage() {
  return (
    <>
      <Nav />
      <main className="shell" style={{ paddingTop:32, paddingBottom:80 }}>
        <Suspense fallback={<div style={{ padding:"80px 0", textAlign:"center", color:"#9A9AA8" }}>Loading…</div>}>
          <ReportContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
