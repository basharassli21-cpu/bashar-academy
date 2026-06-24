import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { errorResponseBody } from "@/lib/errors";

export async function GET() {
  try {
    const user = await requireApiUser();

    const [
      totalEnrollments,
      completedEnrollments,
      certificatesCount,
      inProgressEnrollments,
      recentEnrollments,
    ] = await Promise.all([
      prisma.enrollment.count({ where: { userId: user.id } }),
      prisma.enrollment.count({ where: { userId: user.id, completed: true } }),
      prisma.certificate.count({ where: { userId: user.id } }),
      prisma.enrollment.count({ where: { userId: user.id, completed: false, progress: { gt: 0 } } }),
      prisma.enrollment.findMany({
        where: { userId: user.id },
        orderBy: { enrolledAt: "desc" },
        take: 5,
        select: {
          id: true,
          progress: true,
          completed: true,
          enrolledAt: true,
          course: {
            select: { id: true, title: true, slug: true, imageUrl: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalCourses: totalEnrollments,
      completed: completedEnrollments,
      inProgress: inProgressEnrollments,
      certificates: certificatesCount,
      recentCourses: recentEnrollments,
    });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
