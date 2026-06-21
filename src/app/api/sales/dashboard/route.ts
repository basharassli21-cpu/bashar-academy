import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { getEmployeeSummary } from "@/lib/stats/employee";
import { errorResponseBody } from "@/lib/errors";

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function GET() {
  try {
    const actor = await requireApiRole(["SALES_EMPLOYEE"]);

    const [summary, dueToday] = await Promise.all([
      getEmployeeSummary(actor.id),
      prisma.lead.findMany({
        where: {
          ownerEmployeeId: actor.id,
          nextFollowupDate: { lte: endOfToday() },
          status: { notIn: ["CLOSED_SALE", "CANCELLED"] },
        },
        select: { id: true, customerName: true, status: true, nextFollowupDate: true },
        orderBy: { nextFollowupDate: "asc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({ ...summary, dueToday });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
