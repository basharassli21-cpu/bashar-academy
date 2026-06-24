import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { errorResponseBody } from "@/lib/errors";
import { getNextAction, type NextActionCode } from "@/lib/lead-next-action";

const ACTION_PRIORITY: Record<NextActionCode, number> = {
  CALL_OVERDUE_FOLLOWUP: 0,
  CALL_DUE_TODAY: 1,
  CALL_FIRST_CONTACT: 2,
  SCHEDULE_FOLLOWUP: 3,
  RE_ENGAGE_STALE: 4,
  WAIT_FOLLOWUP_SCHEDULED: 5,
};

export async function GET() {
  try {
    const actor = await requireApiRole(["SALES_EMPLOYEE"]);

    const leads = await prisma.lead.findMany({
      where: {
        ownerEmployeeId: actor.id,
        deletedAt: null,
        status: { notIn: ["CLOSED_SALE", "CANCELLED", "NOT_INTERESTED"] },
      },
      select: {
        id: true,
        customerName: true,
        phone: true,
        status: true,
        lastContactDate: true,
        nextFollowupDate: true,
        tags: true,
      },
    });

    const items = leads
      .map((lead) => {
        const lastContactDate = lead.lastContactDate?.toISOString() ?? null;
        const nextFollowupDate = lead.nextFollowupDate?.toISOString() ?? null;
        const action = getNextAction({ status: lead.status, lastContactDate, nextFollowupDate });
        return { ...lead, lastContactDate, nextFollowupDate, action };
      })
      .filter(
        (lead): lead is typeof lead & { action: NextActionCode } =>
          lead.action !== null && lead.action !== "WAIT_FOLLOWUP_SCHEDULED"
      )
      .sort((a, b) => ACTION_PRIORITY[a.action] - ACTION_PRIORITY[b.action])
      .map((lead) => ({
        id: lead.id,
        customerName: lead.customerName,
        phone: lead.phone,
        status: lead.status,
        lastContactDate: lead.lastContactDate,
        nextFollowupDate: lead.nextFollowupDate,
        tags: lead.tags,
      }));

    return NextResponse.json({ items });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
