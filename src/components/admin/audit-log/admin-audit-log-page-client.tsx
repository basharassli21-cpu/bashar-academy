"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  fetchAuditLog,
  fetchAuditLogActors,
  AUDIT_ACTION_VALUES,
  type AuditActionValue,
} from "@/lib/api/audit-log";

const ALL_ACTIONS = "ALL";
const ALL_ACTORS = "ALL";

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
