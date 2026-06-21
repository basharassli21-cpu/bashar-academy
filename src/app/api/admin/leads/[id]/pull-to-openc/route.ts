import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { NotFoundError, errorResponseBody } from "@/lib/errors";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const { id } = await params;

    const lead = await prisma.lead.findUnique({ where: { id }, select: { ownerEmployeeId: true } });
    if (!lead) throw new NotFoundError();

    const updated = await prisma.lead.update({
      where: { id },
      data: { ownerEmployeeId: null, pulledToOpenAt: new Date() },
      select: { id: true, ownerEmployeeId: true },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LEAD_PULLED_TO_OPENC",
      entityType: "Lead",
      entityId: id,
      details: { fromEmployeeId: lead.ownerEmployeeId },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
