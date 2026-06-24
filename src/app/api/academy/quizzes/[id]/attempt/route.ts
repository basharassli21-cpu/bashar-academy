import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { errorResponseBody, NotFoundError, ValidationError } from "@/lib/errors";
import { z } from "zod";

const submitSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    selectedIndex: z.number().int().min(0),
  })),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser();
    const { id: quizId } = await params;
    const body = await request.json();
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Invalid answers format");

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true, lesson: { include: { module: true } } },
    });
    if (!quiz) throw new NotFoundError("Quiz not found");

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: quiz.lesson.module.courseId } },
    });
    if (!enrollment) throw new NotFoundError("Not enrolled in this course");

    const { answers } = parsed.data;
    let correctCount = 0;
    const results = quiz.questions.map((q) => {
      const answer = answers.find((a) => a.questionId === q.id);
      const selectedIndex = answer?.selectedIndex ?? -1;
      const isCorrect = selectedIndex === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        correctIndex: q.correctIndex,
        selectedIndex,
        correct: isCorrect,
        explanation: q.explanation,
      };
    });

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId,
        score,
        passed,
        answers: results,
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      score,
      passed,
      passingScore: quiz.passingScore,
      totalQuestions,
      correctCount,
      results,
    });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
