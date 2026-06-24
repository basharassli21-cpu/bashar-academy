import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { errorResponseBody, ValidationError } from "@/lib/errors";
import { z } from "zod";

const updateProgressSchema = z.object({
  completed: z.boolean().optional(),
  watchTime: z.number().int().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser();
    const { id: lessonId } = await params;
    const body = await request.json();
    const parsed = updateProgressSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const data = parsed.data;

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new ValidationError("Lesson not found");

    const existing = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId } },
    });

    let progress;
    if (existing) {
      progress = await prisma.lessonProgress.update({
        where: { id: existing.id },
        data: {
          ...(data.completed !== undefined && {
            completed: data.completed,
            completedAt: data.completed ? new Date() : null,
          }),
          ...(data.watchTime !== undefined && { watchTime: data.watchTime }),
        },
      });
    } else {
      progress = await prisma.lessonProgress.create({
        data: {
          userId: user.id,
          lessonId,
          completed: data.completed ?? false,
          watchTime: data.watchTime ?? 0,
          completedAt: data.completed ? new Date() : null,
        },
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
