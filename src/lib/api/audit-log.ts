import type { PaginatedResult } from "@/lib/api/leads";
import type { Role } from "@/generated/prisma/enums";

export const AUDIT_ACTION_VALUES = [
  "LOGIN",
  "LOGIN_FAILED",
  "LOGIN_RATE_LIMITED",
  "LOGOUT",
  "PASSWORD_CHANGED",
  "EMPLOYEE_CREATED",
  "EMPLOYEE_UPDATED",
  "EMPLOYEE_DEACTIVATED",
  "EMPLOYEE_REACTIVATED",
  "TEAM_LEADER_CREATED",
  "TEAM_LEADER_ASSIGNED",
  "TEAM_LEADER_UNASSIGNED",
  "LEAD_CREATED",
  "LEAD_UPDATED",
  "LEAD_DELETED",
  "LEAD_TRANSFERRED",
  "LEAD_PULLED_TO_OPENC",
  "LEAD_RETURNED_FROM_OPENC",
  "LEAD_CLAIMED",
  "LEAD_CLAIM_FAILED",
  "LEADS_IMPORTED",
  "LEADS_DISTRIBUTED",
  "LEADS_BULK_TRANSFERRED",
  "LEADS_BULK_DELETED",
  "LEADS_EXPORTED",
  "WEBHOOK_CREATED",
  "WEBHOOK_UPDATED",
  "WEBHOOK_DELETED",
  "TWO_FACTOR_ENABLED",
  "TWO_FACTOR_DISABLED",
] as const;

export type AuditActionValue = (typeof AUDIT_ACTION_VALUES)[number];

export type AuditLogItem = {
  id: string;
  action: AuditActionValue;
  actorRole: Role | null;
  entityType: string | null;
  entityId: string | null;
  details: unknown;
  createdAt: string;
  actor: { id: string; fullName: string } | null;
};

async function parseOrThrow(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data;
}

export async function fetchAuditLog(params: {
  action?: AuditActionValue | "";
  actorUserId?: string;
  from?: string;
  to?: string;
  page?: number;
}): Promise<PaginatedResult<AuditLogItem>> {
  const search = new URLSearchParams();
  if (params.action) search.set("action", params.action);
  if (params.actorUserId) search.set("actorUserId", params.actorUserId);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.page) search.set("page", String(params.page));
  const res = await fetch(`/api/admin/audit-log?${search.toString()}`);
  return parseOrThrow(res);
}

export type AuditActorItem = { id: string; fullName: string };

export async function fetchAuditLogActors(): Promise<{ items: AuditActorItem[] }> {
  const res = await fetch("/api/admin/audit-log/actors");
  return parseOrThrow(res);
}
