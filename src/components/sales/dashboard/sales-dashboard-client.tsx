"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { TargetProgressCard } from "@/components/target-progress-card";
import { GamificationBadges } from "@/components/gamification";
import { TrendChart } from "@/components/trend-chart";
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
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">{t.salesDashboard.title}</h1>
        {data && (
          <GamificationBadges
            rank={null}
            salesThisMonth={data.salesThisMonth}
            progressPct={data.progressPct}
            callsToday={data.callsToday}
          />
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <StatCard label={t.salesDashboard.callsToday} value={data.callsToday} />
            <StatCard label={t.salesDashboard.callsThisMonth} value={data.callsThisMonth} />
            <StatCard label={t.salesDashboard.salesThisMonth} value={data.salesThisMonth} />
            <StatCard label={t.salesDashboard.activeLeads} value={data.activeLeadsCount} />
            <StatCard label={t.gamification.streakStatCardLabel} value={data.streakDays} />
          </div>

          <TargetProgressCard
            monthlyTarget={data.employee.monthlyTarget}
            salesThisMonth={data.salesThisMonth}
            progressPct={data.progressPct}
            expectedPacePct={data.expectedPacePct}
          />

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

          <TrendChart
            title={t.trend.myTitle}
            description={t.trend.myDescription}
            data={data.trend}
            primaryLabel={t.trend.callsLabel}
            secondaryLabel={t.trend.salesLabel}
          />
        </>
      )}
    </div>
  );
}
