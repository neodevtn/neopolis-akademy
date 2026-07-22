import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import trainingIndex from "@/data/trainingIndex.json";
import { Progress } from "@/components/ui/progress";

const levelColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-blue-100 text-blue-800",
  advanced: "bg-purple-100 text-purple-800",
};

const levelLabels = {
  beginner: { en: "Beginner", fr: "Débutant" },
  intermediate: { en: "Intermediate", fr: "Intermédiaire" },
  advanced: { en: "Advanced", fr: "Avancé" },
};

export default function TrainingDashboard() {
  const { lang, toggleLang, t } = useLanguage();
  const { getCertProgress } = useTrainingProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-800">Neopolis</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Training</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              <span className="text-base">{lang === "en" ? "🇬🇧" : "🇫🇷"}</span>
              {lang === "en" ? "EN" : "FR"}
            </button>
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
              {t({ en: "Back to site", fr: "Retour au site" })}
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {t({ en: "Claude Certification Training", fr: "Formation Certification Claude" })}
          </h1>
          <p className="text-slate-600 text-lg">
            {t({
              en: "Prepare for your Claude certifications with structured courses, exercises, and mock exams.",
              fr: "Préparez vos certifications Claude avec des cours structurés, exercices et examens blancs.",
            })}
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">4</div>
            <div className="text-sm text-slate-500">{t({ en: "Certifications", fr: "Certifications" })}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">29</div>
            <div className="text-sm text-slate-500">{t({ en: "Courses", fr: "Cours" })}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">26</div>
            <div className="text-sm text-slate-500">{t({ en: "Videos", fr: "Vidéos" })}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">480+</div>
            <div className="text-sm text-slate-500">{t({ en: "Exercises", fr: "Exercices" })}</div>
          </div>
        </div>

        {/* Certifications Grid */}
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          {t({ en: "Certification Paths", fr: "Parcours de certification" })}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {trainingIndex.certifications.map((cert) => {
            const courses = trainingIndex.courses.filter((c) => c.certId === cert.id);
            const courseIds = courses.map((c) => c.id);
            // Estimate lesson count from exercise count (each course has roughly exerciseCount lessons)
            const totalLessonsMap: Record<string, number> = {};
            courses.forEach((c) => { totalLessonsMap[c.id] = c.exerciseCount || 5; });
            const progressPct = getCertProgress(courseIds, totalLessonsMap);
            const level = ((cert.level as any).en as string).toLowerCase() as keyof typeof levelColors;
            return (
              <Link
                key={cert.id}
                href={`/training/${cert.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-emerald-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{cert.icon}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${levelColors[level]}`}>
                    {t(levelLabels[level])}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                  {t(cert.title)}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  {t(cert.description)}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                  <span>{cert.courseCount} {t({ en: "courses", fr: "cours" })}</span>
                  <span>{cert.totalExercises} {t({ en: "exercises", fr: "exercices" })}</span>
                  {cert.totalVideos > 0 && <span>{cert.totalVideos} {t({ en: "videos", fr: "vidéos" })}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={progressPct} className="flex-1 h-2" />
                  <span className="text-xs font-medium text-slate-600">{progressPct}%</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recommended Study Order */}
        <div className="mt-10 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            {t({ en: "Recommended Study Order", fr: "Ordre d'étude recommandé" })}
          </h2>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            {trainingIndex.certifications.map((cert, i) => (
              <div key={cert.id} className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700">{t(cert.title)}</span>
                {i < trainingIndex.certifications.length - 1 && (
                  <span className="hidden md:inline text-slate-300 mx-2">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
