import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { WebhookEvent } from "@/generated/prisma/enums";

export function generateWebhookSecret(): string {
  return randomBytes(32).toString("hex");
}

function signPayload(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

async function deliver(webhook: { id: string; url: string; secret: string }, payload: string) {
  const signature = signPayload(webhook.secret, payload);
  let status: string;
  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Webhook-Signature": signature },
      body: payload,
      signal: AbortSignal.timeout(10000),
    });
    status = res.ok ? "success" : `failed (HTTP ${res.status})`;
  } catch (error) {
    status = `failed (${error instanceof Error ? error.message : "unknown error"})`;
  }

  await prisma.webhook
    .update({ where: { id: webhook.id }, data: { lastTriggeredAt: new Date(), lastStatus: status } })
    .catch(() => {});

  return status;
}

export async function sendTestPing(webhookId: string) {
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId },
    select: { id: true, url: true, secret: true, event: true },
  });
  if (!webhook) return null;

  const payload = JSON.stringify({
    event: webhook.event,
    data: { test: true },
    timestamp: new Date().toISOString(),
  });
  return deliver(webhook, payload);
}

/**
 * Fire-and-forget by design: webhook delivery must never block or fail the
 * CRM operation that triggered it (e.g. a slow/unreachable receiver must not
 * delay lead creation). Callers should not await this.
 */
export async function triggerWebhooks(event: WebhookEvent, data: Record<string, unknown>) {
  const webhooks = await prisma.webhook.findMany({ where: { event, isActive: true } });
  if (webhooks.length === 0) return;

  const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  await Promise.all(webhooks.map((webhook) => deliver(webhook, payload)));
}
