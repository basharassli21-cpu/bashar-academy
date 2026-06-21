import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { ConflictError, errorResponseBody } from "@/lib/errors";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["SALES_EMPLOYEE"]);
    const { id } = await params;

    // The WHERE clause is the lock: only one concurrent claim can match a row
    // that still has ownerEmployeeId IS NULL, so Postgres guarantees exactly
    // one of two simultaneous claims succeeds without needing a transaction.
    const result = await prisma.lead.updateMany({
      where: { id, ownerEmployeeId: null },
      data: { ownerEmployeeId: actor.id, claimedAt: new Date(), source: "OPENC_CLAIM" },
    });

    if (result.count === 0) {
      await writeAuditLog({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: "LEAD_CLAIM_FAILED",
        entityType: "Lead",
        entityId: id,
      });
      throw new ConflictError("openc.alreadyClaimed");
    }

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LEAD_CLAIMED",
      entityType: "Lead",
      entityId: id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
