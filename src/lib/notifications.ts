import "server-only";
import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  data?: Prisma.InputJsonValue;
  entityType?: string;
  entityId?: string;
}) {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      data: params.data,
      entityType: params.entityType,
      entityId: params.entityId,
    },
  });
}
