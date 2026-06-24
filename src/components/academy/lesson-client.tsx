"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Video, FileText, FileDown, CheckCircle, Circle,
  ChevronLeft, ChevronRight, Menu, X,
  MessageSquare, StickyNote, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/components/providers/locale-provider";
import { QuizView } from "@/components/academy/quiz-view";

interface LessonData {
  id: string;
  title: string;
  description: string | null;
  type: string;
  content: string | null;
  videoUrl: string | null;
  videoDuration: number | null;
  pdfUrl: string | null;
  resourceUrl: string | null;
  resourceName: string | null;
  sortOrder: number;
}

interface ModuleData {
  id: string;
  title: string;
  sortOrder: number;
  lessons: LessonData[];
}

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; fullName: string };
}

interface QuestionData {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  sortOrder: number;
}

interface QuizData {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  questions: QuestionData[];
  attempts: Array<{ score: number; passed: boolean }>;
}

interface NoteData {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface LessonClientProps {
  lesson: LessonData;
  courseSlug: string;
  courseTitle: string;
  allModules: ModuleData[];
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  isCompleted: boolean;
  overallProgress: number;
  videoSignedUrl: string | null;
  initialComments: CommentData[];
  initialNotes: NoteData[];
  quizzes: QuizData[];
}

export function LessonClient({
  lesson,
  courseSlug,
  courseTitle,
  allModules,
  prevLesson,
  nextLesson,
  isCompleted,
  overallProgress,
  videoSignedUrl,
  initialComments,
  initialNotes,
  quizzes,
}: LessonClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const [completing, setCompleting] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const handleMarkComplete = useCallback(async () => {
    setCompleting(true);
    try {
      const res = await fetch("/api/academy/lessons/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, completed: !completed }),
      });
      if (res.ok) {
        setCompleted(!completed);
        router.refresh();
      }
    } finally {
      setCompleting(false);
    }
  }, [lesson.id, completed, router]);

  const handlePostComment = useCallback(async () => {
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      const res = await fetch("/api/academy/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, content: newComment.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, data]);
        setNewComment("");
      }
    } finally {
      setPostingComment(false);
    }
  }, [lesson.id, newComment]);

  const handleSaveNote = useCallback(async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch("/api/academy/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, content: newNote.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [data, ...prev]);
        setNewNote("");
      }
    } finally {
      setSavingNote(false);
    }
  }, [lesson.id, newNote]);

  const sidebar = (
    <div className="space-y-1">
      {allModules.map((mod) => (
        <div key={mod.id} className="mb-3">
          <h4 className="text-sm font-semibold text-muted-foreground px-3 mb-1 truncate">
            {mod.title}
          </h4>
          {mod.lessons.map((l) => {
            const isActive = l.id === lesson.id;
            const Icon = l.type === "VIDEO" ? Video :
              l.type === "PDF" ? FileText :
              l.type === "RESOURCE" ? FileDown : FileText;
            return (
              <Link
                key={l.id}
                href={`/academy/courses/${courseSlug}/lessons/${l.id}`}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-accent/50 text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1">{l.title}</span>
                {l.videoDuration && (
                  <span className="text-xs shrink-0">{l.videoDuration}s</span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:block w-72 border-r bg-muted/30 p-4 overflow-y-auto shrink-0">
        <div className="mb-4 px-3">
          <Link href={`/academy/courses/${courseSlug}`} className="text-sm font-medium hover:text-primary transition-colors block truncate">
            {courseTitle}
          </Link>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${overallProgress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{overallProgress}% complete</p>
        </div>
        <Separator className="mb-3" />
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Link href={`/academy/courses/${courseSlug}`} className="text-sm font-medium truncate">
                {courseTitle}
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Separator className="mb-3" />
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-2 p-3 border-b">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium truncate">{lesson.title}</span>
        </div>

        {/* Lesson content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-muted-foreground mb-6">{lesson.description}</p>
            )}

            {/* Type-specific content */}
            {lesson.type === "VIDEO" && videoSignedUrl && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                <video
                  src={videoSignedUrl}
                  controls
                  className="w-full h-full"
                  controlsList="nodownload"
                />
              </div>
            )}

            {lesson.type === "VIDEO" && !videoSignedUrl && lesson.videoUrl && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 flex items-center justify-center">
                <p className="text-white text-sm">Video unavailable</p>
              </div>
            )}

            {lesson.type === "TEXT" && lesson.content && (
              <div className="prose prose-lg dark:prose-invert max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            )}

            {lesson.type === "PDF" && lesson.pdfUrl && (
              <div className="mb-6">
                <iframe
                  src={lesson.pdfUrl}
                  className="w-full h-[70vh] rounded-lg border"
                  title={lesson.title}
                />
              </div>
            )}

            {lesson.type === "RESOURCE" && lesson.resourceUrl && (
              <Card className="mb-6">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <FileDown className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{lesson.resourceName || "Resource"}</p>
                      <p className="text-sm text-muted-foreground">Click to download</p>
                    </div>
                  </div>
                  <ButtonLink href={lesson.resourceUrl} target="_blank" rel="noopener noreferrer" download>
                    <FileDown className="h-4 w-4 ml-2" />
                    {t.academy.downloadResource || "Download"}
                  </ButtonLink>
                </CardContent>
              </Card>
            )}

            {/* Mark complete & navigation */}
            <div className="flex items-center justify-between gap-4 mb-8 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Button
                  variant={completed ? "default" : "outline"}
                  size="sm"
                  onClick={handleMarkComplete}
                  disabled={completing}
                >
                  {completed ? (
                    <CheckCircle className="h-4 w-4 ml-2" />
                  ) : (
                    <Circle className="h-4 w-4 ml-2" />
                  )}
                  {completed ? "Completed" : t.academy.markComplete}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {prevLesson && (
                  <ButtonLink variant="ghost" size="sm" href={`/academy/courses/${courseSlug}/lessons/${prevLesson.id}`}>
                    <ChevronLeft className="h-4 w-4 ml-1" />
                    {t.academy.prevLesson || "Previous"}
                  </ButtonLink>
                )}
                {nextLesson && (
                  <ButtonLink size="sm" href={`/academy/courses/${courseSlug}/lessons/${nextLesson.id}`}>
                    {t.academy.nextLesson || "Next"}
                    <ChevronRight className="h-4 w-4 mr-1" />
                  </ButtonLink>
                )}
              </div>
            </div>

            {/* Quizzes section */}
            {quizzes.length > 0 && (
              <div className="mb-8 space-y-6">
                <h2 className="text-xl font-bold">Quiz</h2>
                {quizzes.map((quiz) => (
                  <QuizView key={quiz.id} quiz={quiz} />
                ))}
              </div>
            )}

            {/* Notes & Comments tabs */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <StickyNote className="h-5 w-5" />
                    {t.academy.notes}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveNote}
                      disabled={savingNote || !newNote.trim()}
                    >
                      <Send className="h-4 w-4 ml-2" />
                      Save Note
                    </Button>
                  </div>
                  <Separator />
                  {notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {notes.map((note) => (
                        <div key={note.id} className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(note.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5" />
                    {t.academy.comments}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button
                      size="sm"
                      onClick={handlePostComment}
                      disabled={postingComment || !newComment.trim()}
                    >
                      <Send className="h-4 w-4 ml-2" />
                      Post Comment
                    </Button>
                  </div>
                  <Separator />
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No comments yet. Be the first!
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{comment.user.fullName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                month: "short", day: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
