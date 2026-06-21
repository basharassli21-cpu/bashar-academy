import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { errorResponseBody } from "@/lib/errors";

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
      newLeadsToday,
      callsToday,
      closedThisMonth,
      totalClosed,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { ownerEmployeeId: null } }),
      prisma.user.count({ where: { role: "SALES_EMPLOYEE", isActive: true } }),
      prisma.user.count({ where: { role: "TEAM_LEADER", isActive: true } }),
      prisma.lead.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.leadNote.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.lead.count({ where: { status: "CLOSED_SALE", closedAt: { gte: monthStart } } }),
      prisma.lead.count({ where: { status: "CLOSED_SALE" } }),
    ]);

    const conversionRate = totalLeads > 0 ? Math.round((totalClosed / totalLeads) * 100) : 0;

    return NextResponse.json({
      totalLeads,
      openPoolCount,
      activeSalesEmployees,
      activeTeamLeaders,
      newLeadsToday,
      callsToday,
      closedThisMonth,
      conversionRate,
    });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
