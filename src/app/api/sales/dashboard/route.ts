import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { getEmployeeSummary } from "@/lib/stats/employee";
import { buildDailyTrend, trendRangeStart } from "@/lib/stats/trend";
import { errorResponseBody } from "@/lib/errors";

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function GET() {
  try {
    const actor = await requireApiRole(["SALES_EMPLOYEE"]);
    const trendStart = trendRangeStart();

    const [summary, dueToday, callDates, saleDates] = await Promise.all([
      getEmployeeSummary(actor.id),
      prisma.lead.findMany({
        where: {
          ownerEmployeeId: actor.id,
          nextFollowupDate: { lte: endOfToday() },
          status: { notIn: ["CLOSED_SALE", "CANCELLED"] },
          deletedAt: null,
        },
        select: { id: true, customerName: true, status: true, nextFollowupDate: true },
        orderBy: { nextFollowupDate: "asc" },
        take: 10,
      }),
      prisma.leadNote.findMany({
        where: { employeeId: actor.id, createdAt: { gte: trendStart } },
        select: { createdAt: true },
      }),
      prisma.lead.findMany({
        where: {
          ownerEmployeeId: actor.id,
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

    return NextResponse.json({ ...summary, dueToday, trend });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
