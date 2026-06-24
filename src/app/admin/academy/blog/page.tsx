import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

export default async function AdminAcademyBlogPage() {
  await requireRole(["ADMIN"]);

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { fullName: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
          <p className="text-sm text-muted-foreground">
            Manage blog posts ({posts.length})
          </p>
        </div>
        <Link
          href="/admin/academy/blog/new"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          <Plus className="size-4" />
          New Post
        </Link>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No blog posts found
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="max-w-[250px] font-medium">
                    <span className="line-clamp-1">{post.title}</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {post.author.fullName}
                  </TableCell>
                  <TableCell>
                    {post.category?.name ? (
                      <Badge variant="outline">
                        {post.category.name}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={post.published ? "default" : "secondary"}
                    >
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.viewCount}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {post.published
                      ? post.createdAt.toLocaleDateString()
                      : post.scheduledAt
                        ? `Scheduled: ${post.scheduledAt.toLocaleDateString()}`
                        : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="inline-flex size-6 items-center justify-center rounded-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Eye className="size-3" />
                      </Link>
                      <Link
                        href={`/admin/academy/blog/${post.id}`}
                        className="inline-flex size-6 items-center justify-center rounded-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="size-3" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
