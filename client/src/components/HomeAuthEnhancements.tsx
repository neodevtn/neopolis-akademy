import { lazy, Suspense } from "react";
import { Link } from "wouter";
import { LogOut } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

const HomeResumeReadingWidget = lazy(() => import("@/components/HomeResumeReadingWidget"));
const TrainingProgressArea = lazy(() => import("@/components/TrainingProgressArea"));

type HomeAuthEnhancementProps = {
  slot: "training" | "logout" | "mobile-training" | "resume";
  onNavigate?: () => void;
};

/**
 * Authenticated controls are intentionally loaded after first paint by
 * DeferredHomeAuth. This retains the complete signed-in experience while
 * keeping tRPC and training-progress code out of the public landing path.
 */
export default function HomeAuthEnhancements({ slot, onNavigate }: HomeAuthEnhancementProps) {
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
    <Link href={destination} className="text-[11px] font-semibold px-3.5 py-1.5 ml-1 rounded-full transition-all duration-200 text-white hover:shadow-md" style={{ background: "#1e3a6e" }}>
      {label}
    </Link>
  );
}
