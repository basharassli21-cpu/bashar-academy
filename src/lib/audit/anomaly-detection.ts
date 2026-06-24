import type { AuditAction } from "@/generated/prisma/enums";

const BRUTE_FORCE_WINDOW_MS = 15 * 60 * 1000;
const BRUTE_FORCE_THRESHOLD = 5;
const LARGE_BULK_DELETE_THRESHOLD = 20;
const LARGE_EXPORT_THRESHOLD = 500;
const HIGH_VOLUME_WINDOW_MS = 60 * 60 * 1000;
const HIGH_VOLUME_THRESHOLD = 50;

const SENSITIVE_OFF_HOURS_ACTIONS = new Set<AuditAction>([
  "LEAD_DELETED",
  "LEADS_BULK_DELETED",
  "LEAD_PERMANENTLY_DELETED",
  "EMPLOYEE_DEACTIVATED",
  "WEBHOOK_CREATED",
  "WEBHOOK_UPDATED",
  "WEBHOOK_DELETED",
  "SETTINGS_UPDATED",
  "TWO_FACTOR_DISABLED",
  "TEAM_LEADER_UNASSIGNED",
]);

export type AnomalySeverity = "high" | "medium" | "low";

export type AnomalyType =
  | "LOGIN_BRUTE_FORCE"
  | "LOGIN_RATE_LIMITED"
  | "OFF_HOURS_SENSITIVE_ACTION"
  | "LARGE_BULK_DELETE"
  | "LARGE_EXPORT"
  | "PERMANENT_DELETE"
  | "TWO_FACTOR_DISABLED"
  | "HIGH_ACTIVITY_VOLUME";

export type AnomalyAlert = {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  occurredAt: string;
  actorId: string | null;
  actorName: string | null;
  count: number;
  detail: Record<string, unknown>;
};

export type AnomalyLogRow = {
  id: string;
  action: AuditAction;
  actorUserId: string | null;
  details: unknown;
  ipAddress: string | null;
  createdAt: Date;
  actor: { id: string; fullName: string } | null;
};

function detailString(details: unknown, key: string): string | undefined {
  if (!details || typeof details !== "object") return undefined;
  const v = (details as Record<string, unknown>)[key];
  return typeof v === "string" ? v : undefined;
}

function detailNumber(details: unknown, key: string): number | undefined {
  if (!details || typeof details !== "object") return undefined;
  const v = (details as Record<string, unknown>)[key];
  return typeof v === "number" ? v : undefined;
}

// Approximates local midnight-5am for a UTC+3 business timezone; adjust here
// if the deployment's primary user base moves to a different timezone.
function isOffHoursUtc(date: Date): boolean {
  const hour = date.getUTCHours();
  return hour >= 21 || hour < 2;
}

function detectLoginBruteForce(rows: AnomalyLogRow[]): AnomalyAlert[] {
  const failed = rows
    .filter((r) => r.action === "LOGIN_FAILED")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const byKey = new Map<string, AnomalyLogRow[]>();
  for (const row of failed) {
    const key = row.ipAddress ?? detailString(row.details, "username") ?? row.actorUserId ?? "unknown";
    const group = byKey.get(key);
    if (group) group.push(row);
    else byKey.set(key, [row]);
  }

  const alerts: AnomalyAlert[] = [];
  for (const [key, events] of byKey) {
    let start = 0;
    for (let end = 0; end < events.length; end++) {
      while (events[end].createdAt.getTime() - events[start].createdAt.getTime() > BRUTE_FORCE_WINDOW_MS) {
        start++;
      }
      const windowSize = end - start + 1;
      if (windowSize >= BRUTE_FORCE_THRESHOLD) {
        const last = events[end];
        alerts.push({
          id: `brute-force-${key}-${last.id}`,
          type: "LOGIN_BRUTE_FORCE",
          severity: "high",
          occurredAt: last.createdAt.toISOString(),
          actorId: last.actorUserId,
          actorName: last.actor?.fullName ?? null,
          count: windowSize,
          detail: {
            username: detailString(last.details, "username"),
            ipAddress: last.ipAddress ?? undefined,
          },
        });
        start = end + 1;
      }
    }
  }
  return alerts;
}

function detectLoginRateLimited(rows: AnomalyLogRow[]): AnomalyAlert[] {
  return rows
    .filter((r) => r.action === "LOGIN_RATE_LIMITED")
    .map((r) => ({
      id: `rate-limited-${r.id}`,
      type: "LOGIN_RATE_LIMITED" as const,
      severity: "high" as const,
      occurredAt: r.createdAt.toISOString(),
      actorId: r.actorUserId,
      actorName: r.actor?.fullName ?? null,
      count: 1,
      detail: {
        username: detailString(r.details, "username"),
        scope: detailString(r.details, "scope"),
        ipAddress: r.ipAddress ?? undefined,
      },
    }));
}

function detectOffHoursSensitiveActions(rows: AnomalyLogRow[]): AnomalyAlert[] {
  return rows
    .filter((r) => SENSITIVE_OFF_HOURS_ACTIONS.has(r.action) && isOffHoursUtc(r.createdAt))
    .map((r) => ({
      id: `off-hours-${r.id}`,
      type: "OFF_HOURS_SENSITIVE_ACTION" as const,
      severity: "medium" as const,
      occurredAt: r.createdAt.toISOString(),
      actorId: r.actorUserId,
      actorName: r.actor?.fullName ?? null,
      count: 1,
      detail: { action: r.action },
    }));
}

function detectLargeBulkDelete(rows: AnomalyLogRow[]): AnomalyAlert[] {
  return rows
    .filter((r) => r.action === "LEADS_BULK_DELETED")
    .filter((r) => (detailNumber(r.details, "deletedCount") ?? 0) >= LARGE_BULK_DELETE_THRESHOLD)
    .map((r) => ({
      id: `bulk-delete-${r.id}`,
      type: "LARGE_BULK_DELETE" as const,
      severity: "high" as const,
      occurredAt: r.createdAt.toISOString(),
      actorId: r.actorUserId,
      actorName: r.actor?.fullName ?? null,
      count: detailNumber(r.details, "deletedCount") ?? 0,
      detail: {},
    }));
}

function detectLargeExport(rows: AnomalyLogRow[]): AnomalyAlert[] {
  return rows
    .filter((r) => r.action === "LEADS_EXPORTED")
    .filter((r) => (detailNumber(r.details, "count") ?? 0) >= LARGE_EXPORT_THRESHOLD)
    .map((r) => ({
      id: `large-export-${r.id}`,
      type: "LARGE_EXPORT" as const,
      severity: "medium" as const,
      occurredAt: r.createdAt.toISOString(),
      actorId: r.actorUserId,
      actorName: r.actor?.fullName ?? null,
      count: detailNumber(r.details, "count") ?? 0,
      detail: {},
    }));
}

function detectPermanentDelete(rows: AnomalyLogRow[]): AnomalyAlert[] {
  return rows
    .filter((r) => r.action === "LEAD_PERMANENTLY_DELETED")
    .map((r) => ({
      id: `permanent-delete-${r.id}`,
      type: "PERMANENT_DELETE" as const,
      severity: "medium" as const,
      occurredAt: r.createdAt.toISOString(),
      actorId: r.actorUserId,
      actorName: r.actor?.fullName ?? null,
      count: 1,
      detail: {},
    }));
}

function detectTwoFactorDisabled(rows: AnomalyLogRow[]): AnomalyAlert[] {
  return rows
    .filter((r) => r.action === "TWO_FACTOR_DISABLED")
    .map((r) => ({
      id: `2fa-disabled-${r.id}`,
      type: "TWO_FACTOR_DISABLED" as const,
      severity: "medium" as const,
      occurredAt: r.createdAt.toISOString(),
      actorId: r.actorUserId,
      actorName: r.actor?.fullName ?? null,
      count: 1,
      detail: {},
    }));
}

function detectHighActivityVolume(rows: AnomalyLogRow[]): AnomalyAlert[] {
  const byActor = new Map<string, AnomalyLogRow[]>();
  for (const row of rows) {
    if (!row.actorUserId) continue;
    const group = byActor.get(row.actorUserId);
    if (group) group.push(row);
    else byActor.set(row.actorUserId, [row]);
  }

  const alerts: AnomalyAlert[] = [];
  for (const [actorId, events] of byActor) {
    const sorted = [...events].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    let start = 0;
    for (let end = 0; end < sorted.length; end++) {
      while (sorted[end].createdAt.getTime() - sorted[start].createdAt.getTime() > HIGH_VOLUME_WINDOW_MS) {
        start++;
      }
      const windowSize = end - start + 1;
      if (windowSize >= HIGH_VOLUME_THRESHOLD) {
        const last = sorted[end];
        alerts.push({
          id: `high-volume-${actorId}-${last.id}`,
          type: "HIGH_ACTIVITY_VOLUME",
          severity: "low",
          occurredAt: last.createdAt.toISOString(),
          actorId,
          actorName: last.actor?.fullName ?? null,
          count: windowSize,
          detail: {},
        });
        start = end + 1;
      }
    }
  }
  return alerts;
}

export function detectAnomalies(rows: AnomalyLogRow[]): AnomalyAlert[] {
  const alerts = [
    ...detectLoginBruteForce(rows),
    ...detectLoginRateLimited(rows),
    ...detectOffHoursSensitiveActions(rows),
    ...detectLargeBulkDelete(rows),
    ...detectLargeExport(rows),
    ...detectPermanentDelete(rows),
    ...detectTwoFactorDisabled(rows),
    ...detectHighActivityVolume(rows),
  ];

  const severityRank: Record<AnomalySeverity, number> = { high: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => {
    const rankDiff = severityRank[a.severity] - severityRank[b.severity];
    if (rankDiff !== 0) return rankDiff;
    return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
  });

  return alerts;
}
