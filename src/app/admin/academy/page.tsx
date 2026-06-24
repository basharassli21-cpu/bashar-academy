import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: { value: string; up: boolean };
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {trend.up ? (
              <TrendingUp className="size-3 text-emerald-500" />
            ) : (
              <TrendingDown className="size-3 text-red-500" />
            )}
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default async function AdminAcademyDashboardPage() {
  await requireRole(["ADMIN"]);

  const [totalCourses, totalEnrollments, payments, totalBookings] =
    await Promise.all([
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.payment.findMany({
        where: { status: "COMPLETED" },
        select: { amount: true },
      }),
      prisma.booking.count(),
    ]);

  const totalRevenue = payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const recentEnrollments = await prisma.enrollment.findMany({
    take: 10,
    orderBy: { enrolledAt: "desc" },
    include: {
      user: { select: { fullName: true, email: true } },
      course: { select: { title: true } },
    },
  });

  const totalStudents = await prisma.enrollment.groupBy({
    by: ["userId"],
    _count: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Academy Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your online academy
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Courses"
          value={totalCourses.toLocaleString()}
          icon={BookOpen}
        />
        <StatCard
          title="Total Students"
          value={totalStudents.length.toLocaleString()}
          icon={Users}
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
        />
        <StatCard
          title="Total Bookings"
          value={totalBookings.toLocaleString()}
          icon={CalendarCheck}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEnrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No enrollments yet
            </p>
          ) : (
            <div className="space-y-4">
              {recentEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {enrollment.user.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {enrollment.course.title}
                    </p>
                  </div>
                  <Badge
                    variant={
                      enrollment.completed ? "default" : "secondary"
                    }
                  >
                    {enrollment.completed
                      ? "Completed"
                      : `${enrollment.progress}%`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
