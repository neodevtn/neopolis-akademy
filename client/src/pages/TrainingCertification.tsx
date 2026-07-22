import { Link, useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import trainingIndex from "@/data/trainingIndex.json";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Lock, PlayCircle, BookOpen, ArrowLeft, Clock, LogIn } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function TrainingCertification() {
  const { certId } = useParams<{ certId: string }>();
  const { lang, toggleLang, t } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isCourseComplete, getCertProgress, isCertComplete, isLoading: progressLoading } = useTrainingProgress();

  const cert = trainingIndex.certifications.find((c) => c.id === certId);
  if (!cert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">{t({ en: "Certification not found", fr: "Certification introuvable" })}</p>
      </div>
    );
  }

  const courses = trainingIndex.courses.filter((c) => c.certId === certId);
  const courseIds = courses.map((c) => c.id);

  // Build totalLessonsMap from course metadata (lessonCount in trainingIndex)
  const totalLessonsMap = useMemo(() => {
    const map: Record<string, number> = {};
    courses.forEach((c) => { map[c.id] = c.lessonCount || 1; });
    return map;
  }, [courses]);

  const progressPct = useMemo(() => {
    return getCertProgress(courseIds, totalLessonsMap);
  }, [courseIds, totalLessonsMap, getCertProgress]);

  const certComplete = useMemo(() => {
    return isCertComplete(certId || "", courseIds, totalLessonsMap);
  }, [certId, courseIds, totalLessonsMap, isCertComplete]);

  // Sequential locking: a course is unlocked only if the previous one is complete
  const isCourseUnlocked = (idx: number) => {
    if (idx === 0) return true; // First course always unlocked
    if (!isAuthenticated) return false;
    const prevCourse = courses[idx - 1];
    const prevTotal = totalLessonsMap[prevCourse.id] || 0;
    return isCourseComplete(prevCourse.id, prevTotal);
  };

  const isLoading = authLoading || progressLoading;

  // Auth gate
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/training" className="text-slate-400 hover:text-slate-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <span className="text-xl font-bold text-slate-800">Neopolis</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Training</span>
            </div>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <LogIn className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {t({ en: "Authentication Required", fr: "Authentification requise" })}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {t({ en: "You must be logged in to access the training courses and track your progress.", fr: "Vous devez être connecté pour accéder aux cours et suivre votre progression." })}
            </p>
            <Button
              onClick={() => { window.location.href = getLoginUrl(); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {t({ en: "Log in to continue", fr: "Se connecter pour continuer" })}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/training" className="text-slate-400 hover:text-slate-700 transition-colors">
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
        {/* Cert Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{cert.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t(cert.title)}</h1>
              <p className="text-sm text-slate-500">{t(cert.description)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Progress value={progressPct} className="flex-1 h-3" />
            <span className="text-sm font-semibold text-slate-700">{progressPct}%</span>
          </div>
          <div className="flex items-center gap-6 mt-3 text-sm text-slate-500">
            <span>{cert.courseCount} {t({ en: "courses", fr: "cours" })}</span>
            <span>{cert.totalExercises} {t({ en: "exercises", fr: "exercices" })}</span>
            {cert.totalVideos > 0 && <span>{cert.totalVideos} {t({ en: "videos", fr: "vidéos" })}</span>}
          </div>
        </div>

        {/* Mock Exam CTA - Conditional */}
        {certComplete ? (
          <Link
            href={`/mock-exam/${certId}`}
            className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-6 hover:shadow-md hover:border-amber-300 transition-all group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                {t({ en: "Take Mock Exam", fr: "Passer l'examen blanc" })}
              </h3>
              <p className="text-sm text-slate-500">
                {t({ en: "Timed practice exam simulating real certification conditions", fr: "Examen blanc chronométré simulant les conditions réelles de certification" })}
              </p>
            </div>
            <span className="text-amber-500 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        ) : (
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 opacity-70">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-200 text-slate-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-500">
                {t({ en: "Mock Exam Locked", fr: "Examen blanc verrouillé" })}
              </h3>
              <p className="text-sm text-slate-400">
                {t({ en: "Complete all courses to unlock the mock exam", fr: "Terminez tous les cours pour débloquer l'examen blanc" })}
              </p>
            </div>
            <Lock className="w-5 h-5 text-slate-300" />
          </div>
        )}

        {/* Course List - Sequential */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {t({ en: "Course List", fr: "Liste des cours" })}
        </h2>
        <div className="space-y-3">
          {courses.map((course, idx) => {
            const totalLessons = totalLessonsMap[course.id] || 0;
            const completed = isCourseComplete(course.id, totalLessons);
            const unlocked = isCourseUnlocked(idx);

            if (!unlocked) {
              return (
                <div
                  key={course.id}
                  className="flex items-center gap-4 bg-slate-50 rounded-xl border border-slate-200 p-4 opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 text-slate-400 font-semibold text-sm shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-500 truncate">{t(course.title)}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {t({ en: "Complete the previous course to unlock", fr: "Terminez le cours précédent pour débloquer" })}
                    </p>
                  </div>
                  <Lock className="w-5 h-5 text-slate-300 shrink-0" />
                </div>
              );
            }

            return (
              <Link
                key={course.id}
                href={`/training/${certId}/${course.id}`}
                className={`flex items-center gap-4 bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
                  completed ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:border-emerald-200"
                }`}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm shrink-0">
                  {completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">{t(course.title)}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    {course.exerciseCount > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {course.exerciseCount} {t({ en: "exercises", fr: "exercices" })}
                      </span>
                    )}
                    {course.videos && course.videos.length > 0 && (
                      <span className="flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" />
                        {course.videos.length} {t({ en: "videos", fr: "vidéos" })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  {completed ? (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                      {t({ en: "Completed", fr: "Terminé" })}
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {t({ en: "In progress", fr: "En cours" })}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
