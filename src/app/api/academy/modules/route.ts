import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { errorResponseBody, ValidationError } from "@/lib/errors";
import { z } from "zod";

const createModuleSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(request: Request) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const body = await request.json();
    const parsed = createModuleSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const data = parsed.data;

    const course = await prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) throw new ValidationError("Course not found");

    const module = await prisma.module.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        description: data.description ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
      select: {
        id: true,
        title: true,
        courseId: true,
        sortOrder: true,
        createdAt: true,
      },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LESSON_CREATED",
      entityType: "Module",
      entityId: module.id,
      details: { title: module.title, courseId: module.courseId },
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
