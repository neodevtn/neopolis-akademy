import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { getLoginUrl } from "@/const";
import trainingIndex from "@/data/trainingIndex.json";
import {
  ArrowLeft, CheckCircle2, PlayCircle, ChevronRight, ChevronLeft,
  BookOpen, Lock, LogIn, ArrowRight, Moon, Sun, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper to resolve {en, fr} objects or plain strings
function resolveI18n(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && (val.en || val.fr)) {
    return lang === "fr" ? (val.fr || val.en || "") : (val.en || val.fr || "");
  }
  return String(val);
}

// Markdown-like content renderer for a single page
function PageContent({ content, lang, isDark }: { content: string; lang: string; isDark: boolean }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${codeKey++}`} className="bg-slate-900 text-emerald-300 p-4 rounded-lg text-xs font-mono overflow-x-auto my-3 leading-relaxed">
            {codeLines.join("\n")}
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(<h4 key={i} className={`text-base font-semibold mt-5 mb-2 ${isDark ? "text-slate-200" : "text-slate-800"}`}>{line.replace("### ", "")}</h4>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={i} className={`text-lg font-semibold mt-6 mb-3 ${isDark ? "text-slate-100" : "text-slate-900"}`}>{line.replace("## ", "")}</h3>);
    } else if (line.startsWith("# ")) {
      elements.push(<h2 key={i} className={`text-xl font-bold mt-6 mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>{line.replace("# ", "")}</h2>);
    } else if (line.match(/^\*\*.*\*\*$/)) {
      elements.push(
        <p key={i} className={`text-sm font-bold mt-4 mb-1 uppercase tracking-wide ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
          {line.replace(/\*\*/g, "")}
        </p>
      );
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <li key={i} className={`text-sm ml-4 mb-1 leading-relaxed list-disc ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          {renderInlineFormatting(line.replace(/^[-•]\s*/, ""), isDark)}
        </li>
      );
    } else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <li key={i} className={`text-sm ml-4 mb-1 leading-relaxed list-decimal ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          {renderInlineFormatting(line.replace(/^\d+\.\s*/, ""), isDark)}
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className={`text-sm leading-relaxed mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          {renderInlineFormatting(line, isDark)}
        </p>
      );
    }
  }

  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre key={`code-${codeKey}`} className="bg-slate-900 text-emerald-300 p-4 rounded-lg text-xs font-mono overflow-x-auto my-3 leading-relaxed">
        {codeLines.join("\n")}
      </pre>
    );
  }

  return <div className="prose-content">{elements}</div>;
}

function renderInlineFormatting(text: string, isDark: boolean): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const m = match[0];
    if (m.startsWith("`")) {
      parts.push(<code key={match.index} className={`px-1.5 py-0.5 rounded text-xs font-mono ${isDark ? "bg-slate-700 text-emerald-300" : "bg-slate-100 text-emerald-700"}`}>{m.slice(1, -1)}</code>);
    } else if (m.startsWith("**")) {
      parts.push(<strong key={match.index} className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{m.slice(2, -2)}</strong>);
    } else if (m.startsWith("*")) {
      parts.push(<em key={match.index} className={`italic ${isDark ? "text-slate-400" : "text-slate-600"}`}>{m.slice(1, -1)}</em>);
    }
    lastIndex = match.index + m.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? <>{parts}</> : text;
}

// Quiz component for lesson validation
function LessonQuiz({
  certId,
  lessonIndex,
  lang,
  t,
  isDark,
  onPass,
}: {
  certId: string;
  lessonIndex: number;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  isDark: boolean;
  onPass: () => void;
}) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  // Load 3 random questions for this certification
  useEffect(() => {
    fetch("/data/mockExamQuestions.json")
      .then((r) => r.json())
      .then((allQ: any[]) => {
        const certQuestions = allQ.filter((q: any) => q.certificationId === certId);
        // Shuffle and pick 3
        const shuffled = [...certQuestions].sort(() => Math.random() - 0.5);
        setQuestions(shuffled.slice(0, 3));
      })
      .catch(() => setQuestions([]));
  }, [certId, lessonIndex]);

  if (questions.length === 0) {
    return null;
  }

  if (quizComplete) {
    return (
      <div className={`rounded-xl p-6 border ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="text-center">
          {quizPassed ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                {t({ en: "Quiz Passed!", fr: "Quiz réussi !" })}
              </h3>
              <p className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {t({ en: `You got ${correctCount}/3 correct. You can now complete this lesson.`, fr: `Vous avez obtenu ${correctCount}/3 correct. Vous pouvez maintenant terminer cette leçon.` })}
              </p>
              <Button onClick={onPass} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {t({ en: "Complete Lesson", fr: "Terminer la leçon" })}
              </Button>
            </>
          ) : (
            <>
              <X className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                {t({ en: "Quiz Failed", fr: "Quiz échoué" })}
              </h3>
              <p className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {t({ en: `You got ${correctCount}/3. You need at least 2/3 to pass. Try again!`, fr: `Vous avez obtenu ${correctCount}/3. Il faut au moins 2/3 pour réussir. Réessayez !` })}
              </p>
              <Button
                onClick={() => {
                  setCurrentQ(0);
                  setSelected(null);
                  setShowResult(false);
                  setCorrectCount(0);
                  setQuizComplete(false);
                  setQuizPassed(false);
                  // Reshuffle
                  setQuestions((prev) => [...prev].sort(() => Math.random() - 0.5));
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              >
                {t({ en: "Retry Quiz", fr: "Réessayer le quiz" })}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;

  const isCorrect = selected && q.correctChoiceIds.includes(selected);

  return (
    <div className={`rounded-xl p-6 border ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-amber-50/50 border-amber-200"}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-bold uppercase tracking-wide ${isDark ? "text-amber-400" : "text-amber-700"}`}>
          {t({ en: "Validation Quiz", fr: "Quiz de validation" })}
        </h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${isDark ? "bg-slate-700 text-slate-300" : "bg-amber-100 text-amber-700"}`}>
          {currentQ + 1}/3
        </span>
      </div>

      <p className={`text-sm font-medium mb-4 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
        {resolveI18n(q.question, lang)}
      </p>

      <div className="space-y-2 mb-4">
        {q.choices.map((choice: any) => {
          const isSelected = selected === choice.id;
          const isCorrectChoice = q.correctChoiceIds.includes(choice.id);
          let choiceClass = isDark
            ? "border-slate-600 hover:border-slate-500 bg-slate-800"
            : "border-slate-200 hover:border-emerald-300 bg-white";

          if (showResult) {
            if (isCorrectChoice) {
              choiceClass = isDark ? "border-emerald-500 bg-emerald-900/30" : "border-emerald-500 bg-emerald-50";
            } else if (isSelected && !isCorrectChoice) {
              choiceClass = isDark ? "border-red-500 bg-red-900/30" : "border-red-400 bg-red-50";
            }
          } else if (isSelected) {
            choiceClass = isDark ? "border-emerald-500 bg-emerald-900/20" : "border-emerald-500 bg-emerald-50";
          }

          return (
            <button
              key={choice.id}
              onClick={() => !showResult && setSelected(choice.id)}
              disabled={showResult}
              className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${choiceClass} ${showResult ? "cursor-default" : "cursor-pointer"}`}
            >
              <span className={`font-medium mr-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{choice.id.toUpperCase()}.</span>
              <span className={isDark ? "text-slate-200" : "text-slate-700"}>{resolveI18n(choice.text, lang)}</span>
            </button>
          );
        })}
      </div>

      {!showResult ? (
        <Button
          onClick={() => setShowResult(true)}
          disabled={!selected}
          className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
        >
          {t({ en: "Check Answer", fr: "Vérifier la réponse" })}
        </Button>
      ) : (
        <div>
          <div className={`text-xs p-3 rounded-lg mb-3 ${isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
            {resolveI18n(q.explanation, lang)}
          </div>
          <Button
            onClick={() => {
              const newCorrect = correctCount + (isCorrect ? 1 : 0);
              setCorrectCount(newCorrect);
              if (currentQ >= 2) {
                setQuizComplete(true);
                setQuizPassed(newCorrect >= 2);
              } else {
                setCurrentQ((p) => p + 1);
                setSelected(null);
                setShowResult(false);
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
          >
            {currentQ >= 2
              ? t({ en: "See Results", fr: "Voir les résultats" })
              : t({ en: "Next Question", fr: "Question suivante" })}
          </Button>
        </div>
      )}
    </div>
  );
}

// Lesson viewer with page navigation + quiz at end
function LessonViewer({
  lesson,
  lessonIndex,
  lang,
  t,
  isDark,
  certId,
  onComplete,
}: {
  lesson: any;
  lessonIndex: number;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  isDark: boolean;
  certId: string;
  onComplete: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const pages = lesson.pages?.[lang] || lesson.pages?.en || [];
  const totalPages = pages.length || 1;

  useEffect(() => {
    setCurrentPage(0);
    setShowQuiz(false);
  }, [lesson.id]);

  const isLastPage = currentPage >= totalPages - 1;

  return (
    <div className="mt-2">
      {!showQuiz ? (
        <>
          {/* Page content */}
          <div className={`rounded-lg p-6 min-h-[200px] ${isDark ? "bg-slate-800/50" : "bg-slate-50/50"}`}>
            {pages[currentPage] ? (
              <PageContent content={pages[currentPage]} lang={lang} isDark={isDark} />
            ) : (
              <p className={`text-sm italic ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                {t({ en: "No content available", fr: "Aucun contenu disponible" })}
              </p>
            )}
          </div>

          {/* Page navigation */}
          <div className={`flex items-center justify-between mt-4 pt-4 border-t ${isDark ? "border-slate-700" : "border-slate-100"}`}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              {t({ en: "Previous", fr: "Précédent" })}
            </Button>

            {/* Page indicator */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentPage
                        ? "bg-emerald-500 w-4"
                        : i < currentPage
                        ? "bg-emerald-300"
                        : isDark ? "bg-slate-600" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className={`text-xs ml-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {currentPage + 1}/{totalPages}
              </span>
            </div>

            {!isLastPage ? (
              <Button
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                {t({ en: "Next", fr: "Suivant" })}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowQuiz(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              >
                {t({ en: "Take Quiz", fr: "Passer le quiz" })}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </>
      ) : (
        <LessonQuiz
          certId={certId}
          lessonIndex={lessonIndex}
          lang={lang}
          t={t}
          isDark={isDark}
          onPass={onComplete}
        />
      )}
    </div>
  );
}

// Sidebar component
function LessonSidebar({
  lessons,
  lang,
  isDark,
  t,
  nextUnlocked,
  isLessonComplete,
  courseId,
  sidebarOpen,
  onClose,
}: {
  lessons: any[];
  lang: string;
  isDark: boolean;
  t: (obj: { en: string; fr: string }) => string;
  nextUnlocked: number;
  isLessonComplete: (courseId: string, idx: number) => boolean;
  courseId: string;
  sidebarOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 transition-transform duration-300 ease-out lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:z-10 overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDark ? "bg-slate-900 border-r border-slate-700" : "bg-white border-r border-slate-200"}`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200">
          <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {t({ en: "Lessons", fr: "Leçons" })}
          </span>
          <button onClick={onClose} className={`p-1 rounded ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lesson list */}
        <div className="p-3 space-y-1">
          <p className={`text-xs font-bold uppercase tracking-wider px-3 py-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {t({ en: "Progress", fr: "Progression" })}
          </p>
          {lessons.map((lesson, idx) => {
            const completed = isLessonComplete(courseId, idx);
            const isCurrent = idx === nextUnlocked && !completed;
            const isLocked = idx > nextUnlocked;

            let statusIcon: React.ReactNode;
            let bgClass = "";
            let textClass = isDark ? "text-slate-400" : "text-slate-500";

            if (completed) {
              statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
              textClass = isDark ? "text-slate-300" : "text-slate-600";
            } else if (isCurrent) {
              statusIcon = (
                <div className="w-4 h-4 rounded-full bg-emerald-500 shrink-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              );
              bgClass = isDark ? "bg-emerald-900/20 border-emerald-700" : "bg-emerald-50 border-emerald-200";
              textClass = isDark ? "text-white" : "text-slate-900";
            } else if (isLocked) {
              statusIcon = <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
              textClass = isDark ? "text-slate-600" : "text-slate-400";
            } else {
              statusIcon = <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />;
            }

            return (
              <div
                key={lesson.id || idx}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${bgClass} ${
                  isCurrent ? "border" : ""
                } ${isLocked ? "opacity-50" : ""}`}
              >
                {statusIcon}
                <span className={`truncate font-medium ${textClass}`}>
                  {resolveI18n(lesson.title, lang)}
                </span>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}

export default function TrainingCourse() {
  const { certId, courseId } = useParams<{ certId: string; courseId: string }>();
  const { lang, toggleLang, t } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isLessonComplete, markLessonComplete, getNextUnlockedLesson, isCourseComplete } = useTrainingProgress();
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDark = theme === "dark";
  const course = trainingIndex.courses.find((c: any) => c.id === courseId);
  const cert = trainingIndex.certifications.find((c: any) => c.id === certId);

  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    setLessonsLoading(true);
    fetch(`/data/courses/${courseId}.json`)
      .then((res) => res.json())
      .then((data) => {
        setCourseLessons(data.lessons || []);
        setLessonsLoading(false);
      })
      .catch(() => {
        setCourseLessons([]);
        setLessonsLoading(false);
      });
  }, [courseId]);

  // Loading state
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t({ en: "Loading...", fr: "Chargement..." })}</p>
        </div>
      </div>
    );
  }

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}>
        <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${isDark ? "bg-slate-900/80 border-slate-700" : "bg-white/80 border-slate-200"}`}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/training" className={isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-700"}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>Neopolis</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Training</span>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className={`rounded-xl border p-8 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
            <LogIn className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              {t({ en: "Authentication Required", fr: "Authentification requise" })}
            </h2>
            <p className={`text-sm mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {t({ en: "You must be logged in to access courses.", fr: "Vous devez être connecté pour accéder aux cours." })}
            </p>
            <Button onClick={() => { window.location.href = getLoginUrl(); }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {t({ en: "Log in", fr: "Se connecter" })}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!course || !cert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">{t({ en: "Course not found", fr: "Cours introuvable" })}</p>
      </div>
    );
  }

  const totalLessons = courseLessons.length;
  const completed = isCourseComplete(course.id, totalLessons);
  const nextUnlocked = getNextUnlockedLesson(course.id, totalLessons);
  const videos = course.videos || [];

  const toggleVideo = (videoId: string) => {
    setExpandedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  const handleMarkLessonComplete = (lessonIndex: number) => {
    if (certId && courseId) {
      markLessonComplete(certId, courseId, lessonIndex);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}>
      {/* Header */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b ${isDark ? "bg-slate-900/80 border-slate-700" : "bg-white/80 border-slate-200"}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-1.5 rounded-lg ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href={`/training/${certId}`} className={`${isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-700"} transition-colors`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>Neopolis</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Training</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-amber-400" : "hover:bg-slate-100 text-slate-500"}`}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                isDark ? "border-slate-600 hover:bg-slate-700 text-slate-300" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">{lang === "en" ? "🇬🇧" : "🇫🇷"}</span>
              {lang === "en" ? "EN" : "FR"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {!lessonsLoading && courseLessons.length > 0 && (
          <LessonSidebar
            lessons={courseLessons}
            lang={lang}
            isDark={isDark}
            t={t}
            nextUnlocked={nextUnlocked}
            isLessonComplete={isLessonComplete}
            courseId={course.id}
            sidebarOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 lg:px-8">
          {/* Course Header */}
          <div className={`rounded-xl border p-6 mb-6 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
            <div className={`flex items-center gap-2 text-sm mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              <Link href="/training" className={`${isDark ? "hover:text-emerald-400" : "hover:text-emerald-600"}`}>
                {t({ en: "Training", fr: "Formation" })}
              </Link>
              <span>/</span>
              <Link href={`/training/${certId}`} className={`${isDark ? "hover:text-emerald-400" : "hover:text-emerald-600"}`}>
                {t(cert.title)}
              </Link>
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{t(course.title)}</h1>
            <div className={`flex items-center gap-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {totalLessons > 0 && <span>{totalLessons} {t({ en: "lessons", fr: "leçons" })}</span>}
              {videos.length > 0 && <span>{videos.length} {t({ en: "videos", fr: "vidéos" })}</span>}
            </div>
            {/* Progress bar */}
            {totalLessons > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <div className={`flex-1 rounded-full h-2.5 ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (nextUnlocked / totalLessons) * 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {Math.min(nextUnlocked, totalLessons)}/{totalLessons} {t({ en: "completed", fr: "terminées" })}
                </span>
              </div>
            )}
          </div>

          {/* Videos Section */}
          {videos.length > 0 && (
            <div className={`rounded-xl border p-6 mb-6 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                <PlayCircle className="w-5 h-5 text-emerald-600" />
                {t({ en: "Video Lessons", fr: "Leçons vidéo" })}
              </h2>
              <div className="space-y-3">
                {videos.map((video: any) => (
                  <div key={video.videoId || video.title} className={`border rounded-lg overflow-hidden ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                    <button
                      onClick={() => toggleVideo(video.videoId || video.title)}
                      className={`w-full flex items-center justify-between p-4 transition-colors text-left ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <span className={`font-medium text-sm ${isDark ? "text-slate-200" : "text-slate-800"}`}>{video.title}</span>
                      </div>
                      {expandedVideos.has(video.videoId || video.title) ? (
                        <ChevronLeft className="w-4 h-4 text-slate-400 rotate-90" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                      )}
                    </button>
                    {expandedVideos.has(video.videoId || video.title) && (
                      <div className="px-4 pb-4">
                        <div className="aspect-video rounded-lg overflow-hidden bg-black">
                          <iframe
                            src={video.embedUrl || video.embed_url}
                            title={video.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lessons */}
          {lessonsLoading ? (
            <div className={`rounded-xl border p-8 text-center ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
              <div className="w-6 h-6 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t({ en: "Loading lessons...", fr: "Chargement des leçons..." })}</p>
            </div>
          ) : courseLessons.length > 0 && (
            <div className={`rounded-xl border p-6 mb-6 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                <BookOpen className="w-5 h-5 text-blue-600" />
                {t({ en: "Course Content", fr: "Contenu du cours" })}
              </h2>
              <div className="space-y-3">
                {courseLessons.map((lesson, idx) => {
                  const lessonCompleted = isLessonComplete(course.id, idx);
                  const isUnlocked = idx <= nextUnlocked;
                  const isCurrent = idx === nextUnlocked && !lessonCompleted;

                  // Locked lesson
                  if (!isUnlocked) {
                    return (
                      <div key={lesson.id || idx} className={`border rounded-lg p-4 opacity-40 ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                        <div className="flex items-center gap-3">
                          <Lock className={`w-4 h-4 shrink-0 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                          <span className={`font-medium text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {resolveI18n(lesson.title, lang)}
                          </span>
                          <span className={`ml-auto text-xs ${isDark ? "text-slate-600" : "text-slate-300"}`}>
                            {t({ en: "Locked", fr: "Verrouillé" })}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Completed lesson
                  if (lessonCompleted) {
                    return (
                      <div key={lesson.id || idx} className={`border rounded-lg p-4 ${isDark ? "border-emerald-800 bg-emerald-900/20" : "border-emerald-200 bg-emerald-50/30"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <span className={`font-medium text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                              {resolveI18n(lesson.title, lang)}
                            </span>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isDark ? "bg-emerald-900 text-emerald-300" : "bg-emerald-100 text-emerald-600"}`}>
                            {t({ en: "Completed", fr: "Terminé" })}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Current active lesson
                  if (isCurrent) {
                    return (
                      <div key={lesson.id || idx} className={`border-2 rounded-xl overflow-hidden shadow-sm ${isDark ? "border-emerald-600 bg-slate-800" : "border-emerald-400 bg-white"}`}>
                        <div className={`p-4 border-b ${isDark ? "bg-emerald-900/30 border-emerald-800" : "bg-emerald-50 border-emerald-200"}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{idx + 1}</span>
                            </div>
                            <span className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                              {resolveI18n(lesson.title, lang)}
                            </span>
                            <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium ${isDark ? "bg-emerald-900 text-emerald-300" : "bg-emerald-200 text-emerald-800"}`}>
                              {t({ en: "In Progress", fr: "En cours" })}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <LessonViewer
                            lesson={lesson}
                            lessonIndex={idx}
                            lang={lang}
                            t={t}
                            isDark={isDark}
                            certId={certId || ""}
                            onComplete={() => handleMarkLessonComplete(idx)}
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={lesson.id || idx} className={`border rounded-lg p-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${isDark ? "border-slate-600" : "border-slate-300"}`} />
                        <span className={`font-medium text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          {resolveI18n(lesson.title, lang)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Course Completion */}
          {completed && (
            <div className={`flex items-center gap-4 border rounded-xl p-6 ${isDark ? "bg-emerald-900/20 border-emerald-800" : "bg-emerald-50 border-emerald-200"}`}>
              <CheckCircle2 className="w-10 h-10 text-emerald-500 shrink-0" />
              <div>
                <h3 className={`font-semibold ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>
                  {t({ en: "Course completed!", fr: "Cours terminé !" })}
                </h3>
                <p className={`text-sm ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                  {t({ en: "Great job! You can move on to the next course.", fr: "Bravo ! Vous pouvez passer au cours suivant." })}
                </p>
                <Link href={`/training/${certId}`}>
                  <Button size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                    {t({ en: "Back to certification", fr: "Retour à la certification" })}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
