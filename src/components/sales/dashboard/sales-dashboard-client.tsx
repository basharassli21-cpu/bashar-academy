"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { useTranslations } from "@/components/providers/locale-provider";
import { fetchSalesDashboard } from "@/lib/api/dashboard";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function SalesDashboardClient() {
  const t = useTranslations();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "sales"],
    queryFn: fetchSalesDashboard,
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t.salesDashboard.title}</h1>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {data && (
        <>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {t.salesDashboard.dueToday}
                {data.dueToday.length > 0 && (
                  <Badge variant="secondary">{data.dueToday.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.dueToday.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.salesDashboard.noDueToday}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {data.dueToday.map((lead) => {
                    const isOverdue =
                      !!lead.nextFollowupDate && new Date(lead.nextFollowupDate) < startOfToday();
                    return (
                      <Link
                        key={lead.id}
                        href={`/sales/leads/${lead.id}`}
                        className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm hover:bg-accent"
                      >
                        <span className="font-medium">{lead.customerName}</span>
                        <span className="flex items-center gap-2">
                          <span
                            className={
                              isOverdue
                                ? "text-xs font-medium text-destructive"
                                : "text-xs text-muted-foreground"
                            }
                          >
                            {isOverdue ? t.salesDashboard.overdue : t.salesDashboard.dueTodayLabel}
                          </span>
                          <LeadStatusBadge status={lead.status} />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
