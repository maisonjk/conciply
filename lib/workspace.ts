"use client";
import { nanoid } from "nanoid";
import type { StoredReport, SectionKey, GrowthReport } from "./types";

const KEY = "conciply_reports";
const MAX = 60; // matches agency plan limit (highest tier)

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

// ── Cookie helpers ────────────────────────────────────────────────────────────
// Cookies survive Safari ITP clears and "Clear History and Website Data".
// We dual-store: localStorage (fast reads) + cookie (resilient fallback).
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find(row => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

// ── License persistence ───────────────────────────────────────────────────────

export function getLicensePlan(): string | null {
  if (typeof window === "undefined") return null;
  // localStorage first (fast), fall back to cookie, auto-restore if found
  const fromStorage = localStorage.getItem("conciply_plan");
  if (fromStorage) return fromStorage;
  const fromCookie = getCookie("conciply_plan");
  if (fromCookie) {
    // Restore into localStorage so future reads are fast
    localStorage.setItem("conciply_plan", fromCookie);
    const keyCookie = getCookie("conciply_key");
    if (keyCookie) localStorage.setItem("conciply_key", keyCookie);
  }
  return fromCookie;
}

export function getLicenseKey(): string | null {
  if (typeof window === "undefined") return null;
  const fromStorage = localStorage.getItem("conciply_key");
  if (fromStorage) return fromStorage;
  const fromCookie = getCookie("conciply_key");
  if (fromCookie) localStorage.setItem("conciply_key", fromCookie);
  return fromCookie;
}

export function setLicense(key: string, plan: string): void {
  // Write to both stores so either one can rescue the other
  localStorage.setItem("conciply_key", key);
  localStorage.setItem("conciply_plan", plan);
  setCookie("conciply_key", key);
  setCookie("conciply_plan", plan);
}
