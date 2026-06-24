import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { errorResponseBody, ValidationError } from "@/lib/errors";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1),
  parentId: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiUser();
    const { id: lessonId } = await params;

    const comments = await prisma.comment.findMany({
      where: { lessonId, parentId: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, fullName: true, image: true },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: { id: true, fullName: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser();
    const { id: lessonId } = await params;
    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new ValidationError("Lesson not found");

    if (parsed.data.parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parsed.data.parentId } });
      if (!parent || parent.lessonId !== lessonId) throw new ValidationError("Invalid parent comment");
    }

    const comment = await prisma.comment.create({
      data: {
        userId: user.id,
        lessonId,
        content: parsed.data.content,
        parentId: parsed.data.parentId ?? null,
      },
      select: {
        id: true,
        content: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, fullName: true, image: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
