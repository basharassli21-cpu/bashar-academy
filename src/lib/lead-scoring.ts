import type { LeadStatus } from "@/lib/api/leads";

export type LeadScoreBand = "hot" | "warm" | "cold";

export type LeadScoreReasonCode =
  | "STATUS_INTERESTED"
  | "STATUS_CONTACTED"
  | "STATUS_NEW"
  | "FOLLOWUP_OVERDUE"
  | "FOLLOWUP_DUE_TODAY"
  | "FOLLOWUP_DUE_SOON"
  | "NO_FOLLOWUP_SCHEDULED"
  | "CONTACTED_RECENTLY"
  | "CONTACT_STALE"
  | "NEVER_CONTACTED_AGING";

export type LeadScoreResult = {
  score: number;
  band: LeadScoreBand;
  reasons: LeadScoreReasonCode[];
};

export type LeadScoreInput = {
  status: LeadStatus;
  lastContactDate: string | null;
  nextFollowupDate: string | null;
  createdAt: string;
};

const SCORABLE_STATUSES: readonly LeadStatus[] = ["NEW", "CONTACTED", "INTERESTED"];
const DAY_MS = 24 * 60 * 60 * 1000;

// Pure rule-based heuristic (no ML/LLM calls) so reps can see exactly why a
// lead is hot or cold: status, follow-up urgency, and contact recency.
export function scoreLead(lead: LeadScoreInput): LeadScoreResult | null {
  if (!SCORABLE_STATUSES.includes(lead.status)) return null;

  let score = 0;
  const reasons: LeadScoreReasonCode[] = [];

  if (lead.status === "INTERESTED") {
    score += 50;
    reasons.push("STATUS_INTERESTED");
  } else if (lead.status === "CONTACTED") {
    score += 30;
    reasons.push("STATUS_CONTACTED");
  } else {
    score += 20;
    reasons.push("STATUS_NEW");
  }

  const now = Date.now();

  if (lead.nextFollowupDate) {
    const due = new Date(lead.nextFollowupDate);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const in3Days = new Date(endOfToday.getTime() + 3 * DAY_MS);

    if (due < startOfToday) {
      score += 25;
      reasons.push("FOLLOWUP_OVERDUE");
    } else if (due <= endOfToday) {
      score += 20;
      reasons.push("FOLLOWUP_DUE_TODAY");
    } else if (due <= in3Days) {
      score += 10;
      reasons.push("FOLLOWUP_DUE_SOON");
    }
  } else {
    score -= 10;
    reasons.push("NO_FOLLOWUP_SCHEDULED");
  }

  if (lead.lastContactDate) {
    const daysSinceContact = (now - new Date(lead.lastContactDate).getTime()) / DAY_MS;
    if (daysSinceContact <= 2) {
      score += 15;
      reasons.push("CONTACTED_RECENTLY");
    } else if (daysSinceContact > 7) {
      score -= 10;
      reasons.push("CONTACT_STALE");
    }
  } else if (lead.status !== "NEW") {
    score -= 15;
    reasons.push("CONTACT_STALE");
  } else {
    const daysSinceCreated = (now - new Date(lead.createdAt).getTime()) / DAY_MS;
    if (daysSinceCreated > 7) {
      score -= 20;
      reasons.push("NEVER_CONTACTED_AGING");
    } else if (daysSinceCreated > 3) {
      score -= 10;
      reasons.push("NEVER_CONTACTED_AGING");
    }
  }

  const clamped = Math.max(0, Math.min(100, score));
  const band: LeadScoreBand = clamped >= 70 ? "hot" : clamped >= 40 ? "warm" : "cold";
  return { score: clamped, band, reasons };
}
