import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, LayoutDashboard, LogOut, Menu, Search, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { type Language, useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { isAdministrativeRole } from "@shared/roles";
import { trackEvent } from "@/lib/analytics";
import { publicGoldenJobsPath, publicTrainingCataloguePath, publicTrainingPath } from "@shared/publicTrainingLocale";
import { PUBLIC_TRAINING_DOMAIN_NAVIGATION } from "@shared/publicNavigation";
import { PUBLIC_CHROME_STYLES } from "@shared/publicChromeStyles";
import { navigateToHomePublicAnchor } from "@/lib/homePublicAnchors";
import { HeaderBrandLogo, OFFICIAL_NEOPOLIS_AKADEMY_LOGO } from "@/components/BrandLogo";

type PublicPage = "home" | "training" | "goldenJobs" | "news" | "apply" | "legal" | "referral";
type LocalizedText = { fr: string; en: string; ar: string };

type HeaderLabels = {
  formula: LocalizedText;
  why: LocalizedText;
  partners: LocalizedText;
  training: LocalizedText;
  goldenJobs: LocalizedText;
  news: LocalizedText;
  faq: LocalizedText;
  signIn: LocalizedText;
  signingIn: LocalizedText;
  signOut: LocalizedText;
  mySpace: LocalizedText;
  admin: LocalizedText;
  apply: LocalizedText;
  program: LocalizedText;
  explore: LocalizedText;
  contact: LocalizedText;
  legal: LocalizedText;
  allRights: LocalizedText;
  footerLead: LocalizedText;
  menu: LocalizedText;
  languages: LocalizedText;
  searchTraining: LocalizedText;
  searchPlaceholder: LocalizedText;
  trainingDomains: LocalizedText;
  allDomains: LocalizedText;
  catalogue: LocalizedText;
  openProgramme: LocalizedText;
  openTraining: LocalizedText;
};

const labels: HeaderLabels = {
  formula: { fr: "La Formule", en: "The Formula", ar: "الصيغة" },
  why: { fr: "Pourquoi maintenant", en: "Why now", ar: "لماذا الآن" },
  partners: { fr: "Partenaires", en: "Partners", ar: "الشركاء" },
  training: { fr: "Formations IA", en: "AI Training", ar: "تدريب الذكاء الاصطناعي" },
  goldenJobs: { fr: "Golden Jobs", en: "Golden Jobs", ar: "وظائف ذهبية" },
  news: { fr: "AI News", en: "AI News", ar: "أخبار الذكاء الاصطناعي" },
  faq: { fr: "FAQ", en: "FAQ", ar: "الأسئلة الشائعة" },
  signIn: { fr: "Se connecter", en: "Sign in", ar: "تسجيل الدخول" },
  signingIn: { fr: "Vérification…", en: "Checking…", ar: "جارٍ التحقق…" },
  signOut: { fr: "Déconnexion", en: "Logout", ar: "تسجيل الخروج" },
  mySpace: { fr: "Mon espace", en: "My learning", ar: "مساحتي" },
  admin: { fr: "Admin", en: "Admin", ar: "الإدارة" },
  apply: { fr: "Postuler", en: "Apply", ar: "تقدّم" },
  program: { fr: "Programme", en: "Program", ar: "البرنامج" },
  explore: { fr: "Explorer", en: "Explore", ar: "استكشاف" },
  contact: { fr: "Contact", en: "Contact", ar: "التواصل" },
  legal: { fr: "Mentions légales", en: "Legal notice", ar: "الإشعار القانوني" },
  allRights: { fr: "Tous droits réservés.", en: "All rights reserved.", ar: "جميع الحقوق محفوظة." },
  footerLead: { fr: "Développer des compétences IA utiles dans votre métier.", en: "Build practical AI skills for your profession.", ar: "طوّر مهارات عملية في الذكاء الاصطناعي لمهنتك." },
  menu: { fr: "Menu principal", en: "Main menu", ar: "القائمة الرئيسية" },
  languages: { fr: "Langues", en: "Languages", ar: "اللغات" },
  searchTraining: { fr: "Rechercher une formation", en: "Search training", ar: "ابحث عن تدريب" },
  searchPlaceholder: { fr: "Métier, compétence ou formation…", en: "Profession, skill or training…", ar: "مهنة أو مهارة أو تدريب…" },
  trainingDomains: { fr: "Formations par domaine", en: "Training by domain", ar: "التدريب حسب المجال" },
  allDomains: { fr: "Tous les domaines", en: "All domains", ar: "كل المجالات" },
  catalogue: { fr: "Catalogue des formations", en: "Training catalogue", ar: "كتالوج التدريبات" },
  openProgramme: { fr: "Ouvrir le sous-menu Programme", en: "Open Program submenu", ar: "فتح القائمة الفرعية للبرنامج" },
  openTraining: { fr: "Ouvrir le sous-menu Formations IA", en: "Open AI Training submenu", ar: "فتح القائمة الفرعية لتدريبات الذكاء الاصطناعي" },
};

function localizedPath(location: string, locale: Language) {
  const normalized = location.split("?")[0] || "/";
  if (/^\/(?:en|ar)?$/.test(normalized)) return locale === "fr" ? "/" : `/${locale}`;
  const catalogueMatch = normalized.match(/^\/(?:formations-ia|en\/ai-training|ar\/ai-training)\/catalogue(?:\/([^/]+))?(?:\/([^/]+))?$/);
  if (catalogueMatch) return publicTrainingCataloguePath(locale, catalogueMatch[1], catalogueMatch[2]);
  const goldenJobsMatch = normalized.match(/^\/(?:formations-ia|en\/ai-training|ar\/ai-training)\/golden-jobs(?:\/([^/]+))?$/);
  if (goldenJobsMatch) return publicGoldenJobsPath(locale, goldenJobsMatch[1]);
  const match = normalized.match(/^\/(?:formations-ia|en\/ai-training|ar\/ai-training)(?:\/([^/]+))?$/);
  return match ? publicTrainingPath(locale, match[1]) : location;
}

function LocaleLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { lang, setLang, t } = useLanguage();
  const [location] = useLocation();
  const languageNames: Record<Language, string> = { fr: "FR", en: "EN", ar: "AR" };

  return (
    <nav className="public-chrome-language" aria-label={t(labels.languages)} dir="ltr">
      {(["fr", "en", "ar"] as const).map((locale) => (
        <a
          key={locale}
          href={localizedPath(location, locale)}
          lang={locale}
          hrefLang={locale}
          aria-current={locale === lang ? "page" : undefined}
          onClick={() => { setLang(locale); onNavigate?.(); }}
          className="public-chrome-language-link"
        >
          {languageNames[locale]}
        </a>
      ))}
    </nav>
  );
}

function HomeAnchorLink({ anchor, label, page, onNavigate }: { anchor: string; label: LocalizedText; page: PublicPage; onNavigate?: () => void }) {
  const { t } = useLanguage();
  const href = page === "home" ? anchor : `/${anchor}`;
  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onNavigate?.();
        const go = () => navigateToHomePublicAnchor(anchor);
        if (onNavigate) {
          window.setTimeout(go, 120);
          window.setTimeout(go, 700);
        } else {
          go();
          window.setTimeout(go, 500);
        }
      }}
      className="public-chrome-menu-link"
    >
      {t(label)}
    </a>
  );
}

function ProgrammeMenu({ page, onNavigate }: { page: PublicPage; onNavigate?: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="public-chrome-menu-group">
      <Link href="/" onClick={onNavigate} className="public-chrome-nav-link">{t(labels.program)}</Link>
      <details className="public-chrome-menu-details">
        <summary aria-label={t(labels.openProgramme)} className="public-chrome-menu-trigger"><ChevronDown size={14} aria-hidden="true" /></summary>
        <div className="public-chrome-menu-panel">
          <HomeAnchorLink anchor="#formule" label={labels.formula} page={page} onNavigate={onNavigate} />
          <HomeAnchorLink anchor="#pourquoi" label={labels.why} page={page} onNavigate={onNavigate} />
          <HomeAnchorLink anchor="#partenaires" label={labels.partners} page={page} onNavigate={onNavigate} />
          <HomeAnchorLink anchor="#faq" label={labels.faq} page={page} onNavigate={onNavigate} />
        </div>
      </details>
    </div>
  );
}

function TrainingMenu({ page, onNavigate }: { page: PublicPage; onNavigate?: () => void }) {
  const { lang, t } = useLanguage();
  const isActive = page === "training";
  return (
    <div className="public-chrome-menu-group">
      <Link href={publicTrainingPath(lang)} onClick={onNavigate} aria-current={isActive ? "page" : undefined} className="public-chrome-nav-link">{t(labels.training)}</Link>
      <details className="public-chrome-menu-details">
        <summary aria-label={t(labels.openTraining)} className="public-chrome-menu-trigger"><ChevronDown size={14} aria-hidden="true" /></summary>
        <div className="public-chrome-menu-panel public-chrome-training-panel">
          <Link href={publicTrainingCataloguePath(lang)} onClick={onNavigate} className="public-chrome-menu-link public-chrome-menu-link-emphasis">{t(labels.catalogue)}</Link>
          <Link href={publicTrainingPath(lang)} onClick={onNavigate} className="public-chrome-menu-link">{t(labels.allDomains)}</Link>
          <p className="public-chrome-menu-heading">{t(labels.trainingDomains)}</p>
          <div className="public-chrome-domain-grid">
            {PUBLIC_TRAINING_DOMAIN_NAVIGATION.map((domain) => (
              <Link key={domain.slug} href={publicTrainingPath(lang, domain.slug)} onClick={onNavigate} className="public-chrome-menu-link">
                {domain.label[lang]}
              </Link>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}

function PrimaryNavigation({ page, mobile = false, onNavigate }: { page: PublicPage; mobile?: boolean; onNavigate?: () => void }) {
  const { lang, t } = useLanguage();
  return (
    <nav className={`public-chrome-nav${mobile ? " public-chrome-nav-mobile" : ""}`} aria-label={t(labels.menu)}>
      <ProgrammeMenu page={page} onNavigate={onNavigate} />
      <TrainingMenu page={page} onNavigate={onNavigate} />
      <Link href={publicGoldenJobsPath(lang)} onClick={onNavigate} aria-current={page === "goldenJobs" ? "page" : undefined} className="public-chrome-nav-link">{t(labels.goldenJobs)}</Link>
      <Link href="/ai-news" onClick={onNavigate} aria-current={page === "news" ? "page" : undefined} className="public-chrome-nav-link">{t(labels.news)}</Link>
      {!mobile && <PublicTrainingSearch />}
    </nav>
  );
}

function PublicTrainingSearch({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { lang, t } = useLanguage();
  const inputId = mobile ? "public-training-search-mobile" : "public-training-search";
  return (
    <form className={`public-chrome-search${mobile ? " public-chrome-search-mobile" : ""}`} role="search" action={publicTrainingCataloguePath(lang)} method="get" onSubmit={onNavigate}>
      <label className="sr-only" htmlFor={inputId}>{t(labels.searchTraining)}</label>
      <Search aria-hidden="true" size={15} className="public-chrome-search-icon" />
      <input id={inputId} name="q" type="search" minLength={2} placeholder={t(labels.searchPlaceholder)} autoComplete="off" />
      <button type="submit" aria-label={t(labels.searchTraining)}><Search size={15} /></button>
    </form>
  );
}

/** Resolves the auth query only in the browser; SSR stays cache-free and static. */
function ResolvedPublicSessionActions({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { t } = useLanguage();
  const { isAuthenticated, loading, logout, user } = useAuth();
  const canAccessAdmin = isAdministrativeRole(user?.role);

  if (loading) {
    return <span className={`public-chrome-session-pending${mobile ? " public-chrome-session-pending-mobile" : ""}`} role="status">{t(labels.signingIn)}</span>;
  }

  if (!isAuthenticated) {
    return <Link href="/login" onClick={onNavigate} className="public-chrome-signin">{t(labels.signIn)}</Link>;
  }

  return (
    <div className={`public-chrome-session-actions${mobile ? " public-chrome-session-actions-mobile" : ""}`}>
      {canAccessAdmin && <Link href="/admin" onClick={onNavigate} className="public-chrome-admin-link">{t(labels.admin)}</Link>}
      <Link href="/training" onClick={onNavigate} aria-label={t({ fr: "Mon espace apprenant", en: "My learning space", ar: "مساحة التعلّم الخاصة بي" })} className="public-chrome-apply">
        <LayoutDashboard size={14} /> <span>{t(labels.mySpace)}</span>
      </Link>
      <button type="button" onClick={() => { onNavigate?.(); void logout(); }} className="public-chrome-signout" title={t({ fr: `Déconnexion (${user?.name || ""})`, en: `Logout (${user?.name || ""})`, ar: `تسجيل الخروج (${user?.name || ""})` })}>
        <LogOut size={13} aria-hidden="true" /><span>{t(labels.signOut)}</span>
      </button>
    </div>
  );
}

/** A neutral learner-space fallback prevents an anonymous sign-in flash. */
function PublicSessionActions({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Link href="/training" onClick={onNavigate} className="public-chrome-apply"><LayoutDashboard size={14} /><span>{t(labels.mySpace)}</span></Link>;
  }

  return <ResolvedPublicSessionActions mobile={mobile} onNavigate={onNavigate} />;
}

function MobilePublicMenu({ page }: { page: PublicPage }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="public-chrome-mobile">
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="public-mobile-navigation" aria-label={t(labels.menu)} className="public-chrome-mobile-trigger">
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>
      {open && (
        <div id="public-mobile-navigation" className="public-chrome-mobile-panel">
          <PrimaryNavigation page={page} mobile onNavigate={close} />
          <PublicTrainingSearch mobile onNavigate={close} />
          <PublicSessionActions mobile onNavigate={close} />
          <Link href="/apply" onClick={() => { trackEvent("cta_click", { content_type: "public_navigation", content_id: "apply_mobile_menu" }); close(); }} className="public-chrome-apply"><span>{t(labels.apply)}</span><ChevronRight size={14} /></Link>
          <LocaleLinks onNavigate={close} />
        </div>
      )}
    </div>
  );
}

export function PublicSiteHeader({ active = "home" }: { active?: PublicPage }) {
  const { t } = useLanguage();
  return (
    <>
      <style>{PUBLIC_CHROME_STYLES}</style>
      <header className="public-chrome-header">
        <div className="public-chrome-shell">
          <Link href="/" aria-label="Neopolis Akademy" className="public-chrome-brand"><HeaderBrandLogo className="public-chrome-logo" /></Link>
          <PrimaryNavigation page={active} />
          <div className="public-chrome-actions">
            <div className="public-chrome-locale-desktop"><LocaleLinks /></div>
            <PublicSessionActions />
            <MobilePublicMenu page={active} />
          </div>
        </div>
      </header>
    </>
  );
}

export function PublicSiteFooter() {
  const { lang, t } = useLanguage();
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-[#10213e] text-slate-200">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img src={OFFICIAL_NEOPOLIS_AKADEMY_LOGO} alt="Neopolis Akademy" width={137} height={48} decoding="async" className="mb-3 h-11 w-auto object-contain brightness-0 invert" />
            <p className="max-w-xs text-sm leading-6 text-slate-300">{t(labels.footerLead)}</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white">{t(labels.program)}</h2>
            <ul className="mt-3 space-y-2 text-sm"><li><a href="/#formule" className="hover:text-white hover:underline">{t(labels.formula)}</a></li><li><a href="/#pourquoi" className="hover:text-white hover:underline">{t(labels.why)}</a></li><li><a href="/#partenaires" className="hover:text-white hover:underline">{t(labels.partners)}</a></li><li><a href="/#faq" className="hover:text-white hover:underline">{t(labels.faq)}</a></li></ul>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white">{t(labels.explore)}</h2>
            <ul className="mt-3 space-y-2 text-sm"><li><Link href={publicTrainingPath(lang)} className="hover:text-white hover:underline">{t(labels.training)}</Link></li><li><Link href={publicGoldenJobsPath(lang)} className="hover:text-white hover:underline">{t(labels.goldenJobs)}</Link></li><li><Link href="/ai-news" className="hover:text-white hover:underline">{t(labels.news)}</Link></li><li><Link href={publicTrainingCataloguePath(lang)} className="hover:text-white hover:underline">{t(labels.catalogue)}</Link></li><li><Link href="/apply" className="hover:text-white hover:underline">{t(labels.apply)}</Link></li></ul>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white">{t(labels.contact)}</h2>
            <ul className="mt-3 space-y-2 text-sm"><li><a href="mailto:info@neopolis-dev.com" className="hover:text-white hover:underline">info@neopolis-dev.com</a></li><li><a href="https://www.neopolis-dev.com" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">Neopolis Development ↗</a></li><li><a href="https://fr.linkedin.com/company/neopolis-development" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">LinkedIn ↗</a></li><li><a href="https://fr-fr.facebook.com/neopolisdev/" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">Facebook ↗</a></li><li><Link href="/mentions-legales" className="hover:text-white hover:underline">{t(labels.legal)}</Link></li></ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/15 pt-5 text-center text-xs text-slate-400">© {currentYear} Neopolis Development. {t(labels.allRights)}</div>
      </div>
    </footer>
  );
}
