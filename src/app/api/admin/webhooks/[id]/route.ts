import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { updateWebhookSchema } from "@/lib/validation/webhook";
import { NotFoundError, ValidationError, errorResponseBody } from "@/lib/errors";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateWebhookSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const data = parsed.data;

    const existing = await prisma.webhook.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundError();

    const webhook = await prisma.webhook.update({
      where: { id },
      data,
      select: { id: true, url: true, event: true, isActive: true },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "WEBHOOK_UPDATED",
      entityType: "Webhook",
      entityId: id,
      details: data,
    });

    return NextResponse.json(webhook);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const { id } = await params;

    const existing = await prisma.webhook.findUnique({ where: { id }, select: { url: true, event: true } });
    if (!existing) throw new NotFoundError();

    await prisma.webhook.delete({ where: { id } });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "WEBHOOK_DELETED",
      entityType: "Webhook",
      entityId: id,
      details: { url: existing.url, event: existing.event },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
