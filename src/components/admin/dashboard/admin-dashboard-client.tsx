"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { PipelineFunnel } from "@/components/pipeline-funnel";
import { TrendChart } from "@/components/trend-chart";
import { useTranslations } from "@/components/providers/locale-provider";
import { fetchAdminDashboard } from "@/lib/api/dashboard";

export function AdminDashboardClient() {
  const t = useTranslations();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: fetchAdminDashboard,
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t.adminDashboard.title}</h1>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label={t.adminDashboard.activeEmployees} value={data.activeSalesEmployees} />
          <StatCard label={t.adminDashboard.totalLeads} value={data.totalLeads} />
          <StatCard label={t.adminDashboard.freshLeads} value={data.freshLeadsCount} />
          <StatCard label={t.adminDashboard.openPool} value={data.openPoolCount} />
          <StatCard label={t.adminDashboard.salesToday} value={data.closedToday} />
          <StatCard label={t.adminDashboard.closedThisMonth} value={data.closedThisMonth} />
          <StatCard label={t.adminDashboard.callsToday} value={data.callsToday} />
          <StatCard label={t.adminDashboard.callsThisMonth} value={data.callsThisMonth} />
          <StatCard label={t.adminDashboard.activeTeamLeaders} value={data.activeTeamLeaders} />
          <StatCard label={t.adminDashboard.newLeadsToday} value={data.newLeadsToday} />
          <StatCard label={t.adminDashboard.conversionRate} value={`${data.conversionRate}%`} />
          <StatCard
            label={t.adminDashboard.overdueFollowups}
            value={data.overdueFollowups}
            tone="warning"
          />
        </div>
      )}

      {data && <PipelineFunnel data={data.statusBreakdown} />}

      {data && (
        <TrendChart
          title={t.trend.adminTitle}
          description={t.trend.adminDescription}
          data={data.trend}
          primaryLabel={t.trend.newLeadsLabel}
          secondaryLabel={t.trend.closedSalesLabel}
        />
      )}
    </div>
  );
}
