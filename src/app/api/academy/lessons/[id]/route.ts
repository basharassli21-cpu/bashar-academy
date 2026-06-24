import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { errorResponseBody, NotFoundError, ValidationError } from "@/lib/errors";
import { z } from "zod";

const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "PDF", "TEXT", "RESOURCE"]).optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional().nullable(),
  videoDuration: z.number().int().optional().nullable(),
  pdfUrl: z.string().optional().nullable(),
  resourceUrl: z.string().optional().nullable(),
  resourceName: z.string().optional().nullable(),
  isFree: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateLessonSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);

    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Lesson not found");

    const data = parsed.data;
    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.videoDuration !== undefined && { videoDuration: data.videoDuration }),
        ...(data.pdfUrl !== undefined && { pdfUrl: data.pdfUrl }),
        ...(data.resourceUrl !== undefined && { resourceUrl: data.resourceUrl }),
        ...(data.resourceName !== undefined && { resourceName: data.resourceName }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.published !== undefined && { published: data.published }),
      },
      select: { id: true, title: true, moduleId: true, type: true, published: true, updatedAt: true },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LESSON_UPDATED",
      entityType: "Lesson",
      entityId: lesson.id,
      details: { title: lesson.title },
    });

    return NextResponse.json(lesson);
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

    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Lesson not found");

    await prisma.lesson.delete({ where: { id } });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LESSON_DELETED",
      entityType: "Lesson",
      entityId: id,
      details: { title: existing.title },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
