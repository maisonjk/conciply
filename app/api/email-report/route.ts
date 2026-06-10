import { NextRequest, NextResponse } from "next/server";
import type { GrowthReport, SectionKey } from "@/lib/types";
import { SECTION_LABELS, FREE_SECTIONS } from "@/lib/types";
import { verifyLicense } from "@/lib/license";

// ── Section groups for the email layout ─────────────────────────────────────
const GROUPS: { label: string; keys: SectionKey[] }[] = [
  { label: "Analysis",  keys: ["executiveSummary", "marketAnalysis", "competitorAnalysis", "positioning"] },
  { label: "Growth",    keys: ["growthOpportunities", "acquisitionPlan", "funnelImprovements"] },
  { label: "Assets",    keys: ["marketingAssets", "salesAssets", "retentionStrategy", "socialMediaStrategy"] },
  { label: "Execution", keys: ["kpiDashboard", "topRoiActions", "plan7Day", "plan30Day", "plan90Day", "immediateActions"] },
];

// ── Recursively flatten any value into readable plain text ───────────────────
function flatten(val: unknown, depth = 0): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string")  return val.trim();
  if (typeof val === "number")  return String(val);
  if (typeof val === "boolean") return val ? "Yes" : "No";

  if (Array.isArray(val)) {
    return val
      .map(item => {
        const str = flatten(item, depth + 1);
        return str ? `• ${str}` : "";
      })
      .filter(Boolean)
      .join("\n");
  }

  if (typeof val === "object") {
    return Object.entries(val as Record<string, unknown>)
      .map(([k, v]) => {
        const label = k.replace(/([A-Z])/g, " $1").trim();
        const content = flatten(v, depth + 1);
        if (!content) return "";
        return `${label.toUpperCase()}: ${content}`;
      })
      .filter(Boolean)
      .join("\n");
  }

  return String(val);
}

// ── Convert section data to an HTML block ────────────────────────────────────
function sectionToHTML(key: SectionKey, report: Partial<GrowthReport>, idx: number): string {
  const data = (report as Record<string, unknown>)[key];
  if (!data) return "";

  const text = flatten(data);
  if (!text) return "";

  const lines = text.split("\n").filter(Boolean);
  const linesHTML = lines
    .map(line => {
      if (line.startsWith("•")) {
        return `<li style="margin:0 0 6px;color:#C4C4CC;font-size:14px;line-height:1.6;">${escapeHTML(line.slice(1).trim())}</li>`;
      }
      if (line.includes(":") && line.split(":")[0].length < 40 && line.split(":")[0] === line.split(":")[0].toUpperCase()) {
        const [labelPart, ...rest] = line.split(":");
        return `
          <div style="margin:10px 0 4px;">
            <span style="font-family:monospace;font-size:10px;letter-spacing:0.1em;color:#7A7A88;text-transform:uppercase;">${escapeHTML(labelPart)}</span>
          </div>
          <p style="margin:0 0 8px;color:#C4C4CC;font-size:14px;line-height:1.6;">${escapeHTML(rest.join(":").trim())}</p>`;
      }
      return `<p style="margin:0 0 8px;color:#C4C4CC;font-size:14px;line-height:1.6;">${escapeHTML(line)}</p>`;
    });

  // Wrap bullet lines in <ul>
  let html = "";
  let inList = false;
  for (const line of linesHTML) {
    if (line.includes("<li")) {
      if (!inList) { html += `<ul style="margin:8px 0;padding-left:20px;">`; inList = true; }
      html += line;
    } else {
      if (inList) { html += `</ul>`; inList = false; }
      html += line;
    }
  }
  if (inList) html += `</ul>`;

  return `
    <div style="margin-bottom:32px;border-left:3px solid #2A2A2E;padding-left:20px;">
      <div style="margin-bottom:12px;">
        <span style="font-family:monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#5C5C63;">
          ${String(idx).padStart(2, "0")}
        </span>
        <h2 style="font-family:Arial,sans-serif;font-size:18px;font-weight:900;color:#F4F4F1;
                   margin:4px 0 0;letter-spacing:-0.01em;text-transform:uppercase;">
          ${escapeHTML(SECTION_LABELS[key])}
        </h2>
      </div>
      ${html}
    </div>`;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Build the full HTML email ─────────────────────────────────────────────────
function buildEmailHTML(input: string, report: Partial<GrowthReport>, tier: string | null): string {
  const isPaid = tier !== null;
  const keys: SectionKey[] = isPaid
    ? GROUPS.flatMap(g => g.keys)
    : FREE_SECTIONS;

  let sectionsHTML = "";
  let globalIdx = 1;
  for (const group of GROUPS) {
    const groupKeys = group.keys.filter(k => keys.includes(k));
    if (!groupKeys.length) continue;

    sectionsHTML += `
      <div style="margin-bottom:8px;padding:8px 0;border-bottom:1px solid #1E1E22;">
        <span style="font-family:monospace;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#5C5C63;">
          ${escapeHTML(group.label)}
        </span>
      </div>`;

    for (const key of groupKeys) {
      sectionsHTML += sectionToHTML(key, report, globalIdx++);
    }
  }

  const sectionNote = isPaid
    ? "All 17 sections included"
    : `${FREE_SECTIONS.length} of 17 sections (free tier) · <a href="https://conciply.com/pricing" style="color:#00E5FF;">Upgrade for all 17 →</a>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Conciply Growth Report — ${escapeHTML(input.slice(0, 60))}</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:Arial,Helvetica,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0B;">
    <tr><td align="center" style="padding:32px 16px;">

      <!-- Card -->
      <table width="660" cellpadding="0" cellspacing="0" style="max-width:660px;width:100%;border:2px solid #F4F4F1;">

        <!-- Header -->
        <tr>
          <td style="background:#111113;padding:28px 32px;border-bottom:2px solid #F4F4F1;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
              <span style="font-family:Arial Black,Arial,sans-serif;font-size:20px;font-weight:900;
                           letter-spacing:-0.01em;text-transform:uppercase;color:#F4F4F1;">
                Conciply
              </span>
              <span style="font-family:monospace;font-size:9px;color:#3C3C42;letter-spacing:0.12em;
                           text-transform:uppercase;padding-left:10px;">
                Growth Playbook
              </span>
            </div>
            <h1 style="font-family:Arial Black,Arial,sans-serif;font-size:clamp(18px,3vw,26px);
                       font-weight:900;color:#F4F4F1;margin:0 0 8px;
                       letter-spacing:-0.01em;text-transform:uppercase;line-height:1.1;">
              ${escapeHTML(input.slice(0, 120))}
            </h1>
            <p style="font-family:monospace;font-size:10px;color:#5C5C63;
                      letter-spacing:0.1em;text-transform:uppercase;margin:0;">
              Growth Playbook · ${sectionNote}
            </p>
          </td>
        </tr>

        <!-- Privacy notice -->
        <tr>
          <td style="background:#0D0D0F;padding:14px 32px;border-bottom:1px solid #1E1E22;">
            <p style="font-family:monospace;font-size:9px;color:#3C3C42;
                      letter-spacing:0.06em;margin:0;line-height:1.6;">
              This report was generated privately. Conciply does not store your business data,
              AI responses, or competitive analysis. This email is sent once and immediately discarded.
            </p>
          </td>
        </tr>

        <!-- Report sections -->
        <tr>
          <td style="padding:32px 32px 16px;background:#0A0A0B;">
            ${sectionsHTML}
          </td>
        </tr>

        <!-- Upgrade CTA (free only) -->
        ${!isPaid ? `
        <tr>
          <td style="padding:24px 32px;background:#111113;border-top:1px solid #1E1E22;">
            <p style="font-family:Arial Black,Arial,sans-serif;font-size:16px;font-weight:900;
                      color:#F4F4F1;margin:0 0 8px;text-transform:uppercase;letter-spacing:-0.01em;">
              9 more sections await.
            </p>
            <p style="font-family:Arial,sans-serif;font-size:13px;color:#7A7A88;margin:0 0 16px;line-height:1.6;">
              Acquisition Plan, Funnel Improvements, Marketing Assets, Sales Assets,
              Retention Strategy, KPI Dashboard, 7/30/90-day plans and more.
            </p>
            <a href="https://conciply.com/pricing"
               style="display:inline-block;background:#FF2E6E;color:#000;padding:12px 24px;
                      font-family:Arial Black,Arial,sans-serif;font-size:12px;font-weight:900;
                      letter-spacing:0.04em;text-transform:uppercase;text-decoration:none;">
              Unlock All 17 Sections →
            </a>
          </td>
        </tr>` : ""}

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#0A0A0B;border-top:2px solid #F4F4F1;">
            <p style="font-family:monospace;font-size:9px;color:#2A2A2E;letter-spacing:0.08em;margin:0;line-height:1.8;">
              Conciply — Autonomous Growth OS · conciply.com<br>
              AI-generated for strategic inspiration. Review before acting.<br>
              Built for founders, agencies, consultants, and businesses that value privacy.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM ?? "reports@conciply.com";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Email is not configured on this server. Please download or print your report instead." },
      { status: 503 }
    );
  }

  // SECURITY: derive tier from HMAC-verified license header — never trust
  // the client-supplied tier. A malicious client could send tier:"agency"
  // to get all 17 sections for free.
  const licenseHeader = req.headers.get("x-conciply-license") ?? "";
  const license = licenseHeader ? verifyLicense(licenseHeader) : null;
  const serverTier = license ? license.tier : null;

  const body = await req.json().catch(() => ({}));
  const { email, report, input } = body as {
    email: string;
    report: Partial<GrowthReport>;
    input: string;
    optIn: boolean;
  };

  // Basic validation
  if (!email || typeof email !== "string" || !email.includes("@") || email.length > 254) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  if (!input || typeof input !== "string") {
    return NextResponse.json({ error: "Missing report input." }, { status: 400 });
  }
  if (!report || typeof report !== "object") {
    return NextResponse.json({ error: "Missing report data." }, { status: 400 });
  }

  // Build email HTML in memory — never written to disk or database
  const html = buildEmailHTML(input, report, serverTier);
  const subject = `Your Conciply Growth Report: ${input.slice(0, 80)}`;

  // Send via Resend REST API
  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [email],
      subject,
      html,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.json().catch(() => ({}));
    console.error("[email-report] Resend error:", err);
    return NextResponse.json(
      { error: "Failed to send email. Please try again or download your report instead." },
      { status: 502 }
    );
  }

  // Report data is discarded here — never stored
  return NextResponse.json({ ok: true });
}
