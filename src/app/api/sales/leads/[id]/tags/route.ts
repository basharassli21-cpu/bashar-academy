import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { updateLeadTagsSchema } from "@/lib/validation/lead";
import { NotFoundError, ValidationError, errorResponseBody } from "@/lib/errors";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["SALES_EMPLOYEE"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateLeadTagsSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const { tags } = parsed.data;

    const existing = await prisma.lead.findFirst({
      where: { id, ownerEmployeeId: actor.id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundError();

    const updated = await prisma.lead.update({
      where: { id },
      data: { tags },
      select: { id: true, tags: true },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LEAD_UPDATED",
      entityType: "Lead",
      entityId: id,
      details: { tags },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
