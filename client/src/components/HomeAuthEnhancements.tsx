import { lazy, Suspense } from "react";
import { Link } from "wouter";
import { BookOpen, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import { firstNameForHome } from "./homeAuthExperience";
import type { ReactNode } from "react";

const HomeResumeReadingWidget = lazy(() => import("@/components/HomeResumeReadingWidget"));
const TrainingProgressArea = lazy(() => import("@/components/TrainingProgressArea"));

type HomeAuthEnhancementProps = {
  slot: "training" | "logout" | "mobile-training" | "resume" | "header-primary" | "hero-actions";
  fallback?: ReactNode;
  onNavigate?: () => void;
};

function AuthenticatedHeroActions({ name }: { name?: string | null }) {
  const { t } = useLanguage();
  const { getLastVisitedCourse, isLoading } = useTrainingProgress();
  const lastVisited = getLastVisitedCourse();
  const firstName = firstNameForHome(name);
  const progressPercent = lastVisited?.totalChapters
    ? Math.round((Math.min(lastVisited.chapterIndex, lastVisited.totalChapters) / lastVisited.totalChapters) * 100)
    : 0;

  return (
    <div>
      <p className="mb-3 text-base font-medium text-slate-700">
        {firstName
          ? t({ fr: `Bonjour ${firstName}, prêt·e à poursuivre votre progression ?`, en: `Welcome back ${firstName}, ready to continue learning?`, ar: `مرحباً ${firstName}، هل أنت مستعد لمواصلة التعلّم؟` })
          : t({ fr: "Prêt·e à poursuivre votre progression ?", en: "Ready to continue learning?", ar: "هل أنت مستعد لمواصلة التعلّم؟" })}
      </p>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary">
        <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
        {isLoading
          ? t({ fr: "Synchronisation de votre progression", en: "Syncing your progress", ar: "جارٍ مزامنة تقدّمك" })
          : lastVisited
            ? t({ fr: `Parcours actif · ${progressPercent}% de l’étape en cours`, en: `Active learning · ${progressPercent}% of the current step`, ar: `تعلّم نشط · ${progressPercent}% من المرحلة الحالية` })
            : t({ fr: "Votre espace d’apprentissage est prêt", en: "Your learning space is ready", ar: "مساحة التعلّم الخاصة بك جاهزة" })}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/training" className="wise-btn-primary flex items-center gap-2 text-sm md:text-base px-5 md:px-7 py-3 md:py-3.5"><BookOpen size={18} />{lastVisited ? t({ fr: "Reprendre ma formation", en: "Resume my learning", ar: "متابعة تدريبي" }) : t({ fr: "Accéder à mes formations", en: "Go to my learning", ar: "الذهاب إلى تدريبي" })}</Link>
        <Link href="/training" className="wise-btn-secondary flex items-center gap-2 text-sm md:text-base px-5 md:px-7 py-3 md:py-3.5"><LayoutDashboard size={18} />{t({ fr: "Voir mon tableau de bord", en: "View my dashboard", ar: "عرض لوحة المتابعة" })}</Link>
      </div>
    </div>
  );
}

/**
 * Authenticated controls are intentionally loaded after first paint by
 * DeferredHomeAuth. This retains the complete signed-in experience while
 * keeping tRPC and training-progress code out of the public landing path.
 */
export default function HomeAuthEnhancements({ slot, fallback = null, onNavigate }: HomeAuthEnhancementProps) {
  const { isAuthenticated, logout, user } = useAuth();
  const { t } = useLanguage();

  if (slot === "resume") {
    if (!isAuthenticated) return null;
    return (
      <Suspense fallback={null}>
        <TrainingProgressArea>
          <HomeResumeReadingWidget />
        </TrainingProgressArea>
      </Suspense>
    );
  }

  if (slot === "logout") {
    if (!isAuthenticated) return null;
    return (
      <button
        onClick={() => logout()}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300"
        title={t({ fr: `Déconnexion (${user?.name || ""})`, en: `Logout (${user?.name || ""})`, ar: `تسجيل الخروج (${user?.name || ""})` })}
      >
        <LogOut size={13} />
        <span className="hidden md:inline">{t({ fr: "Déconnexion", en: "Logout", ar: "خروج" })}</span>
      </button>
    );
  }

  if (slot === "header-primary") {
    if (!isAuthenticated) return <>{fallback}</>;
    return (
      <Link href="/training" aria-label={t({ fr: "Mon espace apprenant", en: "My learning space", ar: "مساحة التعلّم الخاصة بي" })} className="public-chrome-apply">
        <LayoutDashboard size={14} /> <span className="hidden sm:inline">{t({ fr: "Mon espace", en: "My learning", ar: "مساحتي" })}</span>
      </Link>
    );
  }

  if (slot === "hero-actions") {
    if (!isAuthenticated) return <>{fallback}</>;
    return (
      <Suspense fallback={fallback}>
        <TrainingProgressArea><AuthenticatedHeroActions name={user?.name} /></TrainingProgressArea>
      </Suspense>
    );
  }

  const destination = isAuthenticated ? "/training" : "/login";
  const label = isAuthenticated
    ? t({ fr: "Formation", en: "Training", ar: "التدريب" })
    : t({ fr: "Se connecter", en: "Sign in", ar: "تسجيل الدخول" });

  if (slot === "mobile-training") {
    return (
      <a href={destination} onClick={onNavigate} className="text-sm font-semibold py-2.5 px-3 rounded-lg transition-colors" style={{ background: "rgba(30,58,110,0.08)", color: "#1e3a6e" }}>
        {isAuthenticated ? `${label} 🎓` : `${label} 🔒`}
      </a>
    );
  }

  return (
    <Link href={destination} className="public-chrome-signin">
      {label}
    </Link>
  );
}
