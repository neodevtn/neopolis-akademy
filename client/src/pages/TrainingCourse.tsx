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
  BookOpen, Lock, LogIn, ArrowRight, Moon, Sun, Menu, X, Clock, Check, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";

/* ─── Animation Variants ─── */
const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

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
  let isFirstTextLine = true; // Track first non-empty text line as section title

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
      elements.push(<h4 key={i} className="text-base font-semibold mt-5 mb-2 text-foreground">{line.replace("### ", "")}</h4>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={i} className="text-lg font-semibold mt-6 mb-3 text-foreground">{line.replace("## ", "")}</h3>);
    } else if (line.startsWith("# ")) {
      elements.push(<h2 key={i} className="text-xl font-bold mt-6 mb-3 text-foreground">{line.replace("# ", "")}</h2>);
    } else if (line.match(/^\*\*.*\*\*$/)) {
      // Sub-section title (e.g. "**Property 1**") — styled as integrated subtitle
      elements.push(
        <h4 key={i} className="text-base font-bold mt-8 mb-2 text-foreground border-l-3 border-primary pl-3">
          {line.replace(/\*\*/g, "")}
        </h4>
      );
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <li key={i} className="text-sm ml-4 mb-1 leading-relaxed list-disc text-muted-foreground">
          {renderInlineFormatting(line.replace(/^[-•]\s*/, ""))}
        </li>
      );
    } else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <li key={i} className="text-sm ml-4 mb-1 leading-relaxed list-decimal text-muted-foreground">
          {renderInlineFormatting(line.replace(/^\d+\.\s*/, ""))}
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-3" />);
    } else {
      // First non-empty text line is rendered as a prominent section title
      if (isFirstTextLine) {
        isFirstTextLine = false;
        elements.push(
          <h3 key={i} className="text-lg font-bold mb-4 pb-3 border-b border-border text-foreground">
            {renderInlineFormatting(line)}
          </h3>
        );
      } else {
        elements.push(
          <p key={i} className="text-sm leading-relaxed mb-2 text-muted-foreground">
            {renderInlineFormatting(line)}
          </p>
        );
      }
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

function renderInlineFormatting(text: string): React.ReactNode {
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
      parts.push(<code key={match.index} className="px-1.5 py-0.5 rounded text-xs font-mono bg-secondary text-primary">{m.slice(1, -1)}</code>);
    } else if (m.startsWith("**")) {
      parts.push(<strong key={match.index} className="font-semibold text-foreground">{m.slice(2, -2)}</strong>);
    } else if (m.startsWith("*")) {
      parts.push(<em key={match.index} className="italic text-muted-foreground">{m.slice(1, -1)}</em>);
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
  onPass,
}: {
  certId: string;
  lessonIndex: number;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onPass: () => void;
}) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  useEffect(() => {
    fetch("/data/mockExamQuestions.json")
      .then((r) => r.json())
      .then((allQ: any[]) => {
        const certQuestions = allQ.filter((q: any) => q.certificationId === certId);
        const shuffled = [...certQuestions].sort(() => Math.random() - 0.5);
        setQuestions(shuffled.slice(0, 3));
      })
      .catch(() => setQuestions([]));
  }, [certId, lessonIndex]);

  if (questions.length === 0) return null;

  if (quizComplete) {
    return (
      <div className="rounded-2xl p-6 border bg-card border-border">
        <div className="text-center">
          {quizPassed ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold mb-2 text-foreground">
                {t({ en: "Quiz Passed!", fr: "Quiz réussi !" })}
              </h3>
              <p className="text-sm mb-4 text-muted-foreground">
                {t({ en: `You got ${correctCount}/3 correct. You can now complete this lesson.`, fr: `Vous avez obtenu ${correctCount}/3 correct. Vous pouvez maintenant terminer cette leçon.` })}
              </p>
              <Button onClick={onPass} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {t({ en: "Complete Lesson", fr: "Terminer la leçon" })}
              </Button>
            </>
          ) : (
            <>
              <X className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold mb-2 text-foreground">
                {t({ en: "Quiz Failed", fr: "Quiz échoué" })}
              </h3>
              <p className="text-sm mb-4 text-muted-foreground">
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
    <div className="rounded-2xl p-6 border bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
          {t({ en: "Validation Quiz", fr: "Quiz de validation" })}
        </h3>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
          {currentQ + 1}/3
        </span>
      </div>

      <p className="text-sm font-medium mb-4 text-foreground">
        {resolveI18n(q.question, lang)}
      </p>

      <div className="space-y-2 mb-4">
        {q.choices.map((choice: any) => {
          const isSelected = selected === choice.id;
          const isCorrectChoice = q.correctChoiceIds.includes(choice.id);
          let choiceClass = "border-border hover:border-primary/30 bg-card";

          if (showResult) {
            if (isCorrectChoice) {
              choiceClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
            } else if (isSelected && !isCorrectChoice) {
              choiceClass = "border-red-400 bg-red-50 dark:bg-red-900/20";
            }
          } else if (isSelected) {
            choiceClass = "border-primary bg-primary/5";
          }

          return (
            <button
              key={choice.id}
              onClick={() => !showResult && setSelected(choice.id)}
              disabled={showResult}
              className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${choiceClass} ${showResult ? "cursor-default" : "cursor-pointer"}`}
            >
              <span className="font-medium mr-2 text-muted-foreground">{choice.id.toUpperCase()}.</span>
              <span className="text-foreground">{resolveI18n(choice.text, lang)}</span>
            </button>
          );
        })}
      </div>

      {!showResult ? (
        <Button
          onClick={() => setShowResult(true)}
          disabled={!selected}
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
        >
          {t({ en: "Check Answer", fr: "Vérifier la réponse" })}
        </Button>
      ) : (
        <div>
          <div className="text-xs p-3 rounded-lg mb-3 bg-secondary text-muted-foreground">
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
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
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
  certId,
  onComplete,
  matchedVideos,
  completedVideos,
  expandedVideos,
  playingVideos,
  toggleVideo,
  startPlayingVideo,
  toggleVideoComplete,
  getYouTubeThumbnail,
}: {
  lesson: any;
  lessonIndex: number;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  certId: string;
  onComplete: () => void;
  matchedVideos: any[];
  completedVideos: Set<string>;
  expandedVideos: Set<string>;
  playingVideos: Set<string>;
  toggleVideo: (id: string) => void;
  startPlayingVideo: (id: string) => void;
  toggleVideoComplete: (id: string) => void;
  getYouTubeThumbnail: (id: string) => string;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const pages = lesson.pages?.[lang] || lesson.pages?.en || [];
  const totalPages = pages.length || 1;

  // Detect if content is displayed in English (either no fr translation, or fr is same as en)
  const isEnglishContent = (() => {
    if (lang === "en") return false;
    if (!lesson.pages?.fr || lesson.pages.fr.length === 0) return true;
    if (lesson.pages?.en && lesson.pages.fr[0] === lesson.pages.en[0]) return true;
    return false;
  })();

  useEffect(() => {
    setCurrentPage(0);
    setShowQuiz(false);
  }, [lesson.id]);

  const isLastPage = currentPage >= totalPages - 1;

  return (
    <div className="mt-2">
      {!showQuiz ? (
        <>
          {/* Matched video(s) for this lesson */}
          {matchedVideos.length > 0 && (
            <div className="mb-4 space-y-3">
              {matchedVideos.map((video: any) => {
                const videoKey = video.youtube_id || video.videoId || video.title;
                const isVideoComplete = completedVideos.has(videoKey);
                const isExpanded = expandedVideos.has(videoKey);
                const isPlaying = playingVideos.has(videoKey);
                const durationSec = video.duration_seconds;
                const duration = durationSec
                  ? `${Math.floor(durationSec / 60)} min`
                  : (video.duration || "~5 min");

                return (
                  <div
                    key={videoKey}
                    className={`border rounded-xl overflow-hidden transition-colors ${
                      isVideoComplete
                        ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <button
                      onClick={() => toggleVideo(videoKey)}
                      className="w-full flex items-center justify-between p-3 transition-colors text-left hover:bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        {isVideoComplete ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <PlayCircle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                        <span className="font-medium text-sm text-foreground">
                          {video.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {duration}
                        </span>
                        {isExpanded ? (
                          <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-90" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3">
                        {!isPlaying ? (
                          <div
                            className="aspect-video rounded-lg overflow-hidden bg-black relative cursor-pointer group"
                            onClick={() => startPlayingVideo(videoKey)}
                          >
                            <img
                              src={getYouTubeThumbnail(video.youtube_id || "")}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <PlayCircle className="w-7 h-7 text-white fill-white" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
                              {duration}
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video rounded-lg overflow-hidden bg-black">
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?rel=0&modestbranding=1&autoplay=1`}
                              title={video.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="no-referrer-when-downgrade"
                              allowFullScreen
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <Button
                            variant={isVideoComplete ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleVideoComplete(videoKey)}
                            className={`gap-1.5 text-xs ${
                              isVideoComplete
                                ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                : "bg-primary hover:bg-primary/90 text-primary-foreground"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            {isVideoComplete
                              ? t({ en: "Completed", fr: "Terminée" })
                              : t({ en: "Mark as watched", fr: "Marquer comme vue" })
                            }
                          </Button>
                          {video.watch_url && (
                            <a
                              href={video.watch_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              {t({ en: "Watch on YouTube", fr: "Regarder sur YouTube" })}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Language badge */}
          {isEnglishContent && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold uppercase tracking-wider">
                EN
              </span>
              <span className="text-xs text-muted-foreground">
                {t({ en: "Content in English", fr: "Contenu en anglais" })}
              </span>
            </div>
          )}

          {/* Page content */}
          <div className="rounded-xl p-6 min-h-[200px] bg-secondary/30">
            {pages[currentPage] ? (
              <PageContent content={pages[currentPage]} lang={lang} />
            ) : (
              <p className="text-sm italic text-muted-foreground">
                {t({ en: "No content available", fr: "Aucun contenu disponible" })}
              </p>
            )}
          </div>

          {/* Page navigation */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
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
                        ? "bg-primary w-4"
                        : i < currentPage
                        ? "bg-primary/50"
                        : "bg-secondary"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs ml-2 text-muted-foreground">
                {currentPage + 1}/{totalPages}
              </span>
            </div>

            {!isLastPage ? (
              <Button
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
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
  t,
  nextUnlocked,
  isLessonComplete,
  courseId,
  sidebarOpen,
  onClose,
}: {
  lessons: any[];
  lang: string;
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
        className={`fixed top-0 left-0 z-50 h-full w-72 transition-transform duration-300 ease-out lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:z-10 overflow-y-auto bg-card border-r border-border ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
          <span className="text-sm font-bold text-foreground">
            {t({ en: "Lessons", fr: "Leçons" })}
          </span>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lesson list */}
        <div className="p-3 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider px-3 py-2 text-muted-foreground">
            {t({ en: "Progress", fr: "Progression" })}
          </p>
          {lessons.map((lesson, idx) => {
            const completed = isLessonComplete(courseId, idx);
            const isCurrent = idx === nextUnlocked && !completed;
            const isLocked = idx > nextUnlocked;

            let statusIcon: React.ReactNode;
            let bgClass = "";
            let textClass = "text-muted-foreground";

            if (completed) {
              statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
              textClass = "text-foreground";
            } else if (isCurrent) {
              statusIcon = (
                <div className="w-4 h-4 rounded-full bg-primary shrink-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              );
              bgClass = "bg-primary/5 border border-primary/30";
              textClass = "text-foreground";
            } else if (isLocked) {
              statusIcon = <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
              textClass = "text-muted-foreground";
            } else {
              statusIcon = <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />;
            }

            return (
              <div
                key={lesson.id || idx}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${bgClass} ${isLocked ? "opacity-50" : ""}`}
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
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);


  // Server-synced video progress
  const videoProgressQuery = trpc.videoProgress.get.useQuery(
    { courseId: courseId || "" },
    { enabled: isAuthenticated && !!courseId }
  );
  const toggleVideoMutation = trpc.videoProgress.toggle.useMutation({
    onSuccess: () => { videoProgressQuery.refetch(); },
  });

  // Derive completed set from server data (fallback to localStorage for non-auth)
  const completedVideos = useMemo(() => {
    if (videoProgressQuery.data) {
      return new Set(videoProgressQuery.data.map((vp: any) => vp.youtubeId));
    }
    // Fallback to localStorage if not authenticated
    try {
      const stored = localStorage.getItem(`video_progress_${courseId}`);
      return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    } catch { return new Set<string>(); }
  }, [videoProgressQuery.data, courseId]);

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{t({ en: "Loading...", fr: "Chargement..." })}</p>
        </div>
      </div>
    );
  }

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link href="/training" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold text-foreground">Neopolis</span>
              <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase">Training</span>
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="bg-card rounded-2xl border border-border p-10 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {t({ en: "Authentication Required", fr: "Authentification requise" })}
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t({ en: "You must be logged in to access courses.", fr: "Vous devez être connecté pour accéder aux cours." })}
            </p>
            <Button onClick={() => { window.location.href = getLoginUrl(); }} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl">
              {t({ en: "Log in", fr: "Se connecter" })}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!course || !cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t({ en: "Course not found", fr: "Cours introuvable" })}</p>
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

  const startPlayingVideo = (videoId: string) => {
    setPlayingVideos((prev) => new Set(prev).add(videoId));
  };

  const toggleVideoComplete = (videoId: string) => {
    if (isAuthenticated && courseId) {
      toggleVideoMutation.mutate({ courseId, youtubeId: videoId });
    } else {
      // Fallback to localStorage for non-authenticated users
      try {
        const stored = localStorage.getItem(`video_progress_${courseId}`);
        const set = stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
        if (set.has(videoId)) set.delete(videoId);
        else set.add(videoId);
        localStorage.setItem(`video_progress_${courseId}`, JSON.stringify(Array.from(set)));
      } catch {}
    }
  };

  // Get YouTube thumbnail URL from youtube_id
  const getYouTubeThumbnail = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  };

  const handleMarkLessonComplete = (lessonIndex: number) => {
    if (certId && courseId) {
      markLessonComplete(certId, courseId, lessonIndex);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href={`/training/${certId}`} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold text-foreground">Neopolis</span>
              <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase">Training</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors"
            >
              <span>{lang === "en" ? "🇬🇧" : "🇫🇷"}</span>
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
            t={t}
            nextUnlocked={nextUnlocked}
            isLessonComplete={isLessonComplete}
            courseId={course.id}
            sidebarOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <motion.main
          className="flex-1 max-w-4xl mx-auto px-4 py-8 lg:px-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Course Header */}
          <motion.div variants={fadeInUp} className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm mb-2 text-muted-foreground">
              <Link href="/training" className="hover:text-primary transition-colors">
                {t({ en: "Training", fr: "Formation" })}
              </Link>
              <span>/</span>
              <Link href={`/training/${certId}`} className="hover:text-primary transition-colors">
                {t(cert.title)}
              </Link>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-foreground">{t(course.title)}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {totalLessons > 0 && <span>{totalLessons} {t({ en: "lessons", fr: "leçons" })}</span>}
              {videos.length > 0 && <span>{videos.length} {t({ en: "videos", fr: "vidéos" })}</span>}
            </div>
            {/* Progress bar */}
            {totalLessons > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 rounded-full h-2.5 bg-secondary">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (nextUnlocked / totalLessons) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium whitespace-nowrap text-muted-foreground">
                  {Math.min(nextUnlocked, totalLessons)}/{totalLessons} {t({ en: "completed", fr: "terminées" })}
                </span>
              </div>
            )}
          </motion.div>

          {/* Active Lesson Viewer */}
          {lessonsLoading ? (
            <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm">
              <div className="w-6 h-6 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t({ en: "Loading lessons...", fr: "Chargement des leçons..." })}</p>
            </div>
          ) : courseLessons.length > 0 && (() => {
            const currentLesson = courseLessons[nextUnlocked];
            const currentLessonCompleted = currentLesson ? isLessonComplete(course.id, nextUnlocked) : false;
            if (!currentLesson || currentLessonCompleted) return null;

            // Match videos to this lesson by title
            const lessonTitle = resolveI18n(currentLesson.title, "en").toLowerCase().trim();
            const lessonVideos = videos.filter((v: any) => {
              const vTitle = (v.title || "").toLowerCase().trim();
              return vTitle === lessonTitle;
            });

            return (
              <motion.div variants={fadeInUp} className="border-2 border-primary rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{nextUnlocked + 1}</span>
                    </div>
                    <span className="font-semibold text-sm text-foreground">
                      {resolveI18n(currentLesson.title, lang)}
                    </span>
                    {lessonVideos.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <PlayCircle className="w-3 h-3" />
                        {lessonVideos.length} {lessonVideos.length > 1 ? "vidéos" : "vidéo"}
                      </span>
                    )}
                    <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium bg-primary/10 text-primary">
                      {t({ en: "In Progress", fr: "En cours" })}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <LessonViewer
                    lesson={currentLesson}
                    lessonIndex={nextUnlocked}
                    lang={lang}
                    t={t}
                    certId={certId || ""}
                    onComplete={() => handleMarkLessonComplete(nextUnlocked)}
                    matchedVideos={lessonVideos}
                    completedVideos={completedVideos}
                    expandedVideos={expandedVideos}
                    playingVideos={playingVideos}
                    toggleVideo={toggleVideo}
                    startPlayingVideo={startPlayingVideo}
                    toggleVideoComplete={toggleVideoComplete}
                    getYouTubeThumbnail={getYouTubeThumbnail}
                  />
                </div>
              </motion.div>
            );
          })()}

          {/* Course Completion */}
          {completed && (
            <motion.div variants={fadeInUp} className="flex items-center gap-4 border border-primary/30 rounded-2xl p-6 bg-primary/5">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">
                  {t({ en: "Course completed!", fr: "Cours terminé !" })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: "Great job! You can move on to the next course.", fr: "Bravo ! Vous pouvez passer au cours suivant." })}
                </p>
                <Link href={`/training/${certId}`}>
                  <Button size="sm" className="mt-3 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
                    {t({ en: "Back to certification", fr: "Retour à la certification" })}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </motion.main>
      </div>
    </div>
  );
}
