import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://bashar-academy.vercel.app";

  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const blogPosts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 1 },
    { url: `${baseUrl}/academy`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/academy/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    ...courses.map((c) => ({
      url: `${baseUrl}/academy/courses/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...blogPosts.map((p) => ({
      url: `${baseUrl}/academy/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
