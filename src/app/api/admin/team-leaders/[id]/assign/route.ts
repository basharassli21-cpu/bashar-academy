import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { assignEmployeeSchema } from "@/lib/validation/employee";
import { NotFoundError, ValidationError, errorResponseBody } from "@/lib/errors";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const { id: teamLeaderId } = await params;
    const body = await request.json();
    const parsed = assignEmployeeSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);

    const leader = await prisma.user.findUnique({ where: { id: teamLeaderId } });
    if (!leader || leader.role !== "TEAM_LEADER") throw new NotFoundError("Team leader not found");

    const employee = await prisma.user.findUnique({ where: { id: parsed.data.employeeId } });
    if (!employee || employee.role !== "SALES_EMPLOYEE") {
      throw new ValidationError("Target must be a sales employee");
    }

    await prisma.user.update({
      where: { id: employee.id },
      data: { teamLeaderId },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "TEAM_LEADER_ASSIGNED",
      entityType: "User",
      entityId: employee.id,
      details: { teamLeaderId, employeeId: employee.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
