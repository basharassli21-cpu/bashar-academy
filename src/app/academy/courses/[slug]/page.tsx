import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { getVideoUrl } from "@/lib/r2";
import { CourseDetailClient } from "@/components/academy/course-detail-client";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      _count: { select: { enrollments: true } },
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            where: { published: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (!course || !course.published) notFound();

  let enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });

  if (!enrollment) {
    enrollment = await prisma.enrollment.create({
      data: { userId: user.id, courseId: course.id },
    });
  }

  const moduleProgress: Record<string, boolean> = {};
  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id, lessonId: { in: lessonIds }, completed: true },
  });
  for (const p of progress) {
    moduleProgress[p.lessonId] = true;
  }

  let previewVideoSignedUrl: string | null = null;
  if (course.previewVideoUrl) {
    try {
      previewVideoSignedUrl = await getVideoUrl(course.previewVideoUrl);
    } catch {
      // preview video unavailable
    }
  }

  return (
    <CourseDetailClient
      course={JSON.parse(JSON.stringify(course))}
      enrollment={JSON.parse(JSON.stringify(enrollment))}
      moduleProgress={moduleProgress}
      previewVideoSignedUrl={previewVideoSignedUrl}
    />
  );
}
