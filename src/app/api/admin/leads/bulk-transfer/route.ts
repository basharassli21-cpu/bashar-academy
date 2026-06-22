import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { bulkTransferLeadsSchema } from "@/lib/validation/lead";
import { ValidationError, errorResponseBody } from "@/lib/errors";

export async function PATCH(request: Request) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const body = await request.json();
    const parsed = bulkTransferLeadsSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const { leadIds, employeeId } = parsed.data;

    const employee = await prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee || employee.role !== "SALES_EMPLOYEE" || !employee.isActive) {
      throw new ValidationError("employeeId must reference an active sales employee");
    }

    const result = await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: { ownerEmployeeId: employeeId },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LEADS_BULK_TRANSFERRED",
      details: { leadIds, toEmployeeId: employeeId, transferredCount: result.count },
    });

    if (result.count > 0) {
      await createNotification({
        userId: employeeId,
        type: "LEAD_ASSIGNED",
        data: { count: result.count },
      });
    }

    return NextResponse.json({ transferredCount: result.count });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
