import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { getEmployeeSummary } from "@/lib/stats/employee";
import { errorResponseBody } from "@/lib/errors";

export async function GET() {
  try {
    const actor = await requireApiRole(["TEAM_LEADER"]);

    const employees = await prisma.user.findMany({
      where: { teamLeaderId: actor.id, role: "SALES_EMPLOYEE" },
      select: { id: true },
      orderBy: { fullName: "asc" },
    });

    const summaries = (
      await Promise.all(employees.map((e) => getEmployeeSummary(e.id)))
    ).filter((s): s is NonNullable<typeof s> => s !== null);

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
    });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
