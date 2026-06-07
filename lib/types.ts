// lib/types.ts

export type LicenseTier = "founder" | "pro" | "agency";

export type SectionKey =
  | "executiveSummary" | "marketAnalysis" | "competitorAnalysis"
  | "positioning" | "growthOpportunities" | "acquisitionPlan"
  | "funnelImprovements" | "marketingAssets" | "salesAssets"
  | "retentionStrategy" | "kpiDashboard" | "topRoiActions"
  | "plan7Day" | "plan30Day" | "plan90Day" | "immediateActions";

export const FREE_SECTIONS: SectionKey[] = ["executiveSummary", "topRoiActions"];

export const SECTION_LABELS: Record<SectionKey, string> = {
  executiveSummary:    "Executive Summary",
  marketAnalysis:      "Market Analysis",
  competitorAnalysis:  "Competitor Analysis",
  positioning:         "Positioning",
  growthOpportunities: "Growth Opportunities",
  acquisitionPlan:     "Acquisition Plan",
  funnelImprovements:  "Funnel Improvements",
  marketingAssets:     "Marketing Assets",
  salesAssets:         "Sales Assets",
  retentionStrategy:   "Retention Strategy",
  kpiDashboard:        "KPI Dashboard",
  topRoiActions:       "Top ROI Actions",
  plan7Day:            "7-Day Plan",
  plan30Day:           "30-Day Plan",
  plan90Day:           "90-Day Plan",
  immediateActions:    "Immediate Actions",
};

export const SECTION_ORDER: SectionKey[] = [
  "executiveSummary","marketAnalysis","competitorAnalysis","positioning",
  "growthOpportunities","acquisitionPlan","funnelImprovements","marketingAssets",
  "salesAssets","retentionStrategy","kpiDashboard","topRoiActions",
  "plan7Day","plan30Day","plan90Day","immediateActions",
];

export interface Competitor  { name: string; strength: string; weakness: string }
export interface Channel     { name: string; priority: "high"|"medium"|"low"; rationale: string }
export interface EmailItem   { subject: string; body: string; cta: string }
export interface Objection   { objection: string; response: string }
export interface KPI         { metric: string; target: string; frequency: string }
export interface RoiAction   { title: string; description: string; impact: number; speed: number; difficulty: number; score: number }
export interface DayPlan     { day: number; tasks: string[] }
export interface WeekPlan    { week: number; focus: string; tasks: string[] }
export interface MonthPlan   { month: number; theme: string; milestones: string[] }

export interface GrowthReport {
  executiveSummary:    { icp: string; uvp: string; topOpportunity: string; assumptions: string[] }
  marketAnalysis:      { tam: string; sam: string; som: string; trends: string[] }
  competitorAnalysis:  { competitors: Competitor[]; gaps: string[]; advantages: string[] }
  positioning:         { uvp: string; messaging: string; brandNarrative: string }
  growthOpportunities: { organic: string[]; paid: string[]; plg: string[]; viral: string[] }
  acquisitionPlan:     { channels: Channel[]; tactics: string[]; budgetGuidance: string }
  funnelImprovements:  { awareness: string[]; activation: string[]; retention: string[]; referral: string[] }
  marketingAssets:     { landingCopy: string; adCopy: string[]; emailSequence: EmailItem[] }
  salesAssets:         { outreachScript: string; discoveryQuestions: string[]; objections: Objection[] }
  retentionStrategy:   { onboarding: string[]; engagementLoops: string[]; upsells: string[] }
  kpiDashboard:        { metrics: KPI[]; targets: string[]; warnings: string[] }
  topRoiActions:       { actions: RoiAction[] }
  plan7Day:            { days: DayPlan[] }
  plan30Day:           { weeks: WeekPlan[] }
  plan90Day:           { months: MonthPlan[] }
  immediateActions:    { next24h: string[]; next72h: string[] }
}

export type PartialGrowthReport = Partial<GrowthReport>;

export interface StoredReport {
  id: string
  input: string
  createdAt: number
  report: GrowthReport
  edits: Partial<Record<SectionKey, string>>
  notes: Partial<Record<SectionKey, string>>
}
