import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { errorResponseBody, ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { z } from "zod";

const createEnrollmentSchema = z.object({
  courseId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const parsed = createEnrollmentSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const { courseId } = parsed.data;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError("Course not found");

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });
    if (existing) throw new ConflictError("Already enrolled in this course");

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
      },
      select: {
        id: true,
        userId: true,
        courseId: true,
        enrolledAt: true,
        course: { select: { id: true, title: true } },
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      actorRole: user.role,
      action: "ENROLLMENT_CREATED",
      entityType: "Enrollment",
      entityId: enrollment.id,
      details: { courseId: enrollment.courseId, courseTitle: enrollment.course.title },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
