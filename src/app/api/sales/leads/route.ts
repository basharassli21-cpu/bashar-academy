import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { errorResponseBody } from "@/lib/errors";
import type { Prisma } from "@/generated/prisma/client";
import type { LeadStatus } from "@/generated/prisma/enums";

const SORTABLE_FIELDS = {
  customerName: "customerName",
  status: "status",
  lastContactDate: "lastContactDate",
  nextFollowupDate: "nextFollowupDate",
} as const;

export async function GET(request: Request) {
  try {
    const actor = await requireApiRole(["SALES_EMPLOYEE"]);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status") as LeadStatus | null;
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    const sortByParam = searchParams.get("sortBy");
    const sortDir: "asc" | "desc" = searchParams.get("sortDir") === "asc" ? "asc" : "desc";
    const sortField =
      sortByParam && sortByParam in SORTABLE_FIELDS
        ? SORTABLE_FIELDS[sortByParam as keyof typeof SORTABLE_FIELDS]
        : "createdAt";
    const sortOrderBy: Prisma.LeadOrderByWithRelationInput = { [sortField]: sortDir };

    const where: Prisma.LeadWhereInput = {
      ownerEmployeeId: actor.id,
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { customerName: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        select: {
          id: true,
          customerName: true,
          phone: true,
          status: true,
          lastContactDate: true,
          nextFollowupDate: true,
          tags: true,
          createdAt: true,
          notes: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { note: true },
          },
        },
        orderBy: sortOrderBy,
        skip,
        take,
      }),
      prisma.lead.count({ where }),
    ]);

    const items = leads.map(({ notes, ...lead }) => ({
      ...lead,
      latestNote: notes[0]?.note ?? null,
    }));

    return NextResponse.json(paginatedResponse(items, total, page, pageSize));
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
