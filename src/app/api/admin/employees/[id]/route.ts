import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { hashPassword } from "@/lib/auth/password";
import { updateEmployeeSchema } from "@/lib/validation/employee";
import { NotFoundError, ValidationError, errorResponseBody } from "@/lib/errors";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateEmployeeSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const data = parsed.data;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError();

    if (data.teamLeaderId) {
      if (existing.role !== "SALES_EMPLOYEE") {
        throw new ValidationError("Only sales employees can have a team leader");
      }
      const leader = await prisma.user.findUnique({ where: { id: data.teamLeaderId } });
      if (!leader || leader.role !== "TEAM_LEADER") {
        throw new ValidationError("teamLeaderId must reference a Team Leader");
      }
    }

    const passwordHash = data.newPassword ? await hashPassword(data.newPassword) : undefined;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        monthlyTarget: data.monthlyTarget,
        teamLeaderId: data.teamLeaderId,
        ...(passwordHash ? { passwordHash, sessionVersion: { increment: 1 } } : {}),
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        monthlyTarget: true,
        isActive: true,
        createdAt: true,
        teamLeaderId: true,
      },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "EMPLOYEE_UPDATED",
      entityType: "User",
      entityId: id,
      details: { fullNameChanged: !!data.fullName, passwordChanged: !!passwordHash },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
