"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { ProgressBar } from "@/components/progress-bar";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { PaginationControls } from "@/components/pagination-controls";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  fetchAdminEmployeeStats,
  fetchTeamLeaderEmployeeStats,
} from "@/lib/api/dashboard";

export function EmployeeMonitoringClient({
  employeeId,
  basePath,
  backHref,
  linkToLeads,
}: {
  employeeId: string;
  basePath: "admin" | "team-leader";
  backHref: string;
  linkToLeads: boolean;
}) {
  const t = useTranslations();
  const [page, setPage] = React.useState(1);

  const fetchStats = basePath === "admin" ? fetchAdminEmployeeStats : fetchTeamLeaderEmployeeStats;

  const { data, isLoading } = useQuery({
    queryKey: ["employee-stats", basePath, employeeId, page],
    queryFn: () => fetchStats(employeeId, page),
  });

  if (isLoading || !data) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href={backHref} className="text-sm text-muted-foreground hover:underline">
          {t.common.back}
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{data.employee.fullName}</h1>
          <Badge variant={data.employee.isActive ? "default" : "secondary"}>
            {data.employee.isActive ? t.employees.active : t.employees.inactive}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {data.employee.username}
          {data.employee.teamLeader && ` · ${data.employee.teamLeader.fullName}`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t.salesDashboard.callsToday} value={data.callsToday} />
        <StatCard label={t.salesDashboard.callsThisMonth} value={data.callsThisMonth} />
        <StatCard label={t.salesDashboard.salesThisMonth} value={data.salesThisMonth} />
        <StatCard label={t.salesDashboard.activeLeads} value={data.activeLeadsCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.salesDashboard.targetProgress}</CardTitle>
        </CardHeader>
        <CardContent>
          {data.employee.monthlyTarget ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {data.salesThisMonth} / {data.employee.monthlyTarget}
                </span>
                <span>{data.progressPct}%</span>
              </div>
              <ProgressBar percent={data.progressPct ?? 0} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t.salesDashboard.noTarget}</p>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border p-4">
        <h2 className="mb-4 font-semibold">{t.leads.callHistory}</h2>
        {data.activity.items.length === 0 && (
          <p className="text-sm text-muted-foreground">{t.leads.noNotesYet}</p>
        )}
        <div className="flex flex-col gap-3">
          {data.activity.items.map((item) => (
            <div key={item.id} className="border-b pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                {linkToLeads ? (
                  <Link
                    href={`/admin/leads/${item.lead.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {item.lead.customerName}
                  </Link>
                ) : (
                  <span className="text-sm font-medium">{item.lead.customerName}</span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="mt-1">
                <LeadStatusBadge status={item.statusAtTime} />
              </div>
              <p className="mt-1 text-sm">{item.note}</p>
            </div>
          ))}
        </div>
        <PaginationControls
          page={data.activity.page}
          pageCount={data.activity.pageCount}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
