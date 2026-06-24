"use client";

import Link from "next/link";
import { BookOpen, Play, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/components/providers/locale-provider";

interface MyCoursesClientProps {
  enrollments: Array<{
    id: string;
    progress: number;
    completed: boolean;
    enrolledAt: string;
    completedAt: string | null;
    course: {
      id: string;
      title: string;
      slug: string;
      description: string;
      price: { toString: () => string };
      imageUrl: string | null;
      level: string | null;
      duration: string | null;
      category: { name: string } | null;
      modules: Array<{
        lessons: Array<{ id: string }>;
      }>;
    };
  }>;
}

export function MyCoursesClient({ enrollments }: MyCoursesClientProps) {
  const t = useTranslations();
  const inProgress = enrollments.filter((e) => !e.completed);
  const completed = enrollments.filter((e) => e.completed);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t.academy.myCourses}</h1>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No enrollments yet</h2>
            <p className="text-muted-foreground mb-6">
              Browse our courses and start learning today
            </p>
            <ButtonLink href="/academy">Browse Courses</ButtonLink>
          </CardContent>
        </Card>
      ) : (
        <>
          {inProgress.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                {t.academy.inProgress}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {inProgress.map((enrollment) => (
                  <Card key={enrollment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/academy/courses/${enrollment.course.slug}`}>
                      <div className="aspect-video bg-muted relative">
                        {enrollment.course.imageUrl ? (
                          <img src={enrollment.course.imageUrl} alt={enrollment.course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <Link href={`/academy/courses/${enrollment.course.slug}`}>
                        <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                          {enrollment.course.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-3 mb-3">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${enrollment.progress}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">{enrollment.progress}%</span>
                      </div>
                      <ButtonLink size="sm" className="w-full" href={`/academy/courses/${enrollment.course.slug}`}>
                        <Play className="h-4 w-4 ml-2" />
                        {enrollment.progress > 0 ? t.academy.resumeCourse : t.academy.startCourse}
                      </ButtonLink>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                {t.academy.completed}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completed.map((enrollment) => (
                  <Card key={enrollment.id} className="overflow-hidden hover:shadow-lg transition-shadow border-green-200">
                    <Link href={`/academy/courses/${enrollment.course.slug}`}>
                      <div className="aspect-video bg-muted relative">
                        {enrollment.course.imageUrl ? (
                          <img src={enrollment.course.imageUrl} alt={enrollment.course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2 bg-green-500">
                          <CheckCircle className="h-3 w-3 ml-1" />
                          {t.academy.completed}
                        </Badge>
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <Link href={`/academy/courses/${enrollment.course.slug}`}>
                        <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                          {enrollment.course.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1 mb-3 text-sm text-muted-foreground">
                        {enrollment.course.category && (
                          <Badge variant="secondary">{enrollment.course.category.name}</Badge>
                        )}
                        {enrollment.course.level && <span>{enrollment.course.level}</span>}
                      </div>
                      <div className="flex gap-2">
                        <ButtonLink variant="outline" size="sm" className="flex-1" href={`/academy/courses/${enrollment.course.slug}`}>
                          {t.academy.courseDetails}
                        </ButtonLink>
                        <ButtonLink variant="outline" size="sm" className="flex-1" href={`/academy/certificates`}>
                          {t.academy.certificate}
                        </ButtonLink>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
