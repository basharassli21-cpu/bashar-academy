import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { errorResponseBody } from "@/lib/errors";
import { LEAD_STATUS_VALUES } from "@/lib/api/leads";
import { buildDailyTrend, trendRangeStart } from "@/lib/stats/trend";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  try {
    await requireApiRole(["ADMIN"]);
    const todayStart = startOfToday();
    const monthStart = startOfMonth();

    const [
      totalLeads,
      openPoolCount,
      activeSalesEmployees,
      activeTeamLeaders,
      freshLeadsCount,
      newLeadsToday,
      closedToday,
      callsToday,
      callsThisMonth,
      closedThisMonth,
      totalClosed,
      overdueFollowups,
      statusCounts,
    ] = await Promise.all([
      prisma.lead.count({ where: { deletedAt: null } }),
      prisma.lead.count({ where: { ownerEmployeeId: null, notes: { some: {} }, deletedAt: null } }),
      prisma.user.count({ where: { role: "SALES_EMPLOYEE", isActive: true } }),
      prisma.user.count({ where: { role: "TEAM_LEADER", isActive: true } }),
      prisma.lead.count({ where: { ownerEmployeeId: null, notes: { none: {} }, deletedAt: null } }),
      prisma.lead.count({ where: { createdAt: { gte: todayStart }, deletedAt: null } }),
      prisma.lead.count({
        where: { status: "CLOSED_SALE", closedAt: { gte: todayStart }, deletedAt: null },
      }),
      prisma.leadNote.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.leadNote.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.lead.count({
        where: { status: "CLOSED_SALE", closedAt: { gte: monthStart }, deletedAt: null },
      }),
      prisma.lead.count({ where: { status: "CLOSED_SALE", deletedAt: null } }),
      prisma.lead.count({
        where: {
          ownerEmployeeId: { not: null },
          nextFollowupDate: { lt: todayStart },
          status: { notIn: ["CLOSED_SALE", "CANCELLED"] },
          deletedAt: null,
        },
      }),
      prisma.lead.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
    ]);

    const conversionRate = totalLeads > 0 ? Math.round((totalClosed / totalLeads) * 100) : 0;

    const countByStatus = new Map(statusCounts.map((s) => [s.status, s._count]));
    const statusBreakdown = LEAD_STATUS_VALUES.map((status) => ({
      status,
      count: countByStatus.get(status) ?? 0,
    }));

    const trendStart = trendRangeStart();
    const [newLeadDates, closedSaleDates] = await Promise.all([
      prisma.lead.findMany({
        where: { createdAt: { gte: trendStart }, deletedAt: null },
        select: { createdAt: true },
      }),
      prisma.lead.findMany({
        where: { status: "CLOSED_SALE", closedAt: { gte: trendStart }, deletedAt: null },
        select: { closedAt: true },
      }),
    ]);
    const trend = buildDailyTrend(
      newLeadDates.map((l) => l.createdAt),
      closedSaleDates.map((l) => l.closedAt as Date)
    );

    return NextResponse.json({
      totalLeads,
      openPoolCount,
      activeSalesEmployees,
      activeTeamLeaders,
      freshLeadsCount,
      newLeadsToday,
      closedToday,
      callsToday,
      callsThisMonth,
      closedThisMonth,
      conversionRate,
      overdueFollowups,
      statusBreakdown,
      trend,
    });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
