"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Play, FileText, Video, FileDown, ChevronRight, Star, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/components/providers/locale-provider";

interface ModuleData {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: Array<{
    id: string;
    title: string;
    type: string;
    videoDuration: number | null;
    isFree: boolean;
    sortOrder: number;
    published: boolean;
  }>;
}

interface CourseDetailClientProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription: string | null;
    price: { toString: () => string };
    salePrice: { toString: () => string } | null;
    currency: string;
    imageUrl: string | null;
    previewVideoUrl: string | null;
    level: string | null;
    duration: string | null;
    tags: string[];
    requirements: string[];
    whatYouLearn: string[];
    category: { name: string } | null;
    modules: ModuleData[];
    _count: { enrollments: number };
  };
  enrollment: {
    id: string;
    progress: number;
    completed: boolean;
  } | null;
  moduleProgress: Record<string, boolean>;
  previewVideoSignedUrl: string | null;
}

const typeIcons: Record<string, typeof Play> = {
  VIDEO: Video,
  PDF: FileText,
  TEXT: FileText,
  RESOURCE: FileDown,
};

export function CourseDetailClient({
  course,
  enrollment,
  moduleProgress,
  previewVideoSignedUrl,
}: CourseDetailClientProps) {
  const t = useTranslations();
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const [enrolling, setEnrolling] = useState(false);

  const firstLessonId = course.modules[0]?.lessons[0]?.id;

  useEffect(() => {
    if (!enrollment && !enrolling) {
      setEnrolling(true);
      fetch("/api/academy/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      }).catch(() => {});
    }
  }, [enrollment, course.id, enrolling]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <div className="grid gap-8 lg:grid-cols-3 mb-10">
        <div className="lg:col-span-2">
          {course.category && (
            <Badge variant="secondary" className="mb-3">{course.category.name}</Badge>
          )}
          <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">{course.shortDescription || course.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            {course.level && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {t.academy.level}: {course.level}
              </span>
            )}
            {course.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {t.academy.duration}: {course.duration}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {totalLessons} {t.academy.lessons}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course._count.enrollments} {t.academy.students}
            </span>
          </div>

          {course.whatYouLearn.length > 0 && (
            <div className="mb-6">
                    <h3 className="font-semibold mb-2">What you&apos;ll learn</h3>
              <ul className="grid sm:grid-cols-2 gap-2">
                {course.whatYouLearn.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <Card className="overflow-hidden">
            <div className="aspect-video bg-muted relative">
              {previewVideoSignedUrl ? (
                <video src={previewVideoSignedUrl} controls className="w-full h-full object-cover" />
              ) : course.imageUrl ? (
                <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardContent className="p-4 space-y-4">
              <span className="text-3xl font-bold text-green-500">{t.academy.free}</span>

              <ButtonLink size="lg" className="w-full" href={`/academy/courses/${course.slug}/lessons/${firstLessonId || ""}`}>
                <Play className="h-5 w-5 ml-2" />
                {enrollment?.progress && enrollment.progress > 0 ? t.academy.resumeCourse : t.academy.startCourse}
              </ButtonLink>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modules & Lessons */}
      <section>
        <h2 className="text-2xl font-bold mb-6">{t.academy.modules}</h2>
        <div className="space-y-4">
          {course.modules.map((mod) => {
            const completedCount = mod.lessons.filter((l) => moduleProgress[l.id]).length;
            return (
              <Card key={mod.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{mod.title}</span>
                    <Badge variant="secondary">
                      {completedCount}/{mod.lessons.length}
                    </Badge>
                  </CardTitle>
                  {mod.description && (
                    <p className="text-sm text-muted-foreground">{mod.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {mod.lessons.map((lesson) => {
                      const Icon = typeIcons[lesson.type] || Play;
                      const isCompleted = moduleProgress[lesson.id];
                      return (
                        <Link
                          key={lesson.id}
                          href={`/academy/courses/${course.slug}/lessons/${lesson.id}`}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            isCompleted
                              ? "bg-green-50 dark:bg-green-950/20"
                              : "hover:bg-accent/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className={`text-sm ${isCompleted ? "text-green-600 dark:text-green-400" : ""}`}>
                              {lesson.title}
                            </span>
                            {lesson.isFree && (
                              <Badge variant="outline" className="text-xs">{t.academy.free}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {lesson.type === "VIDEO" && lesson.videoDuration && (
                              <span className="text-xs text-muted-foreground">{lesson.videoDuration}s</span>
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {course.requirements.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Requirements</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {course.requirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
