import { motion } from "framer-motion";
import { ChevronRight, PlayCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import trainingIndex from "@/data/trainingIndex.json";

export default function HomeResumeReadingWidget() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { getLastVisitedCourse, isLoading } = useTrainingProgress();

  if (!isAuthenticated || isLoading) return null;

  const lastVisited = getLastVisitedCourse();
  if (!lastVisited) return null;

  const course = trainingIndex.courses.find((candidate: any) => candidate.id === lastVisited.courseId);
  if (!course) return null;
  const cert = trainingIndex.certifications.find((candidate: any) => candidate.id === (course as any).certId);
  const progressPct = Math.round(((lastVisited.chapterIndex + 1) / lastVisited.totalChapters) * 100);

  return (
    <div className="container" style={{ padding: "0 clamp(1.25rem, 4vw, 3rem)" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3, ease: [0.23, 1, 0.32, 1] }} className="-mt-4 mb-8">
        <Link href={`/training/${(course as any).certId}/${course.id}`} className="group block rounded-2xl border p-4 md:p-5 hover:shadow-lg transition-all duration-200" style={{ background: "linear-gradient(135deg, oklch(96% 0.01 255 / 0.5), oklch(97% 0.01 255 / 0.5))", borderColor: "oklch(82% 0.04 255 / 0.4)" }}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "oklch(90% 0.04 255 / 0.4)" }}><PlayCircle className="w-5 h-5 md:w-6 md:h-6" style={{ color: "var(--neo-primary)" }} /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1"><span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "var(--neo-primary-light)", color: "var(--neo-primary)" }}>{t({ fr: "Reprendre la lecture", en: "Resume reading", ar: "استئناف القراءة" })}</span>{cert && <span className="text-xs text-muted-foreground">{(cert as any).icon}</span>}</div>
              <h3 className="text-sm md:text-base font-semibold group-hover:opacity-80 transition-opacity truncate" style={{ color: "oklch(25% 0.02 250)" }}>{typeof (course as any).title === "object" ? ((course as any).title.fr || (course as any).title.en) : (course as any).title}</h3>
              <div className="flex items-center gap-3 mt-1.5"><div className="flex-1 max-w-[200px] h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(88% 0.02 255 / 0.6)" }}><div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: "var(--neo-primary)" }} /></div><span className="text-xs font-medium" style={{ color: "var(--neo-ink-secondary)" }}>{t({ fr: `Chapitre ${lastVisited.chapterIndex + 1}/${lastVisited.totalChapters}`, en: `Chapter ${lastVisited.chapterIndex + 1}/${lastVisited.totalChapters}`, ar: `الفصل ${lastVisited.chapterIndex + 1}/${lastVisited.totalChapters}` })}</span></div>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--neo-primary)" }} />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
