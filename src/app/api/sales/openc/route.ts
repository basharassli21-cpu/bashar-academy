import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { errorResponseBody } from "@/lib/errors";
import type { Prisma } from "@/generated/prisma/client";

// Phone is intentionally absent from this select. The pool must never be able
// to leak contact info before a lead is claimed, so the field is structurally
// unreachable here rather than just hidden in the UI.
export async function GET(request: Request) {
  try {
    await requireApiRole(["SALES_EMPLOYEE"]);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    const where: Prisma.LeadWhereInput = {
      ownerEmployeeId: null,
      ...(q ? { customerName: { contains: q, mode: "insensitive" } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        select: {
          id: true,
          customerName: true,
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
