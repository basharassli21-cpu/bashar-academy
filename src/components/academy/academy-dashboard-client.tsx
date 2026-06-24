"use client";

import Link from "next/link";
import {
  BookOpen, Clock, CheckCircle, TrendingUp, Calendar,
  ChevronRight, Play, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/components/providers/locale-provider";
import type { CurrentUser } from "@/lib/auth/dal";

interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: { toString: () => string };
  imageUrl: string | null;
  level: string | null;
  duration: string | null;
  category: { name: string } | null;
  _count: { enrollments: number; modules: number };
}

interface EnrollmentData {
  id: string;
  progress: number;
  completed: boolean;
  course: CourseData & {
    modules: Array<{
      lessons: Array<{ id: string }>;
    }>;
  };
}

interface BookingData {
  id: string;
  status: string;
  slot: { date: string; startTime: string; endTime: string } | null;
}

export function AcademyDashboardClient({
  user,
  enrollments,
  courses,
  bookings,
}: {
  user: CurrentUser;
  enrollments: EnrollmentData[];
  courses: CourseData[];
  bookings: BookingData[];
}) {
  const t = useTranslations();
  const inProgress = enrollments.filter((e) => !e.completed && e.progress > 0);
  const completed = enrollments.filter((e) => e.completed);
  const notStarted = enrollments.filter((e) => e.progress === 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {user.fullName}
        </h1>
        <p className="text-muted-foreground mt-1">{t.academy.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{enrollments.length}</p>
              <p className="text-sm text-muted-foreground">{t.academy.myCourses}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Clock className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{inProgress.length}</p>
              <p className="text-sm text-muted-foreground">{t.academy.inProgress}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{completed.length}</p>
              <p className="text-sm text-muted-foreground">{t.academy.completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{courses.length}</p>
              <p className="text-sm text-muted-foreground">{t.academy.allCourses}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {inProgress.length > 0 && (
        <section className="mb-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t.academy.continueLearning}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inProgress.slice(0, 3).map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <Link href={`/academy/courses/${enrollment.course.slug}`} className="font-medium hover:underline">
                      {enrollment.course.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${enrollment.progress}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground">{enrollment.progress}%</span>
                    </div>
                  </div>
                  <ButtonLink size="sm" href={`/academy/courses/${enrollment.course.slug}`}>
                    <Play className="h-4 w-4 ml-1" />
                    {t.academy.resumeCourse}
                  </ButtonLink>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t.academy.allCourses}</h2>
          <ButtonLink variant="ghost" size="sm" href="/academy/my-courses">
            View All
            <ChevronRight className="h-4 w-4 mr-1" />
          </ButtonLink>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                {course.imageUrl ? (
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {enrollments.some((e) => e.course.id === course.id) && (
                  <Badge className="absolute top-2 right-2">{t.academy.enrolled}</Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  {course.category && (
                    <Badge variant="secondary">{course.category.name}</Badge>
                  )}
                  {course.level && (
                    <span>{course.level}</span>
                  )}
                </div>
                <Link href={`/academy/courses/${course.slug}`}>
                  <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">{course.title}</h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course._count.modules} {t.academy.modules}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {course._count.enrollments} {t.academy.students}
                    </span>
                  </div>
                  <ButtonLink size="sm" href={`/academy/courses/${course.slug}`}>
                    {parseFloat(course.price.toString()) > 0
                      ? `$${course.price.toString()}`
                      : t.academy.free}
                  </ButtonLink>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {bookings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t.academy.myBookings}</h2>
            <ButtonLink variant="ghost" size="sm" href="/academy/bookings">
              View All
              <ChevronRight className="h-4 w-4 mr-1" />
            </ButtonLink>
          </div>
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t.academy.bookConsultation}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.slot
                          ? `${new Date(booking.slot.date).toLocaleDateString()} - ${booking.slot.startTime}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={booking.status === "CONFIRMED" ? "default" : "secondary"}>
                    {booking.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
