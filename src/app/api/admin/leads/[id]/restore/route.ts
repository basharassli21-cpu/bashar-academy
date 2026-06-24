import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { NotFoundError, errorResponseBody } from "@/lib/errors";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const { id } = await params;

    const lead = await prisma.lead.findFirst({
      where: { id, deletedAt: { not: null } },
      select: { customerName: true },
    });
    if (!lead) throw new NotFoundError();

    const restored = await prisma.lead.update({
      where: { id },
      data: { deletedAt: null, deletedById: null },
      select: { id: true, customerName: true },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LEAD_RESTORED",
      entityType: "Lead",
      entityId: id,
      details: { customerName: lead.customerName },
    });

    return NextResponse.json(restored);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
