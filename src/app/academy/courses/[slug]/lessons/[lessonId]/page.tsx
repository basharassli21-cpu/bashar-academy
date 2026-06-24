import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { getVideoUrl } from "@/lib/r2";
import { LessonClient } from "@/components/academy/lesson-client";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const course = await prisma.course.findUnique({
    where: { slug },
    select: { id: true, title: true, slug: true },
  });
  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  if (!enrollment) notFound();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          lessons: { where: { published: true }, orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
  if (!lesson) notFound();

  const allModules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { sortOrder: "asc" },
    include: {
      lessons: { where: { published: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  const allLessons = allModules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const progressRecord = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
  });
  const isCompleted = progressRecord?.completed ?? false;

  const completedLessons = await prisma.lessonProgress.count({
    where: { userId: user.id, lessonId: { in: allLessons.map((l) => l.id) }, completed: true },
  });
  const overallProgress = allLessons.length > 0
    ? Math.round((completedLessons / allLessons.length) * 100)
    : 0;

  let videoSignedUrl: string | null = null;
  if (lesson.type === "VIDEO" && lesson.videoUrl) {
    try {
      videoSignedUrl = await getVideoUrl(lesson.videoUrl);
    } catch {
      // video unavailable
    }
  }

  const [comments, notes, quizzes] = await Promise.all([
    prisma.comment.findMany({
      where: { lessonId },
      include: { user: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.note.findMany({
      where: { userId: user.id, lessonId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quiz.findMany({
      where: { lessonId },
      include: {
        questions: { orderBy: { sortOrder: "asc" } },
        attempts: { where: { userId: user.id }, orderBy: { attemptedAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <LessonClient
      lesson={JSON.parse(JSON.stringify(lesson))}
      courseSlug={course.slug}
      courseTitle={course.title}
      allModules={JSON.parse(JSON.stringify(allModules))}
      prevLesson={prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null}
      nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null}
      isCompleted={isCompleted}
      overallProgress={overallProgress}
      videoSignedUrl={videoSignedUrl}
      initialComments={JSON.parse(JSON.stringify(comments))}
      initialNotes={JSON.parse(JSON.stringify(notes))}
      quizzes={JSON.parse(JSON.stringify(quizzes))}
    />
  );
}
