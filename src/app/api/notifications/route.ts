import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { errorResponseBody } from "@/lib/errors";

export async function GET() {
  try {
    const user = await requireApiUser();

    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
    ]);

    return NextResponse.json({ items, unreadCount });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
