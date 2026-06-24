"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface QuizViewProps {
  quiz: QuizData;
}

export function QuizView({ quiz }: QuizViewProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    passingScore: number;
    results: Array<{ questionId: string; correct: boolean; correctIndex: number; explanation: string | null }>;
  } | null>(null);

  const lastAttempt = quiz.attempts?.[0];

  if (lastAttempt && !result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold">{lastAttempt.score}%</span>
            <Badge variant={lastAttempt.passed ? "default" : "destructive"}>
              {lastAttempt.passed ? "Passed" : "Failed"}
            </Badge>
          </div>
          <Button variant="outline" onClick={() => { setResult(null); setAnswers({}); }}>
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/academy/quizzes/${quiz.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({
            questionId,
            selectedIndex,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {result.passed ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-destructive" />
            )}
            <div>
              <span className="text-2xl font-bold">{result.score}%</span>
              <Badge variant={result.passed ? "default" : "destructive"} className="ml-2">
                {result.passed ? "Passed" : "Failed"}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Passing score: {result.passingScore}%
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {quiz.questions.map((q) => {
              const r = result.results.find((r) => r.questionId === q.id);
              return (
                <div key={q.id} className={`p-3 rounded-lg border ${r?.correct ? "bg-green-50 dark:bg-green-950/20 border-green-200" : "bg-red-50 dark:bg-red-950/20 border-red-200"}`}>
                  <p className="font-medium text-sm mb-2">{q.question}</p>
                  <p className="text-sm text-muted-foreground">
                    Your answer: {q.options[answers[q.id] ?? -1] ?? "Not answered"}
                  </p>
                  {!r?.correct && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Correct answer: {q.options[q.correctIndex]}
                    </p>
                  )}
                  {q.explanation && (
                    <p className="text-sm text-muted-foreground mt-1">{q.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>
          <Button variant="outline" onClick={() => { setResult(null); setAnswers({}); }}>
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  const allAnswered = Object.keys(answers).length === quiz.questions.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{quiz.title}</CardTitle>
        {quiz.description && (
          <p className="text-sm text-muted-foreground">{quiz.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Passing score: {quiz.passingScore}% &middot; {quiz.questions.length} questions
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {quiz.questions.map((q, idx) => (
          <div key={q.id}>
            <p className="font-medium mb-3">
              {idx + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => (
                <label
                  key={optIdx}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    answers[q.id] === optIdx
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === optIdx}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    answers[q.id] === optIdx ? "border-primary" : "border-muted-foreground"
                  }`}>
                    {answers[q.id] === optIdx && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <Button onClick={handleSubmit} disabled={!allAnswered || submitting} className="w-full">
          {submitting ? "Submitting..." : "Submit Answers"}
        </Button>
      </CardContent>
    </Card>
  );
}
