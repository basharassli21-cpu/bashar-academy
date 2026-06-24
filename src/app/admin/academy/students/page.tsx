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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function AdminAcademyStudentsPage() {
  await requireRole(["ADMIN"]);

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          enrollments: true,
          certificates: true,
        },
      },
    },
  });

  const enrollmentStats = await prisma.enrollment.groupBy({
    by: ["userId"],
    _avg: { progress: true },
  });

  const progressMap = new Map(
    enrollmentStats.map((e) => [e.userId, Math.round(e._avg.progress ?? 0)])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Students</h1>
        <p className="text-sm text-muted-foreground">
          All enrolled students ({students.length})
        </p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          No students found
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Avg Progress</TableHead>
                <TableHead>Certificates</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const initials = student.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const avgProgress = progressMap.get(student.id) ?? 0;

                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {student.fullName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        {student.email && (
                          <span>{student.email}</span>
                        )}
                        {student.phone && (
                          <span className="text-muted-foreground">
                            {student.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {student._count.enrollments}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${avgProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {avgProgress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {student._count.certificates}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {student.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-xs">
                          <Mail className="size-3" />
                        </Button>
                        <Link
                          href={`/admin/academy/students/${student.id}`}
                          className="inline-flex size-6 items-center justify-center rounded-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <ExternalLink className="size-3" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
