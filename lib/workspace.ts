"use client";
import { nanoid } from "nanoid";
import type { StoredReport, SectionKey, GrowthReport } from "./types";

const KEY = "conciply_reports";
const MAX = 20;

export function loadReports(): StoredReport[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch { return []; }
}

function saveReports(reports: StoredReport[]): void {
  localStorage.setItem(KEY, JSON.stringify(reports.slice(-MAX)));
}

export function saveReport(input: string, report: GrowthReport): StoredReport {
  const entry: StoredReport = {
    id: nanoid(10),
    input,
    createdAt: Date.now(),
    report,
    edits: {},
    notes: {},
  };
  const existing = loadReports();
  saveReports([...existing, entry]);
  return entry;
}

export function getReport(id: string): StoredReport | null {
  return loadReports().find(r => r.id === id) ?? null;
}

export function updateSection(id: string, key: SectionKey, value: string): void {
  const reports = loadReports();
  const idx = reports.findIndex(r => r.id === id);
  if (idx === -1) return;
  reports[idx].edits[key] = value;
  saveReports(reports);
}

export function updateReportSection<K extends SectionKey>(
  id: string,
  key: K,
  value: GrowthReport[K],
): void {
  const reports = loadReports();
  const idx = reports.findIndex(r => r.id === id);
  if (idx === -1) return;
  reports[idx].report[key] = value;
  delete reports[idx].edits[key];
  saveReports(reports);
}

export function exportReport(report: StoredReport): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `conciply-${report.input.slice(0,40).replace(/\s+/g,"-").toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Cookie helpers (1-year expiry, SameSite=Lax) ─────────────────────────────
function setCookie(name: string, value: string) {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// ── License persistence ───────────────────────────────────────────────────────
export function getLicensePlan(): string | null {
  if (typeof window === "undefined") return null;
  // localStorage first, fall back to cookie if localStorage was cleared
  const lsPlan = localStorage.getItem("conciply_plan");
  const lsKey  = localStorage.getItem("conciply_key");
  if (lsPlan && lsKey) return lsPlan;
  // Restore from cookie
  const ckKey  = getCookie("conciply_key");
  const ckPlan = getCookie("conciply_plan");
  if (ckKey && ckPlan) {
    localStorage.setItem("conciply_key",  ckKey);
    localStorage.setItem("conciply_plan", ckPlan);
    return ckPlan;
  }
  return null;
}

export function getLicenseKey(): string | null {
  if (typeof window === "undefined") return null;
  const lsKey = localStorage.getItem("conciply_key");
  if (lsKey) return lsKey;
  // Restore from cookie
  const ckKey  = getCookie("conciply_key");
  const ckPlan = getCookie("conciply_plan");
  if (ckKey && ckPlan) {
    localStorage.setItem("conciply_key",  ckKey);
    localStorage.setItem("conciply_plan", ckPlan);
    return ckKey;
  }
  return null;
}

export function setLicense(key: string, plan: string): void {
  localStorage.setItem("conciply_key",  key);
  localStorage.setItem("conciply_plan", plan);
  setCookie("conciply_key",  key);
  setCookie("conciply_plan", plan);
}

export function clearLicense(): void {
  localStorage.removeItem("conciply_key");
  localStorage.removeItem("conciply_plan");
  deleteCookie("conciply_key");
  deleteCookie("conciply_plan");
}
