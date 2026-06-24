import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { errorResponseBody, NotFoundError, ValidationError } from "@/lib/errors";
import { z } from "zod";

const updateModuleSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateModuleSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);

    const existing = await prisma.module.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Module not found");

    const data = parsed.data;
    const module = await prisma.module.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
      select: { id: true, title: true, courseId: true, sortOrder: true, updatedAt: true },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LESSON_UPDATED",
      entityType: "Module",
      entityId: module.id,
      details: { title: module.title },
    });

    return NextResponse.json(module);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const { id } = await params;

    const existing = await prisma.module.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Module not found");

    await prisma.module.delete({ where: { id } });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LESSON_DELETED",
      entityType: "Module",
      entityId: id,
      details: { title: existing.title },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
