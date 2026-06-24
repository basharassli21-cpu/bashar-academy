import { notFound } from "next/navigation";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { prisma } from "@/lib/prisma";
import { Calendar, Clock, ArrowLeft, User, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || post.title,
    ...(post.seoCanonical && { alternates: { canonical: post.seoCanonical } }),
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      ...(post.imageUrl && { images: [{ url: post.imageUrl }] }),
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: { select: { fullName: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  if (!post || !post.published) notFound();

  await prisma.blogPost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  });

  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
      <ButtonLink variant="ghost" size="sm" href="/academy/blog" className="mb-6">
        <ArrowLeft className="h-4 w-4 ml-2" />
        Back to Blog
      </ButtonLink>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground flex-wrap">
          {post.category && (
            <Badge variant="secondary">{post.category.name}</Badge>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {post.readTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime} min read
            </span>
          )}
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {post.author.fullName}
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground">{post.excerpt}</p>
        )}
      </header>

      {post.imageUrl && (
        <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-8">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags.length > 0 && (
        <div className="flex items-center gap-2 mt-8 pt-6 border-t flex-wrap">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
      )}
    </article>
  );
}
