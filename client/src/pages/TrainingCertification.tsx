import { Link, useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import trainingIndex from "@/data/trainingIndex.json";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, PlayCircle, BookOpen, ArrowLeft, Clock } from "lucide-react";

export default function TrainingCertification() {
  const { certId } = useParams<{ certId: string }>();
  const { lang, toggleLang, t } = useLanguage();
  const { isCourseComplete, getCertProgress } = useTrainingProgress();

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
  const progressPct = getCertProgress(courseIds);

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

        {/* Mock Exam CTA */}
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

        {/* Course List */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {t({ en: "Course List", fr: "Liste des cours" })}
        </h2>
        <div className="space-y-3">
          {courses.map((course, idx) => {
            const completed = isCourseComplete(course.id);
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
                    <Circle className="w-5 h-5 text-slate-300" />
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
