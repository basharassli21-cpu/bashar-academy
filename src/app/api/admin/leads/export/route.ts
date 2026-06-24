import { NextResponse } from "next/server";
import Papa from "papaparse";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { errorResponseBody } from "@/lib/errors";
import type { Prisma } from "@/generated/prisma/client";
import type { LeadStatus } from "@/generated/prisma/enums";

export const maxDuration = 60;

function formatDate(value: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : "";
}

export async function GET(request: Request) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status") as LeadStatus | null;

    const where: Prisma.LeadWhereInput = {
      deletedAt: null,
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

    const leads = await prisma.lead.findMany({
      where,
      select: {
        customerName: true,
        phone: true,
        status: true,
        owner: { select: { fullName: true } },
        lastContactDate: true,
        nextFollowupDate: true,
        tags: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const csv = Papa.unparse({
      fields: [
        "Name",
        "Phone Number",
        "Status",
        "Owner",
        "Last Contact Date",
        "Next Follow-up Date",
        "Tags",
        "Created Date",
      ],
      data: leads.map((lead) => [
        lead.customerName,
        lead.phone,
        lead.status,
        lead.owner?.fullName ?? "",
        formatDate(lead.lastContactDate),
        formatDate(lead.nextFollowupDate),
        lead.tags.join("; "),
        formatDate(lead.createdAt),
      ]),
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LEADS_EXPORTED",
      details: { count: leads.length, q: q || null, status: status || null },
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
