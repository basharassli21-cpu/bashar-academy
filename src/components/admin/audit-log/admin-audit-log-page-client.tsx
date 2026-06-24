"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/pagination-controls";
import { useTranslations } from "@/components/providers/locale-provider";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import {
  fetchAuditLog,
  fetchAuditLogActors,
  fetchAuditLogAnomalies,
  AUDIT_ACTION_VALUES,
  type AuditActionValue,
  type AnomalyAlert,
  type AnomalySeverity,
} from "@/lib/api/audit-log";

const ALL_ACTIONS = "ALL";
const ALL_ACTORS = "ALL";

const SEVERITY_CLASSES: Record<AnomalySeverity, string> = {
  high: "border-transparent bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  medium:
    "border-transparent bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  low: "border-transparent bg-gray-500/10 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400",
};

const ANOMALY_ACTION_MAP: Partial<Record<AnomalyAlert["type"], AuditActionValue>> = {
  LOGIN_BRUTE_FORCE: "LOGIN_FAILED",
  LOGIN_RATE_LIMITED: "LOGIN_RATE_LIMITED",
  LARGE_BULK_DELETE: "LEADS_BULK_DELETED",
  LARGE_EXPORT: "LEADS_EXPORTED",
  PERMANENT_DELETE: "LEAD_PERMANENTLY_DELETED",
  TWO_FACTOR_DISABLED: "TWO_FACTOR_DISABLED",
};

function describeAnomaly(t: Dictionary, alert: AnomalyAlert): string {
  const m = t.auditLog.anomalies.messages;
  const actorName = alert.actorName ?? t.auditLog.systemActor;
  switch (alert.type) {
    case "LOGIN_BRUTE_FORCE": {
      const target = (alert.detail.ipAddress as string) || (alert.detail.username as string) || "";
      return `${alert.count} ${m.LOGIN_BRUTE_FORCE}${target ? ` (${target})` : ""}`;
    }
    case "LOGIN_RATE_LIMITED": {
      const target = (alert.detail.username as string) || "";
      return `${m.LOGIN_RATE_LIMITED}${target ? ` (${target})` : ""}`;
    }
    case "OFF_HOURS_SENSITIVE_ACTION": {
      const actionLabel = t.auditLog.actionLabels[alert.detail.action as AuditActionValue];
      return `${actorName} ${m.OFF_HOURS_SENSITIVE_ACTION} ${actionLabel}`;
    }
    case "LARGE_BULK_DELETE":
      return `${actorName} ${m.LARGE_BULK_DELETE} (${alert.count})`;
    case "LARGE_EXPORT":
      return `${actorName} ${m.LARGE_EXPORT} (${alert.count})`;
    case "PERMANENT_DELETE":
      return `${actorName} ${m.PERMANENT_DELETE}`;
    case "TWO_FACTOR_DISABLED":
      return `${actorName} ${m.TWO_FACTOR_DISABLED}`;
    case "HIGH_ACTIVITY_VOLUME":
      return `${actorName} — ${alert.count} ${m.HIGH_ACTIVITY_VOLUME}`;
    default:
      return "";
  }
}

function summarizeDetails(details: unknown): string {
  if (!details || typeof details !== "object") return "—";
  const d = details as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof d.customerName === "string") parts.push(d.customerName);
  if (typeof d.fullName === "string") parts.push(d.fullName);
  if (typeof d.username === "string") parts.push(`@${d.username}`);
  if (typeof d.scope === "string") parts.push(`(${d.scope})`);
  if (typeof d.filename === "string") parts.push(d.filename);
  if (typeof d.status === "string") parts.push(d.status);
  if (typeof d.importedCount === "number") parts.push(`${d.importedCount} imported`);
  if (typeof d.distributedCount === "number") parts.push(`${d.distributedCount} distributed`);
  if (typeof d.transferredCount === "number") parts.push(`${d.transferredCount} transferred`);
  if (typeof d.deletedCount === "number") parts.push(`${d.deletedCount} deleted`);
  if (typeof d.count === "number") parts.push(`${d.count} exported`);
  if (typeof d.resultingBucket === "string") parts.push(`→ ${d.resultingBucket}`);
  if (typeof d.fromBucket === "string") parts.push(`${d.fromBucket} →`);
  if (typeof d.defaultCountryCode === "string") parts.push(`country code → ${d.defaultCountryCode}`);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function AdminAuditLogPageClient() {
  const t = useTranslations();
  const [action, setAction] = React.useState<AuditActionValue | typeof ALL_ACTIONS>(ALL_ACTIONS);
  const [actorUserId, setActorUserId] = React.useState(ALL_ACTORS);
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [page, setPage] = React.useState(1);

  const actorsQuery = useQuery({
    queryKey: ["audit-log", "actors"],
    queryFn: fetchAuditLogActors,
  });

  const anomaliesQuery = useQuery({
    queryKey: ["audit-log", "anomalies"],
    queryFn: fetchAuditLogAnomalies,
    refetchInterval: 60_000,
  });
  const anomalies = anomaliesQuery.data?.items ?? [];

  function investigateAnomaly(alert: AnomalyAlert) {
    const mappedAction =
      ANOMALY_ACTION_MAP[alert.type] ??
      (alert.type === "OFF_HOURS_SENSITIVE_ACTION"
        ? (alert.detail.action as AuditActionValue)
        : undefined);
    setAction(mappedAction ?? ALL_ACTIONS);
    setActorUserId(alert.actorId ?? ALL_ACTORS);
    const occurred = new Date(alert.occurredAt);
    const fromDate = new Date(occurred);
    fromDate.setDate(fromDate.getDate() - 1);
    const toDate = new Date(occurred);
    toDate.setDate(toDate.getDate() + 1);
    setFrom(fromDate.toISOString().slice(0, 10));
    setTo(toDate.toISOString().slice(0, 10));
    setPage(1);
  }

  const { data, isLoading } = useQuery({
    queryKey: ["audit-log", action, actorUserId, from, to, page],
    queryFn: () =>
      fetchAuditLog({
        action: action === ALL_ACTIONS ? "" : action,
        actorUserId: actorUserId === ALL_ACTORS ? "" : actorUserId,
        from,
        to,
        page,
      }),
  });

  const hasFilters = action !== ALL_ACTIONS || actorUserId !== ALL_ACTORS || !!from || !!to;

  function clearFilters() {
    setAction(ALL_ACTIONS);
    setActorUserId(ALL_ACTORS);
    setFrom("");
    setTo("");
    setPage(1);
  }

  const actors = actorsQuery.data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t.auditLog.title}</h1>

      {!anomaliesQuery.isLoading && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-sm font-semibold">{t.auditLog.anomalies.title}</h2>
              {anomalies.length > 0 && <Badge variant="secondary">{anomalies.length}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">{t.auditLog.anomalies.description}</p>
          </div>
          {anomalies.length === 0 ? (
            <p className="px-2 py-1 text-sm text-muted-foreground">{t.auditLog.anomalies.allClear}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {anomalies.slice(0, 8).map((alert) => (
                <li key={alert.id}>
                  <button
                    type="button"
                    onClick={() => investigateAnomaly(alert)}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-start text-sm hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      <Badge variant="outline" className={SEVERITY_CLASSES[alert.severity]}>
                        {t.auditLog.anomalies.severityLabels[alert.severity]}
                      </Badge>
                      <span>{describeAnomaly(t, alert)}</span>
                    </span>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(alert.occurredAt).toLocaleString()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <Select
          items={[
            { value: ALL_ACTIONS, label: t.auditLog.filterAllActions },
            ...AUDIT_ACTION_VALUES.map((a) => ({ value: a, label: t.auditLog.actionLabels[a] })),
          ]}
          value={action}
          onValueChange={(v) => {
            setAction((v as AuditActionValue | typeof ALL_ACTIONS) ?? ALL_ACTIONS);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ACTIONS}>{t.auditLog.filterAllActions}</SelectItem>
            {AUDIT_ACTION_VALUES.map((a) => (
              <SelectItem key={a} value={a}>
                {t.auditLog.actionLabels[a]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={[
            { value: ALL_ACTORS, label: t.auditLog.filterAllActors },
            ...actors.map((a) => ({ value: a.id, label: a.fullName })),
          ]}
          value={actorUserId}
          onValueChange={(v) => {
            setActorUserId(v ?? ALL_ACTORS);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ACTORS}>{t.auditLog.filterAllActors}</SelectItem>
            {actors.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-col gap-1">
          <Label htmlFor="auditFrom" className="text-xs text-muted-foreground">
            {t.auditLog.dateFrom}
          </Label>
          <Input
            id="auditFrom"
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="w-40"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="auditTo" className="text-xs text-muted-foreground">
            {t.auditLog.dateTo}
          </Label>
          <Input
            id="auditTo"
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className="w-40"
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            {t.auditLog.clearFilters}
          </Button>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.auditLog.columnTime}</TableHead>
              <TableHead>{t.auditLog.columnActor}</TableHead>
              <TableHead>{t.auditLog.columnRole}</TableHead>
              <TableHead>{t.auditLog.columnAction}</TableHead>
              <TableHead>{t.auditLog.columnEntity}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {t.auditLog.empty}
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">
                  {entry.actor?.fullName ?? t.auditLog.systemActor}
                </TableCell>
                <TableCell>
                  {entry.actorRole ? (
                    <Badge variant="secondary">{t.roles[entry.actorRole]}</Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{t.auditLog.actionLabels[entry.action]}</TableCell>
                <TableCell className="text-muted-foreground">
                  {summarizeDetails(entry.details)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && (
        <PaginationControls page={data.page} pageCount={data.pageCount} onPageChange={setPage} />
      )}
    </div>
  );
}
