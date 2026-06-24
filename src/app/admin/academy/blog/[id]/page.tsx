import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye } from "lucide-react";
import Link from "next/link";

export default async function AdminBlogPostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { id } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      author: { select: { fullName: true } },
      category: { select: { name: true, id: true } },
    },
  });

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {post.title}
            </h1>
            <Badge
              variant={post.published ? "default" : "secondary"}
            >
              {post.published ? "Published" : "Draft"}
            </Badge>
            {post.featured && (
              <Badge variant="outline">Featured</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            by {post.author.fullName} &middot; /blog/{post.slug}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/academy/blog"
            className="inline-flex h-7 items-center gap-1 rounded-[12px] border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted hover:text-foreground"
          >
            Back
          </Link>
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="inline-flex h-7 items-center gap-1 rounded-[12px] border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted hover:text-foreground"
          >
            <Eye className="size-4" />
            Preview
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {post.content}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Slug
                </label>
                <p className="font-mono text-sm">{post.slug}</p>
              </div>
              <Separator />
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Category
                </label>
                <p className="text-sm">
                  {post.category?.name ?? "Uncategorized"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Excerpt
                </label>
                <p className="text-sm text-muted-foreground">
                  {post.excerpt ?? "No excerpt"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Tags
                </label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {post.tags.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      No tags
                    </span>
                  ) : (
                    post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Image
                </label>
                {post.imageUrl ? (
                  <p className="break-all font-mono text-xs">
                    {post.imageUrl}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No image
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  SEO Title
                </label>
                <p className="text-sm">
                  {post.seoTitle ?? "Not set"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  SEO Description
                </label>
                <p className="text-sm text-muted-foreground">
                  {post.seoDescription ?? "Not set"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Canonical URL
                </label>
                <p className="text-sm text-muted-foreground">
                  {post.seoCanonical ?? "Not set"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{post.viewCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Read Time
                </span>
                <span className="font-medium">
                  {post.readTime
                    ? `${post.readTime} min`
                    : "Not set"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
