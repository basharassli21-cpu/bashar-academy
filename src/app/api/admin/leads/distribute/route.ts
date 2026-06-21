import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { distributeLeadsSchema } from "@/lib/validation/lead-import";
import { ValidationError, errorResponseBody } from "@/lib/errors";

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

    const openLeads = await prisma.lead.findMany({
      where: { ownerEmployeeId: null },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    if (openLeads.length > 0) {
      await prisma.$transaction(
        openLeads.map((lead, i) =>
          prisma.lead.update({
            where: { id: lead.id },
            data: { ownerEmployeeId: employees[i % employees.length].id },
          })
        )
      );
    }

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LEADS_DISTRIBUTED",
      details: { distributedCount: openLeads.length, employeeIds: employees.map((e) => e.id) },
    });

    return NextResponse.json({ distributedCount: openLeads.length });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
