import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { getEmployeeSummary, getEmployeeActivity } from "@/lib/stats/employee";
import { buildDailyTrend, trendRangeStart } from "@/lib/stats/trend";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { NotFoundError, errorResponseBody } from "@/lib/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["TEAM_LEADER"]);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const { page, skip, take, pageSize } = parsePagination(searchParams);

    const employee = await prisma.user.findFirst({
      where: { id, teamLeaderId: actor.id, role: "SALES_EMPLOYEE" },
      select: { id: true },
    });
    if (!employee) throw new NotFoundError();

    const summary = await getEmployeeSummary(id);
    if (!summary) throw new NotFoundError();

    const trendStart = trendRangeStart();
    const { items, total } = await getEmployeeActivity(id, { skip, take });
    const [callDates, saleDates] = await Promise.all([
      prisma.leadNote.findMany({
        where: { employeeId: id, createdAt: { gte: trendStart } },
        select: { createdAt: true },
      }),
      prisma.lead.findMany({
        where: { ownerEmployeeId: id, status: "CLOSED_SALE", closedAt: { gte: trendStart }, deletedAt: null },
        select: { closedAt: true },
      }),
    ]);
    const trend = buildDailyTrend(
      callDates.map((n) => n.createdAt),
      saleDates.map((l) => l.closedAt as Date)
    );

    return NextResponse.json({
      ...summary,
      activity: paginatedResponse(items, total, page, pageSize),
      trend,
    });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
