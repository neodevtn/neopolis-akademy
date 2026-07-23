import React from "react";
import { Link, useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import trainingIndex from "@/data/trainingIndex.json";
import { ArrowLeft, CheckCircle2, PlayCircle, ChevronRight, ChevronLeft, BookOpen, Lock, LogIn, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
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
function PageContent({ content, lang }: { content: string; lang: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
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

    // Headers
    if (line.startsWith("### ")) {
      elements.push(<h4 key={i} className="text-base font-semibold text-slate-800 mt-5 mb-2">{line.replace("### ", "")}</h4>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={i} className="text-lg font-semibold text-slate-900 mt-6 mb-3">{line.replace("## ", "")}</h3>);
    } else if (line.startsWith("# ")) {
      elements.push(<h2 key={i} className="text-xl font-bold text-slate-900 mt-6 mb-3">{line.replace("# ", "")}</h2>);
    }
    // Bold lines (like **Property 1**)
    else if (line.match(/^\*\*.*\*\*$/)) {
      elements.push(
        <p key={i} className="text-sm font-bold text-emerald-700 mt-4 mb-1 uppercase tracking-wide">
          {line.replace(/\*\*/g, "")}
        </p>
      );
    }
    // List items
    else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <li key={i} className="text-sm text-slate-700 ml-4 mb-1 leading-relaxed list-disc">
          {renderInlineFormatting(line.replace(/^[-•]\s*/, ""))}
        </li>
      );
    }
    // Numbered list
    else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <li key={i} className="text-sm text-slate-700 ml-4 mb-1 leading-relaxed list-decimal">
          {renderInlineFormatting(line.replace(/^\d+\.\s*/, ""))}
        </li>
      );
    }
    // Empty line = spacing
    else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    }
    // Regular paragraph
    else {
      elements.push(
        <p key={i} className="text-sm text-slate-700 leading-relaxed mb-2">
          {renderInlineFormatting(line)}
        </p>
      );
    }
  }

  // Close any unclosed code block
  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre key={`code-${codeKey}`} className="bg-slate-900 text-emerald-300 p-4 rounded-lg text-xs font-mono overflow-x-auto my-3 leading-relaxed">
        {codeLines.join("\n")}
      </pre>
    );
  }

  return <div className="prose-content">{elements}</div>;
}

// Render inline formatting (bold, italic, code)
function renderInlineFormatting(text: string): React.ReactNode {
  // Split by inline code, bold, italic
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
      parts.push(<code key={match.index} className="bg-slate-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs font-mono">{m.slice(1, -1)}</code>);
    } else if (m.startsWith("**")) {
      parts.push(<strong key={match.index} className="font-semibold text-slate-900">{m.slice(2, -2)}</strong>);
    } else if (m.startsWith("*")) {
      parts.push(<em key={match.index} className="italic text-slate-600">{m.slice(1, -1)}</em>);
    }
    lastIndex = match.index + m.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? <>{parts}</> : text;
}

// Lesson viewer with page navigation
function LessonViewer({
  lesson,
  lessonIndex,
  lang,
  t,
  isActive,
  onComplete,
}: {
  lesson: any;
  lessonIndex: number;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  isActive: boolean;
  onComplete: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const pages = lesson.pages?.[lang] || lesson.pages?.en || [];
  const totalPages = pages.length || 1;

  // Reset page when lesson changes
  useEffect(() => {
    setCurrentPage(0);
  }, [lesson.id]);

  const isLastPage = currentPage >= totalPages - 1;
  const canGoNext = currentPage < totalPages - 1;
  const canGoPrev = currentPage > 0;

  return (
    <div className="mt-2">
      {/* Page content */}
      <div className="bg-slate-50/50 rounded-lg p-6 min-h-[200px]">
        {pages[currentPage] ? (
          <PageContent content={pages[currentPage]} lang={lang} />
        ) : (
          <p className="text-sm text-slate-500 italic">{t({ en: "No content available", fr: "Aucun contenu disponible" })}</p>
        )}
      </div>

      {/* Page navigation */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={!canGoPrev}
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
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400 ml-2">
            {currentPage + 1}/{totalPages}
          </span>
        </div>

        {/* Next / Complete button */}
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
            onClick={onComplete}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t({ en: "Complete", fr: "Terminer" })}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function TrainingCourse() {
  const { certId, courseId } = useParams<{ certId: string; courseId: string }>();
  const { lang, toggleLang, t } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isLessonComplete, markLessonComplete, getNextUnlockedLesson, isCourseComplete } = useTrainingProgress();
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());

  const course = trainingIndex.courses.find((c: any) => c.id === courseId);
  const cert = trainingIndex.certifications.find((c: any) => c.id === certId);

  // Lazy-load lessons for this course
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">{t({ en: "Loading...", fr: "Chargement..." })}</p>
        </div>
      </div>
    );
  }

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/training" className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
            <span className="text-xl font-bold text-slate-800">Neopolis</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Training</span>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <LogIn className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {t({ en: "Authentication Required", fr: "Authentification requise" })}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/training/${certId}`} className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-xl font-bold text-slate-800">Neopolis</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Training</span>
          </div>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <span className="text-base">{lang === "en" ? "🇬🇧" : "🇫🇷"}</span>
            {lang === "en" ? "EN" : "FR"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <Link href="/training" className="hover:text-emerald-600">{t({ en: "Training", fr: "Formation" })}</Link>
            <span>/</span>
            <Link href={`/training/${certId}`} className="hover:text-emerald-600">{t(cert.title)}</Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t(course.title)}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {totalLessons > 0 && <span>{totalLessons} {t({ en: "lessons", fr: "leçons" })}</span>}
            {videos.length > 0 && <span>{videos.length} {t({ en: "videos", fr: "vidéos" })}</span>}
          </div>
          {/* Progress indicator */}
          {totalLessons > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (nextUnlocked / totalLessons) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                {Math.min(nextUnlocked, totalLessons)}/{totalLessons} {t({ en: "completed", fr: "terminées" })}
              </span>
            </div>
          )}
        </div>

        {/* Videos Section */}
        {videos.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-emerald-600" />
              {t({ en: "Video Lessons", fr: "Leçons vidéo" })}
            </h2>
            <div className="space-y-3">
              {videos.map((video: any) => (
                <div key={video.videoId || video.title} className="border border-slate-100 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleVideo(video.videoId || video.title)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <PlayCircle className="w-5 h-5 text-red-500 shrink-0" />
                      <span className="font-medium text-slate-800 text-sm">{video.title}</span>
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

        {/* Lessons - Sequential with page navigation */}
        {lessonsLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-6 h-6 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">{t({ en: "Loading lessons...", fr: "Chargement des leçons..." })}</p>
          </div>
        ) : courseLessons.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
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
                    <div key={lesson.id || idx} className="border border-slate-100 rounded-lg p-4 opacity-40">
                      <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-slate-300 shrink-0" />
                        <span className="font-medium text-slate-400 text-sm">
                          {resolveI18n(lesson.title, lang)}
                        </span>
                        <span className="ml-auto text-xs text-slate-300">
                          {t({ en: "Locked", fr: "Verrouillé" })}
                        </span>
                      </div>
                    </div>
                  );
                }

                // Completed lesson (no relecture)
                if (lessonCompleted) {
                  return (
                    <div key={lesson.id || idx} className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <span className="font-medium text-slate-700 text-sm">
                            {resolveI18n(lesson.title, lang)}
                          </span>
                        </div>
                        <span className="text-xs text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full font-medium">
                          {t({ en: "Completed", fr: "Terminé" })}
                        </span>
                      </div>
                    </div>
                  );
                }

                // Current active lesson (expanded with page navigation)
                if (isCurrent) {
                  return (
                    <div key={lesson.id || idx} className="border-2 border-emerald-400 rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="p-4 bg-emerald-50 border-b border-emerald-200">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{idx + 1}</span>
                          </div>
                          <span className="font-semibold text-slate-900 text-sm">
                            {resolveI18n(lesson.title, lang)}
                          </span>
                          <span className="ml-auto text-xs bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full font-medium">
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
                          isActive={true}
                          onComplete={() => handleMarkLessonComplete(idx)}
                        />
                      </div>
                    </div>
                  );
                }

                // Unlocked but not current (shouldn't happen with sequential, but handle gracefully)
                return (
                  <div key={lesson.id || idx} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                      <span className="font-medium text-slate-600 text-sm">
                        {resolveI18n(lesson.title, lang)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Course Completion Status */}
        {completed && (
          <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 shrink-0" />
            <div>
              <h3 className="font-semibold text-emerald-800">
                {t({ en: "Course completed!", fr: "Cours terminé !" })}
              </h3>
              <p className="text-sm text-emerald-600">
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
  );
}
