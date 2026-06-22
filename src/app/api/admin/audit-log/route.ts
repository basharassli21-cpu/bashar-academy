import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { errorResponseBody } from "@/lib/errors";
import type { Prisma } from "@/generated/prisma/client";
import type { AuditAction } from "@/generated/prisma/enums";

export async function GET(request: Request) {
  try {
    await requireApiRole(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") as AuditAction | null;
    const actorUserId = searchParams.get("actorUserId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    const where: Prisma.AuditLogWhereInput = {
      ...(action ? { action } : {}),
      ...(actorUserId ? { actorUserId } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        select: {
          id: true,
          action: true,
          actorRole: true,
          entityType: true,
          entityId: true,
          details: true,
          createdAt: true,
          actor: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json(paginatedResponse(items, total, page, pageSize));
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
