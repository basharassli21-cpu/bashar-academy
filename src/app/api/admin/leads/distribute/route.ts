import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { distributeLeadsSchema } from "@/lib/validation/lead-import";
import { ValidationError, errorResponseBody } from "@/lib/errors";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const body = await request.json();
    const parsed = distributeLeadsSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);

    const employees = await prisma.user.findMany({
      where: { id: { in: parsed.data.employeeIds }, role: "SALES_EMPLOYEE", isActive: true },
    });
    if (employees.length === 0) {
      throw new ValidationError("employeeIds must reference at least one active sales employee");
    }

    // Distribute only ever sweeps Fresh (never-contacted) leads. Open Sea
    // leads already have a path out of the pool (employee self-claim) and
    // must not be silently reassigned out from under that.
    const openLeads = await prisma.lead.findMany({
      where: { ownerEmployeeId: null, notes: { none: {} }, deletedAt: null },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    const countByEmployeeId = new Map<string, number>();

    if (openLeads.length > 0) {
      await prisma.$transaction(
        openLeads.map((lead, i) => {
          const employeeId = employees[i % employees.length].id;
          countByEmployeeId.set(employeeId, (countByEmployeeId.get(employeeId) ?? 0) + 1);
          return prisma.lead.update({
            where: { id: lead.id },
            data: { ownerEmployeeId: employeeId },
          });
        })
      );
    }

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LEADS_DISTRIBUTED",
      details: { distributedCount: openLeads.length, employeeIds: employees.map((e) => e.id) },
    });

    await Promise.all(
      Array.from(countByEmployeeId.entries()).map(([employeeId, count]) =>
        createNotification({ userId: employeeId, type: "LEAD_ASSIGNED", data: { count } })
      )
    );

    return NextResponse.json({ distributedCount: openLeads.length });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
