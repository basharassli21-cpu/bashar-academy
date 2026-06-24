export type NotificationType = "LEAD_ASSIGNED" | "TEAM_ASSIGNMENT";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  data: Record<string, unknown> | null;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
};

async function parseOrThrow(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data;
}

export async function fetchNotifications(): Promise<{
  items: NotificationItem[];
  unreadCount: number;
}> {
  const res = await fetch("/api/notifications");
  return parseOrThrow(res);
}

export async function markNotificationRead(id: string) {
  const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  return parseOrThrow(res);
}

export async function markAllNotificationsRead() {
  const res = await fetch("/api/notifications/mark-all-read", { method: "PATCH" });
  return parseOrThrow(res);
}

export async function markNotificationTypeRead(type: NotificationType) {
  const res = await fetch("/api/notifications/mark-type-read", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });
  return parseOrThrow(res);
}

export type NotificationPreferences = {
  notificationsMuted: boolean;
  notificationDigestMode: boolean;
};

export async function updateNotificationPreferences(
  input: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const res = await fetch("/api/notifications/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}
