import type { LeadStatus } from "@/lib/api/leads";

export type NextActionCode =
  | "CALL_FIRST_CONTACT"
  | "CALL_OVERDUE_FOLLOWUP"
  | "CALL_DUE_TODAY"
  | "SCHEDULE_FOLLOWUP"
  | "RE_ENGAGE_STALE"
  | "WAIT_FOLLOWUP_SCHEDULED";

export type NextActionInput = {
  status: LeadStatus;
  lastContactDate: string | null;
  nextFollowupDate: string | null;
};

const TERMINAL_STATUSES: readonly LeadStatus[] = ["CLOSED_SALE", "CANCELLED", "NOT_INTERESTED"];
const STALE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

// Pure rule-based suggestion (no ML/LLM calls), evaluated in priority order
// so each lead gets exactly one concrete next step.
export function getNextAction(lead: NextActionInput): NextActionCode | null {
  if (TERMINAL_STATUSES.includes(lead.status)) return null;

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  if (lead.nextFollowupDate) {
    const due = new Date(lead.nextFollowupDate);
    if (due < startOfToday) return "CALL_OVERDUE_FOLLOWUP";
    if (due <= endOfToday) return "CALL_DUE_TODAY";
  }

  if (lead.status === "NEW" && !lead.lastContactDate) {
    return "CALL_FIRST_CONTACT";
  }

  if (!lead.nextFollowupDate) {
    return "SCHEDULE_FOLLOWUP";
  }

  if (lead.lastContactDate) {
    const daysSinceContact = (now.getTime() - new Date(lead.lastContactDate).getTime()) / DAY_MS;
    if (daysSinceContact > STALE_DAYS) return "RE_ENGAGE_STALE";
  }

  return "WAIT_FOLLOWUP_SCHEDULED";
}
