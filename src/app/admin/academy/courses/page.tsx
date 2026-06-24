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

export default async function AdminAcademyCoursesPage() {
  await requireRole(["ADMIN"]);

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      _count: { select: { enrollments: true, modules: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-sm text-muted-foreground">
            Manage your academy courses
          </p>
        </div>
        <Link
          href="/admin/academy/courses/new"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          <Plus className="size-4" />
          Create Course
        </Link>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Modules</TableHead>
              <TableHead>Enrollments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No courses found
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">
                    {course.title}
                  </TableCell>
                  <TableCell>{course.category?.name ?? "-"}</TableCell>
                  <TableCell>
                    {course.salePrice ? (
                      <span className="flex items-center gap-1">
                        <span className="text-muted-foreground line-through">
                          ${Number(course.price).toFixed(2)}
                        </span>
                        <span className="font-medium text-emerald-600">
                          ${Number(course.salePrice).toFixed(2)}
                        </span>
                      </span>
                    ) : (
                      `$${Number(course.price).toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell>{course._count.modules}</TableCell>
                  <TableCell>{course._count.enrollments}</TableCell>
                  <TableCell>
                    <Badge
                      variant={course.published ? "default" : "secondary"}
                    >
                      {course.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/academy/courses/${course.slug}`}
                        target="_blank"
                        className="inline-flex size-6 items-center justify-center rounded-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Eye className="size-3" />
                      </Link>
                      <Link
                        href={`/admin/academy/courses/${course.id}`}
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
