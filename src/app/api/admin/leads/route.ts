import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { normalizePhone } from "@/lib/phone/normalize";
import { createLeadSchema } from "@/lib/validation/lead";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { ConflictError, ValidationError, errorResponseBody } from "@/lib/errors";
import { triggerWebhooks } from "@/lib/webhooks";
import type { Prisma } from "@/generated/prisma/client";
import type { LeadStatus } from "@/generated/prisma/enums";

export async function GET(request: Request) {
  try {
    await requireApiRole(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status") as LeadStatus | null;
    const ownerEmployeeId = searchParams.get("ownerEmployeeId");
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    const where: Prisma.LeadWhereInput = {
      ...(status ? { status } : {}),
      ...(ownerEmployeeId ? { ownerEmployeeId } : {}),
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
          ownerEmployeeId: true,
          owner: { select: { id: true, fullName: true } },
          lastContactDate: true,
          nextFollowupDate: true,
          tags: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
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

export async function POST(request: Request) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const body = await request.json();
    const parsed = createLeadSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const data = parsed.data;

    if (data.ownerEmployeeId) {
      const owner = await prisma.user.findUnique({ where: { id: data.ownerEmployeeId } });
      if (!owner || owner.role !== "SALES_EMPLOYEE" || !owner.isActive) {
        throw new ValidationError("ownerEmployeeId must reference an active sales employee");
      }
    }

    const phoneNormalized = normalizePhone(data.phone);
    const existing = await prisma.lead.findUnique({ where: { phoneNormalized } });
    if (existing) throw new ConflictError("leads.phoneTaken");

    const lead = await prisma.lead.create({
      data: {
        customerName: data.customerName,
        phone: data.phone,
        phoneNormalized,
        ownerEmployeeId: data.ownerEmployeeId ?? null,
        createdById: actor.id,
        source: "MANUAL",
      },
      select: {
        id: true,
        customerName: true,
        phone: true,
        status: true,
        ownerEmployeeId: true,
        createdAt: true,
      },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LEAD_CREATED",
      entityType: "Lead",
      entityId: lead.id,
      details: { customerName: lead.customerName },
    });

    void triggerWebhooks("LEAD_CREATED", {
      leadId: lead.id,
      customerName: lead.customerName,
      phone: lead.phone,
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
