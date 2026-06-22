import type { LeadStatus } from "@/lib/api/leads";

export type FollowupSla = "overdue" | "due_today";

const CLOSED_STATUSES: readonly LeadStatus[] = ["CLOSED_SALE", "CANCELLED"];

export function getFollowupSla(
  nextFollowupDate: string | null | undefined,
  status: LeadStatus
): FollowupSla | null {
  if (!nextFollowupDate || CLOSED_STATUSES.includes(status)) return null;

  const due = new Date(nextFollowupDate);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  if (due < startOfToday) return "overdue";
  if (due <= endOfToday) return "due_today";
  return null;
}
