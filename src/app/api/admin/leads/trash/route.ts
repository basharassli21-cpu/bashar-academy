import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { errorResponseBody } from "@/lib/errors";

export async function GET(request: Request) {
  try {
    await requireApiRole(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    const where = { deletedAt: { not: null } } as const;

    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        select: {
          id: true,
          customerName: true,
          phone: true,
          status: true,
          owner: { select: { id: true, fullName: true } },
          deletedAt: true,
          deletedBy: { select: { id: true, fullName: true } },
          createdAt: true,
        },
        orderBy: { deletedAt: "desc" },
        skip,
        take,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json(paginatedResponse(items, total, page, pageSize));
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
