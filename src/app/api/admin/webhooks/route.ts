import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { generateWebhookSecret } from "@/lib/webhooks";
import { createWebhookSchema } from "@/lib/validation/webhook";
import { ValidationError, errorResponseBody } from "@/lib/errors";

export async function GET() {
  try {
    await requireApiRole(["ADMIN"]);
    const webhooks = await prisma.webhook.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        url: true,
        event: true,
        isActive: true,
        lastTriggeredAt: true,
        lastStatus: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ items: webhooks });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const body = await request.json();
    const parsed = createWebhookSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const data = parsed.data;

    const secret = generateWebhookSecret();
    const webhook = await prisma.webhook.create({
      data: { url: data.url, event: data.event, secret },
      select: { id: true, url: true, event: true, isActive: true, createdAt: true },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "WEBHOOK_CREATED",
      entityType: "Webhook",
      entityId: webhook.id,
      details: { url: webhook.url, event: webhook.event },
    });

    return NextResponse.json({ ...webhook, secret }, { status: 201 });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
