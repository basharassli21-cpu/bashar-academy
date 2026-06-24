import { getCurrentUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { MyCoursesClient } from "@/components/academy/my-courses-client";

export default async function MyCoursesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          category: true,
          modules: {
            include: { lessons: { where: { published: true } } },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return (
    <MyCoursesClient
      enrollments={JSON.parse(JSON.stringify(enrollments))}
    />
  );
}
