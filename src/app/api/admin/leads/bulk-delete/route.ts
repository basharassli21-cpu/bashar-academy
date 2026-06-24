import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { bulkDeleteLeadsSchema } from "@/lib/validation/lead";
import { ValidationError, errorResponseBody } from "@/lib/errors";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const body = await request.json();
    const parsed = bulkDeleteLeadsSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const { leadIds } = parsed.data;

    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds }, deletedAt: null },
      select: { id: true, customerName: true, phone: true, ownerEmployeeId: true },
    });

    const result = await prisma.lead.updateMany({
      where: { id: { in: leadIds }, deletedAt: null },
      data: { deletedAt: new Date(), deletedById: actor.id },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LEADS_BULK_DELETED",
      details: { deletedCount: result.count, snapshots: leads },
    });

    return NextResponse.json({ deletedCount: result.count });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
