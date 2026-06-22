"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { ProgressBar } from "@/components/progress-bar";
import { useTranslations } from "@/components/providers/locale-provider";
import { fetchTeamLeaderDashboard } from "@/lib/api/dashboard";

export function TeamLeaderDashboardClient() {
  const t = useTranslations();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "team-leader"],
    queryFn: fetchTeamLeaderDashboard,
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t.teamLeaderDashboard.title}</h1>

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
            <StatCard label={t.teamLeaderDashboard.teamSize} value={data.teamSize} />
            <StatCard label={t.teamLeaderDashboard.callsTodayTotal} value={data.callsTodayTotal} />
            <StatCard
              label={t.teamLeaderDashboard.salesThisMonthTotal}
              value={data.salesThisMonthTotal}
            />
            <StatCard
              label={t.teamLeaderDashboard.avgProgress}
              value={data.avgProgressPct !== null ? `${data.avgProgressPct}%` : "—"}
            />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-semibold">{t.teamLeaderDashboard.leaderboardTitle}</h2>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">{t.teamLeaderDashboard.rankLabel}</TableHead>
                    <TableHead>{t.employees.fullName}</TableHead>
                    <TableHead>{t.salesDashboard.callsToday}</TableHead>
                    <TableHead>{t.salesDashboard.salesThisMonth}</TableHead>
                    <TableHead>{t.employees.monthlyTarget}</TableHead>
                    <TableHead>{t.salesDashboard.targetProgress}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.employees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {t.teamLeaders.noEmployees}
                      </TableCell>
                    </TableRow>
                  )}
                  {data.employees.map((summary, index) => (
                    <TableRow key={summary.employee.id}>
                      <TableCell className="text-muted-foreground">
                        {index === 0 ? (
                          <Trophy className="size-4 text-amber-500" />
                        ) : (
                          index + 1
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/team-leader/employees/${summary.employee.id}`}
                          className="hover:underline"
                        >
                          {summary.employee.fullName}
                        </Link>
                      </TableCell>
                      <TableCell>{summary.callsToday}</TableCell>
                      <TableCell>{summary.salesThisMonth}</TableCell>
                      <TableCell>{summary.employee.monthlyTarget ?? "—"}</TableCell>
                      <TableCell>
                        {summary.progressPct !== null ? (
                          <div className="flex items-center gap-2">
                            <ProgressBar percent={summary.progressPct} />
                            <span className="text-xs text-muted-foreground">
                              {summary.progressPct}%
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
