import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { errorResponseBody, ValidationError } from "@/lib/errors";
import { z } from "zod";

const createLessonSchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "PDF", "TEXT", "RESOURCE"]).optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  videoDuration: z.number().int().optional(),
  pdfUrl: z.string().optional(),
  resourceUrl: z.string().optional(),
  resourceName: z.string().optional(),
  isFree: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const body = await request.json();
    const parsed = createLessonSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const data = parsed.data;

    const module = await prisma.module.findUnique({ where: { id: data.moduleId } });
    if (!module) throw new ValidationError("Module not found");

    const lesson = await prisma.lesson.create({
      data: {
        moduleId: data.moduleId,
        title: data.title,
        description: data.description ?? null,
        type: data.type ?? "VIDEO",
        content: data.content ?? null,
        videoUrl: data.videoUrl ?? null,
        videoDuration: data.videoDuration ?? null,
        pdfUrl: data.pdfUrl ?? null,
        resourceUrl: data.resourceUrl ?? null,
        resourceName: data.resourceName ?? null,
        isFree: data.isFree ?? false,
        sortOrder: data.sortOrder ?? 0,
        published: data.published ?? false,
      },
      select: {
        id: true,
        title: true,
        moduleId: true,
        type: true,
        published: true,
        sortOrder: true,
        createdAt: true,
      },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LESSON_CREATED",
      entityType: "Lesson",
      entityId: lesson.id,
      details: { title: lesson.title, moduleId: lesson.moduleId },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
