import { Link, useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import trainingIndex from "@/data/trainingIndex.json";
import { ArrowLeft, CheckCircle2, PlayCircle, ChevronDown, ChevronUp, BookOpen, Lock, LogIn } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
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

// Lesson content renderer
function LessonContent({ lesson, lang, t, isExpanded, onToggle }: {
  lesson: any; lang: string; t: (obj: { en: string; fr: string }) => string;
  isExpanded: boolean; onToggle: () => void;
}) {
  const content = resolveI18n(lesson.content, lang);
  const title = resolveI18n(lesson.title, lang);

  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-medium text-slate-800 text-sm">{title}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {isExpanded && content && (
        <div className="px-4 pb-4">
          <div className="prose prose-sm max-w-none text-slate-600">
            {content.split("\n\n").map((section: string, i: number) => (
              <div key={i} className="mb-3">
                {section.split("\n").map((line: string, li: number) => {
                  if (line.startsWith("### ")) return <h4 key={li} className="text-sm font-semibold text-slate-800 mt-3 mb-1">{line.replace("### ", "")}</h4>;
                  if (line.startsWith("## ")) return <h3 key={li} className="text-base font-semibold text-slate-900 mt-4 mb-2">{line.replace("## ", "")}</h3>;
                  if (line.startsWith("# ")) return <h2 key={li} className="text-lg font-bold text-slate-900 mt-4 mb-2">{line.replace("# ", "")}</h2>;
                  if (line.startsWith("- ")) return <li key={li} className="text-sm text-slate-600 ml-4">{line.replace("- ", "")}</li>;
                  if (line.startsWith("```")) return <code key={li} className="block bg-slate-100 p-2 rounded text-xs font-mono text-slate-700 my-2">{line.replace(/```\w*/, "")}</code>;
                  if (line.trim() === "") return null;
                  return <p key={li} className="text-sm text-slate-600 leading-relaxed">{line}</p>;
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainingCourse() {
  const { certId, courseId } = useParams<{ certId: string; courseId: string }>();
  const { lang, toggleLang, t } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isLessonComplete, markLessonComplete, getNextUnlockedLesson, isCourseComplete } = useTrainingProgress();
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

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

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
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
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (nextUnlocked / totalLessons) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {Math.min(nextUnlocked, totalLessons)}/{totalLessons}
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
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
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

        {/* Lessons - Sequential with locking */}
        {courseLessons.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {t({ en: "Course Content", fr: "Contenu du cours" })}
            </h2>
            <div className="space-y-2">
              {courseLessons.map((lesson, idx) => {
                const lessonCompleted = isLessonComplete(course.id, idx);
                const isUnlocked = idx <= nextUnlocked;
                const isCurrent = idx === nextUnlocked;

                if (!isUnlocked) {
                  return (
                    <div key={lesson.id || idx} className="border border-slate-100 rounded-lg p-4 opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-slate-300 shrink-0" />
                        <span className="font-medium text-slate-400 text-sm">
                          {resolveI18n(lesson.title, lang)}
                        </span>
                      </div>
                    </div>
                  );
                }

                // Completed lessons cannot be re-opened (no relecture)
                if (lessonCompleted && !isCurrent) {
                  return (
                    <div key={lesson.id || idx} className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-medium text-slate-600 text-sm">
                            {resolveI18n(lesson.title, lang)}
                          </span>
                        </div>
                        <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {t({ en: "Completed", fr: "Termin\u00e9" })}
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={lesson.id || idx} className={`border rounded-lg overflow-hidden ${isCurrent ? "border-emerald-300 bg-emerald-50/30" : "border-slate-100"}`}>
                    <button
                      onClick={() => toggleLesson(lesson.id || `lesson-${idx}`)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {lessonCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${isCurrent ? "border-emerald-500 bg-emerald-100" : "border-slate-300"}`} />
                        )}
                        <span className={`font-medium text-sm ${lessonCompleted ? "text-slate-600" : "text-slate-800"}`}>
                          {resolveI18n(lesson.title, lang)}
                        </span>
                        {isCurrent && !lessonCompleted && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            {t({ en: "Current", fr: "En cours" })}
                          </span>
                        )}
                      </div>
                      {expandedLessons.has(lesson.id || `lesson-${idx}`) ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    {expandedLessons.has(lesson.id || `lesson-${idx}`) && (
                      <div className="px-4 pb-4">
                        <LessonContent
                          lesson={lesson}
                          lang={lang}
                          t={t}
                          isExpanded={true}
                          onToggle={() => {}}
                        />
                        {/* Mark as complete button - only for current unlocked lesson */}
                        {!lessonCompleted && isCurrent && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <Button
                              onClick={() => handleMarkLessonComplete(idx)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                            >
                              {t({ en: "Mark lesson as complete", fr: "Marquer la leçon comme terminée" })}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
