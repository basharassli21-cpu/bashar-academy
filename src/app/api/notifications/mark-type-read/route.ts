import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { ValidationError, errorResponseBody } from "@/lib/errors";
import type { NotificationType } from "@/generated/prisma/enums";

const NOTIFICATION_TYPES: NotificationType[] = ["LEAD_ASSIGNED", "TEAM_ASSIGNMENT"];

export async function PATCH(request: Request) {
  try {
    const actor = await requireApiUser();
    const body = await request.json();
    const type = body?.type;
    if (typeof type !== "string" || !NOTIFICATION_TYPES.includes(type as NotificationType)) {
      throw new ValidationError("type must be a valid notification type");
    }

    await prisma.notification.updateMany({
      where: { userId: actor.id, isRead: false, type: type as NotificationType },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
