export const WEBHOOK_EVENT_VALUES = ["LEAD_CREATED", "LEAD_CLOSED_SALE", "LEAD_ASSIGNED"] as const;

export type WebhookEventValue = (typeof WEBHOOK_EVENT_VALUES)[number];

export type WebhookListItem = {
  id: string;
  url: string;
  event: WebhookEventValue;
  isActive: boolean;
  lastTriggeredAt: string | null;
  lastStatus: string | null;
  createdAt: string;
};

async function parseOrThrow(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data;
}

export async function fetchWebhooks(): Promise<{ items: WebhookListItem[] }> {
  const res = await fetch("/api/admin/webhooks");
  return parseOrThrow(res);
}

export async function createWebhook(input: {
  url: string;
  event: WebhookEventValue;
}): Promise<WebhookListItem & { secret: string }> {
  const res = await fetch("/api/admin/webhooks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function updateWebhook(
  id: string,
  input: { url?: string; event?: WebhookEventValue; isActive?: boolean }
): Promise<WebhookListItem> {
  const res = await fetch(`/api/admin/webhooks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function deleteWebhook(id: string): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/admin/webhooks/${id}`, { method: "DELETE" });
  return parseOrThrow(res);
}

export async function testWebhook(id: string): Promise<{ status: string }> {
  const res = await fetch(`/api/admin/webhooks/${id}/test`, { method: "POST" });
  return parseOrThrow(res);
}
