import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser, requireApiRole } from "@/lib/auth/dal";
import { errorResponseBody, NotFoundError, ValidationError } from "@/lib/errors";
import { z } from "zod";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser();
    const { id: lessonId } = await params;

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true, module: { select: { courseId: true } } } });
    if (!lesson) throw new NotFoundError("Lesson not found");

    if (user.role !== "ADMIN") {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: lesson.module.courseId } },
      });
      if (!enrollment) throw new NotFoundError("Not enrolled in this course");
    }

    const quizzes = await prisma.quiz.findMany({
      where: { lessonId },
      include: {
        questions: { orderBy: { sortOrder: "asc" } },
        attempts: { where: { userId: user.id }, orderBy: { attemptedAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}

const createQuizSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  questions: z.array(z.object({
    question: z.string().min(1),
    options: z.array(z.string()).min(2),
    correctIndex: z.number().int().min(0),
    explanation: z.string().optional(),
  })).min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiRole(["ADMIN"]);
    const { id: lessonId } = await params;
    const body = await request.json();
    const parsed = createQuizSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundError("Lesson not found");

    const { title, description, passingScore, questions } = parsed.data;

    const quiz = await prisma.quiz.create({
      data: {
        lessonId,
        title,
        description,
        passingScore: passingScore ?? 70,
        questions: {
          create: questions.map((q, i) => ({
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            sortOrder: i,
          })),
        },
      },
      include: { questions: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
