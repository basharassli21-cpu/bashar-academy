import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { assignEmployeeSchema } from "@/lib/validation/employee";
import { ValidationError, errorResponseBody } from "@/lib/errors";

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

    await prisma.user.updateMany({
      where: { id: parsed.data.employeeId, teamLeaderId },
      data: { teamLeaderId: null },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "TEAM_LEADER_UNASSIGNED",
      entityType: "User",
      entityId: parsed.data.employeeId,
      details: { teamLeaderId, employeeId: parsed.data.employeeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
