import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { getEmployeeSummary } from "@/lib/stats/employee";
import { errorResponseBody } from "@/lib/errors";
import { LEAD_STATUS_VALUES } from "@/lib/api/leads";
import { buildDailyTrend, trendRangeStart } from "@/lib/stats/trend";

export async function GET() {
  try {
    const actor = await requireApiRole(["TEAM_LEADER"]);

    const employees = await prisma.user.findMany({
      where: { teamLeaderId: actor.id, role: "SALES_EMPLOYEE" },
      select: { id: true },
      orderBy: { fullName: "asc" },
    });
    const employeeIds = employees.map((e) => e.id);

    const summaries = (
      await Promise.all(employees.map((e) => getEmployeeSummary(e.id)))
    ).filter((s): s is NonNullable<typeof s> => s !== null);

    const statusCounts = await prisma.lead.groupBy({
      by: ["status"],
      where: { ownerEmployeeId: { in: employeeIds }, deletedAt: null },
      _count: true,
    });
    const countByStatus = new Map(statusCounts.map((s) => [s.status, s._count]));
    const statusBreakdown = LEAD_STATUS_VALUES.map((status) => ({
      status,
      count: countByStatus.get(status) ?? 0,
    }));

    const trendStart = trendRangeStart();
    const [callDates, saleDates] = await Promise.all([
      prisma.leadNote.findMany({
        where: { employeeId: { in: employeeIds }, createdAt: { gte: trendStart } },
        select: { createdAt: true },
      }),
      prisma.lead.findMany({
        where: {
          ownerEmployeeId: { in: employeeIds },
          status: "CLOSED_SALE",
          closedAt: { gte: trendStart },
          deletedAt: null,
        },
        select: { closedAt: true },
      }),
    ]);
    const trend = buildDailyTrend(
      callDates.map((n) => n.createdAt),
      saleDates.map((l) => l.closedAt as Date)
    );

    summaries.sort(
      (a, b) =>
        b.salesThisMonth - a.salesThisMonth ||
        b.callsThisMonth - a.callsThisMonth ||
        a.employee.fullName.localeCompare(b.employee.fullName)
    );

    const teamSize = summaries.length;
    const callsTodayTotal = summaries.reduce((sum, s) => sum + s.callsToday, 0);
    const salesThisMonthTotal = summaries.reduce((sum, s) => sum + s.salesThisMonth, 0);
    const withTarget = summaries.filter((s) => s.progressPct !== null);
    const avgProgressPct =
      withTarget.length > 0
        ? Math.round(withTarget.reduce((sum, s) => sum + (s.progressPct ?? 0), 0) / withTarget.length)
        : null;

    return NextResponse.json({
      teamSize,
      callsTodayTotal,
      salesThisMonthTotal,
      avgProgressPct,
      employees: summaries,
      statusBreakdown,
      trend,
    });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
