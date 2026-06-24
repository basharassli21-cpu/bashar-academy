import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  DollarSign,
  Users,
  BookOpen,
  CalendarCheck,
  CreditCard,
} from "lucide-react";

export default async function AdminAcademyAnalyticsPage() {
  await requireRole(["ADMIN"]);

  const [
    totalCourses,
    totalEnrollments,
    totalStudents,
    paymentsCompleted,
    totalBookings,
    topCourses,
    monthlyPayments,
  ] = await Promise.all([
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.payment.findMany({
      where: { status: "COMPLETED" },
      select: { amount: true, createdAt: true },
    }),
    prisma.booking.count(),
    prisma.enrollment.groupBy({
      by: ["courseId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    prisma.$queryRaw<
      Array<{ month: string; revenue: number; count: bigint }>
    >`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') AS month,
        SUM(amount)::numeric AS revenue,
        COUNT(*) AS count
      FROM payments
      WHERE status = 'COMPLETED'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `,
  ]);

  const totalRevenue = paymentsCompleted.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const topCourseDetails = topCourses.length > 0
    ? await prisma.course.findMany({
        where: {
          id: { in: topCourses.map((tc) => tc.courseId) },
        },
        select: { id: true, title: true, price: true },
      })
    : [];

  const topCourseMap = new Map(
    topCourseDetails.map((c) => [c.id, c])
  );

  const revenueByMonth = monthlyPayments.map((m) => ({
    month: m.month,
    revenue: Number(m.revenue),
    count: Number(m.count),
  }));

  const bookingStats = await prisma.booking.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const bookingStatusCount = Object.fromEntries(
    bookingStats.map((b) => [b.status, b._count.id])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Academy performance metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              From {paymentsCompleted.length} completed payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Students
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStudents.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalEnrollments} total enrollments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Courses
            </CardTitle>
            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCourses.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {topCourses.length > 0
                ? `${topCourses[0]._count.id} enrollments in top course`
                : "No courses yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bookings
            </CardTitle>
            <CalendarCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBookings.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {bookingStatusCount.CONFIRMED ?? 0} confirmed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByMonth.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No revenue data
              </p>
            ) : (
              <div className="space-y-3">
                {revenueByMonth.reverse().map((m) => {
                  const maxRevenue = Math.max(
                    ...revenueByMonth.map((r) => r.revenue),
                    1
                  );
                  const pct = (m.revenue / maxRevenue) * 100;
                  return (
                    <div key={m.month} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{m.month}</span>
                        <span className="font-medium">
                          ${m.revenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {topCourses.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No enrollment data
              </p>
            ) : (
              <div className="space-y-4">
                {topCourses.map((tc, i) => {
                  const course = topCourseMap.get(tc.courseId);
                  const maxEnrollments = topCourses[0]._count.id;
                  const pct = (tc._count.id / maxEnrollments) * 100;
                  return (
                    <div key={tc.courseId} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="line-clamp-1 max-w-[250px]">
                          {i + 1}. {course?.title ?? "Unknown"}
                        </span>
                        <span className="font-medium">
                          {tc._count.id}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingStats.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No booking data
              </p>
            ) : (
              <div className="space-y-3">
                {bookingStats.map((b) => {
                  const total = bookingStats.reduce(
                    (s, bs) => s + bs._count.id,
                    0
                  );
                  const pct = (b._count.id / total) * 100;
                  return (
                    <div key={b.status} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">
                          {b.status.toLowerCase()}
                        </span>
                        <span className="font-medium">
                          {b._count.id} ({Math.round(pct)}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="size-4" />
                  Revenue per Student
                </div>
                <p className="mt-1 text-xl font-bold">
                  ${totalStudents > 0
                    ? Math.round(totalRevenue / totalStudents).toLocaleString()
                    : 0}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="size-4" />
                  Avg per Enrollment
                </div>
                <p className="mt-1 text-xl font-bold">
                  ${totalEnrollments > 0
                    ? Math.round(totalRevenue / totalEnrollments).toLocaleString()
                    : 0}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="size-4" />
                  Enrollments/Course
                </div>
                <p className="mt-1 text-xl font-bold">
                  {totalCourses > 0
                    ? Math.round(totalEnrollments / totalCourses)
                    : 0}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  Conversion Rate
                </div>
                <p className="mt-1 text-xl font-bold">
                  {totalStudents > 0
                    ? `${Math.round((totalEnrollments / totalStudents) * 100)}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
