import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { errorResponseBody, NotFoundError, ValidationError } from "@/lib/errors";
import { z } from "zod";

const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  shortDescription: z.string().optional(),
  price: z.number().min(0).optional(),
  salePrice: z.number().min(0).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  previewVideoUrl: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  level: z.string().optional(),
  duration: z.string().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  whatYouLearn: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        modules: {
          orderBy: { sortOrder: "asc" },
          include: {
            lessons: {
              where: { published: true },
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                isFree: true,
                videoDuration: true,
                sortOrder: true,
                published: true,
              },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) throw new NotFoundError("Course not found");

    return NextResponse.json(course);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateCourseSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Course not found");

    const data = parsed.data;
    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.salePrice !== undefined && { salePrice: data.salePrice }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.previewVideoUrl !== undefined && { previewVideoUrl: data.previewVideoUrl }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.requirements !== undefined && { requirements: data.requirements }),
        ...(data.whatYouLearn !== undefined && { whatYouLearn: data.whatYouLearn }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        updatedAt: true,
      },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "COURSE_UPDATED",
      entityType: "Course",
      entityId: course.id,
      details: { title: course.title },
    });

    return NextResponse.json(course);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const { id } = await params;

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Course not found");

    await prisma.course.delete({ where: { id } });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "COURSE_DELETED",
      entityType: "Course",
      entityId: id,
      details: { title: existing.title },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
