import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { transferLeadSchema } from "@/lib/validation/lead";
import { NotFoundError, ValidationError, errorResponseBody } from "@/lib/errors";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = transferLeadSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const { employeeId } = parsed.data;

    const lead = await prisma.lead.findUnique({ where: { id }, select: { ownerEmployeeId: true } });
    if (!lead) throw new NotFoundError();

    const employee = await prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee || employee.role !== "SALES_EMPLOYEE" || !employee.isActive) {
      throw new ValidationError("employeeId must reference an active sales employee");
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: { ownerEmployeeId: employeeId },
      select: { id: true, ownerEmployeeId: true },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LEAD_TRANSFERRED",
      entityType: "Lead",
      entityId: id,
      details: { fromEmployeeId: lead.ownerEmployeeId, toEmployeeId: employeeId },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
