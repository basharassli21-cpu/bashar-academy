import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { errorResponseBody, ValidationError } from "@/lib/errors";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { z } from "zod";

const createCourseSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  price: z.number().min(0),
  salePrice: z.number().min(0).optional(),
  imageUrl: z.string().optional(),
  previewVideoUrl: z.string().optional(),
  categoryId: z.string().optional(),
  level: z.string().optional(),
  duration: z.string().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  whatYouLearn: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const level = searchParams.get("level");
    const q = searchParams.get("q")?.trim();
    const featured = searchParams.get("featured");
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    const where: Record<string, unknown> = { published: true };
    if (categoryId) where.categoryId = categoryId;
    if (level) where.level = level;
    if (featured === "true") where.featured = true;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          price: true,
          salePrice: true,
          currency: true,
          imageUrl: true,
          level: true,
          duration: true,
          featured: true,
          tags: true,
          sortOrder: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { modules: true, enrollments: true } },
        },
        orderBy: { sortOrder: "asc" },
        skip,
        take,
      }),
      prisma.course.count({ where }),
    ]);

    const items = courses.map(({ _count, ...course }) => ({
      ...course,
      moduleCount: _count.modules,
      enrollmentCount: _count.enrollments,
    }));

    return NextResponse.json(paginatedResponse(items, total, page, pageSize));
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const body = await request.json();
    const parsed = createCourseSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const data = parsed.data;

    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription ?? null,
        price: data.price,
        salePrice: data.salePrice ?? null,
        imageUrl: data.imageUrl ?? null,
        previewVideoUrl: data.previewVideoUrl ?? null,
        categoryId: data.categoryId ?? null,
        level: data.level ?? null,
        duration: data.duration ?? null,
        published: data.published ?? false,
        featured: data.featured ?? false,
        tags: data.tags ?? [],
        requirements: data.requirements ?? [],
        whatYouLearn: data.whatYouLearn ?? [],
        sortOrder: data.sortOrder ?? 0,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        createdAt: true,
      },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "COURSE_CREATED",
      entityType: "Course",
      entityId: course.id,
      details: { title: course.title },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
