import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { applyLeadUpdate } from "@/lib/leads/update-lead";
import { updateLeadSchema } from "@/lib/validation/lead";
import { NotFoundError, ValidationError, errorResponseBody } from "@/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["SALES_EMPLOYEE"]);
    const { id } = await params;

    const lead = await prisma.lead.findFirst({
      where: { id, ownerEmployeeId: actor.id },
      select: {
        id: true,
        customerName: true,
        phone: true,
        status: true,
        lastContactDate: true,
        nextFollowupDate: true,
        closedAt: true,
        tags: true,
        createdAt: true,
        notes: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            note: true,
            statusAtTime: true,
            createdAt: true,
            employee: { select: { id: true, fullName: true } },
          },
        },
      },
    });
    if (!lead) throw new NotFoundError();

    return NextResponse.json(lead);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["SALES_EMPLOYEE"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateLeadSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const data = parsed.data;

    const result = await applyLeadUpdate({
      leadId: id,
      employeeId: actor.id,
      ownerEmployeeId: actor.id,
      status: data.status,
      note: data.note,
      nextFollowupDate: data.nextFollowupDate,
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LEAD_UPDATED",
      entityType: "Lead",
      entityId: id,
      details: { status: data.status },
    });

    return NextResponse.json(result);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
