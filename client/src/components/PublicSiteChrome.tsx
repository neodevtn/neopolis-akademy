import { useState } from "react";
import { ChevronRight, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import DeferredHomeAuth from "@/components/DeferredHomeAuth";
import { type Language, useLanguage } from "@/contexts/LanguageContext";
import { trackEvent } from "@/lib/analytics";
import { publicTrainingCataloguePath, publicTrainingPath } from "@shared/publicTrainingLocale";
import { PUBLIC_CHROME_STYLES } from "@shared/publicChromeStyles";
import { navigateToHomePublicAnchor } from "@/lib/homePublicAnchors";

const LOGO_URL = "/api/assets/neopolis-akademy-official-logo_40a16b6c.svg";

type PublicPage = "home" | "training" | "news" | "apply" | "legal" | "referral";

type LocalizedText = { fr: string; en: string; ar: string };

const labels = {
  formula: { fr: "La Formule", en: "The Formula", ar: "الصيغة" },
  why: { fr: "Pourquoi maintenant", en: "Why now", ar: "لماذا الآن" },
  partners: { fr: "Partenaires", en: "Partners", ar: "الشركاء" },
  training: { fr: "Formations IA", en: "AI Training", ar: "تدريب الذكاء الاصطناعي" },
  news: { fr: "AI News", en: "AI News", ar: "أخبار الذكاء الاصطناعي" },
  faq: { fr: "FAQ", en: "FAQ", ar: "الأسئلة الشائعة" },
  signIn: { fr: "Se connecter", en: "Sign in", ar: "تسجيل الدخول" },
  apply: { fr: "Postuler", en: "Apply", ar: "تقدّم" },
  program: { fr: "Programme", en: "Program", ar: "البرنامج" },
  explore: { fr: "Explorer", en: "Explore", ar: "استكشاف" },
  contact: { fr: "Contact", en: "Contact", ar: "التواصل" },
  legal: { fr: "Mentions légales", en: "Legal notice", ar: "الإشعار القانوني" },
  allRights: { fr: "Tous droits réservés.", en: "All rights reserved.", ar: "جميع الحقوق محفوظة." },
  footerLead: { fr: "Développer des compétences IA utiles dans votre métier.", en: "Build practical AI skills for your profession.", ar: "طوّر مهارات عملية في الذكاء الاصطناعي لمهنتك." },
  menu: { fr: "Menu principal", en: "Main menu", ar: "القائمة الرئيسية" },
  languages: { fr: "Langues", en: "Languages", ar: "اللغات" },
} satisfies Record<string, LocalizedText>;

function localizedPath(location: string, locale: Language) {
  const normalized = location.split("?")[0] || "/";
  if (/^\/(?:en|ar)?$/.test(normalized)) return locale === "fr" ? "/" : `/${locale}`;
  const catalogueMatch = normalized.match(/^\/(?:formations-ia|en\/ai-training|ar\/ai-training)\/catalogue(?:\/([^/]+))?(?:\/([^/]+))?$/);
  if (catalogueMatch) return publicTrainingCataloguePath(locale, catalogueMatch[1], catalogueMatch[2]);
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

function publicLinks(lang: Language, page: PublicPage) {
  const homeAnchor = (anchor: string) => page === "home" ? anchor : `/${anchor}`;
  return [
    { href: homeAnchor("#formule"), label: labels.formula, active: page === "home" && false },
    { href: homeAnchor("#pourquoi"), label: labels.why, active: false },
    { href: homeAnchor("#partenaires"), label: labels.partners, active: false },
    { href: publicTrainingPath(lang), label: labels.training, active: page === "training" },
    { href: "/ai-news", label: labels.news, active: page === "news" },
    { href: homeAnchor("#faq"), label: labels.faq, active: false },
  ];
}

function NavigationLinks({ page, onNavigate }: { page: PublicPage; onNavigate?: () => void }) {
  const { lang, t } = useLanguage();
  return (
    <>
      {publicLinks(lang, page).map((item) => {
        if (page === "home" && item.href.startsWith("#")) {
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => {
                event.preventDefault();
                onNavigate?.();
                if (onNavigate) {
                  window.setTimeout(() => navigateToHomePublicAnchor(item.href), 120);
                  window.setTimeout(() => navigateToHomePublicAnchor(item.href), 700);
                } else {
                  navigateToHomePublicAnchor(item.href);
                  window.setTimeout(() => navigateToHomePublicAnchor(item.href), 500);
                }
              }}
              className="public-chrome-nav-link"
            >
              {t(item.label)}
            </a>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={item.active ? "page" : undefined}
            className="public-chrome-nav-link"
          >
            {t(item.label)}
          </Link>
        );
      })}
    </>
  );
}

function MobilePublicMenu({ page }: { page: PublicPage }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="public-chrome-mobile">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="public-mobile-navigation"
        aria-label={t(labels.menu)}
        className="public-chrome-mobile-trigger"
      >
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>
      {open && (
        <div id="public-mobile-navigation" className="public-chrome-mobile-panel">
          <nav className="public-chrome-nav" aria-label={t(labels.menu)}>
            <NavigationLinks page={page} onNavigate={() => setOpen(false)} />
            <Link href="/login" onClick={() => setOpen(false)} className="public-chrome-signin">{t(labels.signIn)}</Link>
            <Link href="/apply" onClick={() => { trackEvent("cta_click", { content_type: "public_navigation", content_id: "apply_mobile_menu" }); setOpen(false); }} className="public-chrome-apply"><span>{t(labels.apply)}</span><ChevronRight size={14} /></Link>
            <LocaleLinks onNavigate={() => setOpen(false)} />
          </nav>
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
        <Link href="/" aria-label="Neopolis Akademy" className="public-chrome-brand"><img src={LOGO_URL} alt="Neopolis Akademy" width={180} height={63} decoding="async" fetchPriority="high" className="public-chrome-logo" /></Link>
        <nav className="public-chrome-nav" aria-label={t(labels.menu)}>
          <NavigationLinks page={active} />
          <DeferredHomeAuth slot="training" fallback={<Link href="/login" className="public-chrome-signin">{t(labels.signIn)}</Link>} />
        </nav>
        <div className="public-chrome-actions">
          <div className="public-chrome-locale-desktop"><LocaleLinks /></div>
          <div className="hidden lg:block"><DeferredHomeAuth slot="logout" /></div>
          <div className="hidden lg:block"><DeferredHomeAuth slot="header-primary" fallback={<Link href="/apply" onClick={() => trackEvent("cta_click", { content_type: "public_navigation", content_id: "apply_header" })} className="public-chrome-apply"><span>{t(labels.apply)}</span><ChevronRight size={14} /></Link>} /></div>
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
            <img src={LOGO_URL} alt="Neopolis Akademy" width={137} height={48} decoding="async" className="mb-3 h-11 w-auto object-contain brightness-0 invert" />
            <p className="max-w-xs text-sm leading-6 text-slate-300">{t(labels.footerLead)}</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white">{t(labels.program)}</h2>
            <ul className="mt-3 space-y-2 text-sm"><li><a href="/#formule" className="hover:text-white hover:underline">{t(labels.formula)}</a></li><li><a href="/#pourquoi" className="hover:text-white hover:underline">{t(labels.why)}</a></li><li><a href="/#partenaires" className="hover:text-white hover:underline">{t(labels.partners)}</a></li><li><a href="/#faq" className="hover:text-white hover:underline">{t(labels.faq)}</a></li></ul>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white">{t(labels.explore)}</h2>
            <ul className="mt-3 space-y-2 text-sm"><li><Link href={publicTrainingPath(lang)} className="hover:text-white hover:underline">{t(labels.training)}</Link></li><li><Link href="/ai-news" className="hover:text-white hover:underline">{t(labels.news)}</Link></li><li><Link href={publicTrainingCataloguePath(lang)} className="hover:text-white hover:underline">{t({ fr: "Catalogue", en: "Catalogue", ar: "الكتالوج" })}</Link></li><li><Link href="/apply" className="hover:text-white hover:underline">{t(labels.apply)}</Link></li></ul>
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
