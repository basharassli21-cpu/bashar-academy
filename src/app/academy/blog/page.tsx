import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    include: {
      author: { select: { fullName: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Blog</h1>
      <p className="text-muted-foreground mb-8">Tips, tutorials, and insights</p>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">No posts published yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              {post.imageUrl && (
                <Link href={`/academy/blog/${post.slug}`}>
                  <div className="aspect-video bg-muted">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                </Link>
              )}
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                  {post.category && (
                    <Badge variant="secondary">{post.category.name}</Badge>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {post.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime} min read
                    </span>
                  )}
                </div>

                <Link href={`/academy/blog/${post.slug}`}>
                  <h2 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                </Link>

                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">{post.author.fullName}</span>
        <ButtonLink variant="ghost" size="sm" href={`/academy/blog/${post.slug}`}>
          Read More
          <ArrowRight className="h-4 w-4 mr-1" />
        </ButtonLink>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
