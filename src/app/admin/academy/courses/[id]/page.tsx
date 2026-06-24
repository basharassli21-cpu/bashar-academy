import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Video,
  FileText,
  File,
  Archive,
} from "lucide-react";
import Link from "next/link";

type LessonType = "VIDEO" | "PDF" | "TEXT" | "RESOURCE";

const lessonIcons: Record<LessonType, React.ElementType> = {
  VIDEO: Video,
  PDF: FileText,
  TEXT: File,
  RESOURCE: Archive,
};

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      category: { select: { name: true, id: true } },
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              title: true,
              type: true,
              sortOrder: true,
              published: true,
              isFree: true,
            },
          },
        },
      },
    },
  });

  if (!course) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {course.title}
            </h1>
            <Badge variant={course.published ? "default" : "secondary"}>
              {course.published ? "Published" : "Draft"}
            </Badge>
            {course.featured && (
              <Badge variant="outline">Featured</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            /academy/courses/{course.slug}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/academy/courses"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted hover:text-foreground"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Title
                </label>
                <p className="text-sm">{course.title}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Slug
                </label>
                <p className="text-sm font-mono">{course.slug}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Price
                </label>
                <p className="text-sm">
                  ${Number(course.price).toFixed(2)}
                  {course.salePrice && (
                    <span className="ml-2 text-emerald-600">
                      Sale: ${Number(course.salePrice).toFixed(2)}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Category
                </label>
                <p className="text-sm">
                  {course.category?.name ?? "Uncategorized"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Level
                </label>
                <p className="text-sm capitalize">
                  {course.level ?? "Not set"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Duration
                </label>
                <p className="text-sm">
                  {course.duration ?? "Not set"}
                </p>
              </div>
            </div>
            <Separator />
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Short Description
              </label>
              <p className="mt-1 text-sm">
                {course.shortDescription ?? "No short description"}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Full Description
              </label>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {course.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Image URL
              </label>
              <p className="text-sm">
                {course.imageUrl ? (
                  <span className="break-all font-mono text-xs">
                    {course.imageUrl}
                  </span>
                ) : (
                  "No image"
                )}
              </p>
            </div>
            <Separator />
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Tags
              </label>
              <div className="mt-1 flex flex-wrap gap-1">
                {course.tags.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    No tags
                  </span>
                ) : (
                  course.tags.map((tag) => (
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
                Requirements
              </label>
              <ul className="mt-1 list-inside list-disc text-sm">
                {course.requirements.length === 0 ? (
                  <li className="text-muted-foreground">None</li>
                ) : (
                  course.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))
                )}
              </ul>
            </div>
            <Separator />
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                What You&apos;ll Learn
              </label>
              <ul className="mt-1 list-inside list-disc text-sm">
                {course.whatYouLearn.length === 0 ? (
                  <li className="text-muted-foreground">None</li>
                ) : (
                  course.whatYouLearn.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Curriculum</CardTitle>
          <Button size="sm">
            <Plus className="size-4" />
            Add Module
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {course.modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No modules yet. Click &quot;Add Module&quot; to get started.
            </p>
          ) : (
            course.modules.map((module, mi) => (
              <div
                key={module.id}
                className="rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-2 border-b px-4 py-3">
                  <GripVertical className="size-4 text-muted-foreground" />
                  <BookOpen className="size-4 text-muted-foreground" />
                  <span className="flex-1 text-sm font-medium">
                    {mi + 1}. {module.title}
                  </span>
                  <Button variant="ghost" size="icon-xs">
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
                <div className="divide-y">
                  {module.lessons.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground">
                      No lessons yet
                    </div>
                  ) : (
                    module.lessons.map((lesson, li) => {
                      const Icon =
                        lessonIcons[lesson.type] || BookOpen;
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-2 px-4 py-2.5 pl-10"
                        >
                          <GripVertical className="size-3 text-muted-foreground" />
                          <Icon className="size-3.5 text-muted-foreground" />
                          <span className="flex-1 text-sm">
                            {li + 1}. {lesson.title}
                          </span>
                          {lesson.isFree && (
                            <Badge
                              variant="outline"
                              className="text-[10px]"
                            >
                              Free
                            </Badge>
                          )}
                          <Badge
                            variant={
                              lesson.published ? "default" : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {lesson.published
                              ? "Published"
                              : "Draft"}
                          </Badge>
                          <Button variant="ghost" size="icon-xs">
                            <Pencil className="size-3" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="border-t px-4 py-2">
                  <Button variant="ghost" size="sm">
                    <Plus className="size-3" />
                    Add Lesson
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
