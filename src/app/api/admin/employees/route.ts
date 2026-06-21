import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { hashPassword } from "@/lib/auth/password";
import { createEmployeeSchema } from "@/lib/validation/employee";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { ConflictError, ValidationError, errorResponseBody } from "@/lib/errors";
import type { Prisma } from "@/generated/prisma/client";
import type { Role } from "@/generated/prisma/enums";

export async function GET(request: Request) {
  try {
    await requireApiRole(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") as Role | null;
    const q = searchParams.get("q")?.trim();
    const teamLeaderId = searchParams.get("teamLeaderId");
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    if (role !== "SALES_EMPLOYEE" && role !== "TEAM_LEADER") {
      throw new ValidationError("role must be SALES_EMPLOYEE or TEAM_LEADER");
    }

    const where: Prisma.UserWhereInput = {
      role,
      ...(teamLeaderId ? { teamLeaderId } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          monthlyTarget: true,
          isActive: true,
          createdAt: true,
          teamLeaderId: true,
          teamLeader: { select: { id: true, fullName: true } },
          _count: { select: { employees: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.user.count({ where }),
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
    const parsed = createEmployeeSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const data = parsed.data;

    const existing = await prisma.user.findUnique({ where: { username: data.username } });
    if (existing) throw new ConflictError("employees.usernameTaken");

    if (data.teamLeaderId) {
      const leader = await prisma.user.findUnique({ where: { id: data.teamLeaderId } });
      if (!leader || leader.role !== "TEAM_LEADER") {
        throw new ValidationError("teamLeaderId must reference a Team Leader");
      }
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        passwordHash,
        fullName: data.fullName,
        role: data.role,
        monthlyTarget: data.role === "SALES_EMPLOYEE" ? data.monthlyTarget ?? null : null,
        teamLeaderId: data.role === "SALES_EMPLOYEE" ? data.teamLeaderId ?? null : null,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        monthlyTarget: true,
        isActive: true,
        createdAt: true,
        teamLeaderId: true,
      },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: data.role === "TEAM_LEADER" ? "TEAM_LEADER_CREATED" : "EMPLOYEE_CREATED",
      entityType: "User",
      entityId: user.id,
      details: { username: user.username, fullName: user.fullName },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
