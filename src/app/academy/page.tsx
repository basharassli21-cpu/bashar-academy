import { getCurrentUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { AcademyDashboardClient } from "@/components/academy/academy-dashboard-client";

export default async function AcademyPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [enrollments, courses, bookings] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: { where: { published: true } } },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.course.findMany({
      where: { published: true },
      include: {
        category: true,
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.booking.findMany({
      where: { userId: user.id },
      include: { slot: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <AcademyDashboardClient
      user={user}
      enrollments={JSON.parse(JSON.stringify(enrollments))}
      courses={JSON.parse(JSON.stringify(courses))}
      bookings={JSON.parse(JSON.stringify(bookings))}
    />
  );
}
