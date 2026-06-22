import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { errorResponseBody } from "@/lib/errors";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: Request) {
  try {
    await requireApiRole(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    // bucket=fresh -> never-contacted unowned leads (admin-distribute only).
    // Default ("open_sea") -> previously-contacted unowned leads, the same
    // set employees can see and claim. The two are mutually exclusive.
    const bucket = searchParams.get("bucket") === "fresh" ? "fresh" : "open_sea";
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    const where: Prisma.LeadWhereInput = {
      ownerEmployeeId: null,
      notes: bucket === "fresh" ? { none: {} } : { some: {} },
      ...(q
        ? {
            OR: [
              { customerName: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        select: {
          id: true,
          customerName: true,
          phone: true,
          status: true,
          pulledToOpenAt: true,
          createdAt: true,
        },
        orderBy: { pulledToOpenAt: "desc" },
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
