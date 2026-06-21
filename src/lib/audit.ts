import "server-only";
import { prisma } from "@/lib/prisma";
import type { AuditAction, Role } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export async function writeAuditLog(params: {
  actorUserId?: string | null;
  actorRole?: Role | null;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId ?? null,
      actorRole: params.actorRole ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
      ipAddress: params.ipAddress ?? null,
    },
  });
}
