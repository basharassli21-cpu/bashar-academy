import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { errorResponseBody, ValidationError } from "@/lib/errors";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { z } from "zod";

const createBlogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  scheduledAt: z.string().datetime().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoCanonical: z.string().optional(),
  readTime: z.number().int().optional(),
});

export async function GET(request: Request) {
  try {
    await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const q = searchParams.get("q")?.trim();
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    const where: Record<string, unknown> = { published: true };
    if (categoryId) where.categoryId = categoryId;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          tags: true,
          featured: true,
          readTime: true,
          viewCount: true,
          createdAt: true,
          author: { select: { id: true, fullName: true, image: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json(paginatedResponse(posts, total, page, pageSize));
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const body = await request.json();
    const parsed = createBlogPostSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const data = parsed.data;

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt ?? null,
        imageUrl: data.imageUrl ?? null,
        authorId: actor.id,
        categoryId: data.categoryId ?? null,
        tags: data.tags ?? [],
        published: data.published ?? false,
        featured: data.featured ?? false,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        seoCanonical: data.seoCanonical ?? null,
        readTime: data.readTime ?? null,
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
      action: "BLOG_POST_CREATED",
      entityType: "BlogPost",
      entityId: post.id,
      details: { title: post.title },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
