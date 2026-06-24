import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { errorResponseBody, NotFoundError, ValidationError } from "@/lib/errors";
import { z } from "zod";

const updateBlogPostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoCanonical: z.string().optional().nullable(),
  readTime: z.number().int().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getCurrentUser();
    const { id } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, fullName: true, image: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!post) throw new NotFoundError("Post not found");

    await prisma.blogPost.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ ...post, viewCount: post.viewCount + 1 });
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
    const parsed = updateBlogPostSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Post not found");

    const data = parsed.data;
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.scheduledAt !== undefined && { scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null }),
        ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
        ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
        ...(data.seoCanonical !== undefined && { seoCanonical: data.seoCanonical }),
        ...(data.readTime !== undefined && { readTime: data.readTime }),
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
      action: "BLOG_POST_UPDATED",
      entityType: "BlogPost",
      entityId: post.id,
      details: { title: post.title },
    });

    return NextResponse.json(post);
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

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Post not found");

    await prisma.blogPost.delete({ where: { id } });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "BLOG_POST_DELETED",
      entityType: "BlogPost",
      entityId: id,
      details: { title: existing.title },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
