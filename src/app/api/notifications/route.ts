import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { errorResponseBody } from "@/lib/errors";
import type { Notification } from "@/generated/prisma/client";

function digestCountOf(notification: Notification): number {
  const data = notification.data;
  if (data && typeof data === "object" && "count" in data) {
    const count = Number((data as Record<string, unknown>).count);
    if (Number.isFinite(count) && count > 0) return count;
  }
  return 1;
}

export async function GET() {
  try {
    const actor = await requireApiUser();

    const [user, rows, unreadCount] = await Promise.all([
      prisma.user.findUnique({ where: { id: actor.id }, select: { notificationDigestMode: true } }),
      prisma.notification.findMany({
        where: { userId: actor.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({ where: { userId: actor.id, isRead: false } }),
    ]);

    if (!user?.notificationDigestMode) {
      return NextResponse.json({ items: rows, unreadCount });
    }

    const unread = rows.filter((r) => !r.isRead);
    const read = rows.filter((r) => r.isRead);

    const unreadByType = new Map<string, Notification[]>();
    for (const row of unread) {
      const group = unreadByType.get(row.type);
      if (group) group.push(row);
      else unreadByType.set(row.type, [row]);
    }

    const digestItems = Array.from(unreadByType.entries()).map(([type, group]) => ({
      id: `digest:${type}`,
      type,
      data: { count: group.reduce((sum, row) => sum + digestCountOf(row), 0) },
      entityType: null,
      entityId: null,
      isRead: false,
      createdAt: group[0].createdAt,
    }));

    return NextResponse.json({ items: [...digestItems, ...read], unreadCount });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
