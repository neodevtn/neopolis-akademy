import { useState } from "react";
import { ChevronRight, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import DeferredHomeAuth from "@/components/DeferredHomeAuth";
import { type Language, useLanguage } from "@/contexts/LanguageContext";
import { publicTrainingPath } from "@shared/publicTrainingLocale";

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
  const match = normalized.match(/^\/(?:formations-ia|en\/ai-training|ar\/ai-training)(?:\/([^/]+))?$/);
  return match ? publicTrainingPath(locale, match[1]) : location;
}

function LocaleLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { lang, setLang, t } = useLanguage();
  const [location] = useLocation();
  const languageNames: Record<Language, string> = { fr: "FR", en: "EN", ar: "AR" };

  return (
    <nav className="flex shrink-0 items-center gap-0.5" aria-label={t(labels.languages)} dir="ltr">
      {(["fr", "en", "ar"] as const).map((locale) => (
        <a
          key={locale}
          href={localizedPath(location, locale)}
          lang={locale}
          hrefLang={locale}
          aria-current={locale === lang ? "page" : undefined}
          onClick={() => { setLang(locale); onNavigate?.(); }}
          className={`rounded-md px-2.5 py-2 text-xs font-bold tracking-wide transition-colors ${locale === lang ? "bg-slate-100 text-[#173b73]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
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
      {publicLinks(lang, page).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          aria-current={item.active ? "page" : undefined}
          className={`whitespace-nowrap rounded-md px-3 py-2 text-[12.5px] font-medium transition-colors ${item.active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
        >
          {t(item.label)}
        </Link>
      ))}
    </>
  );
}

function MobilePublicMenu({ page }: { page: PublicPage }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="public-mobile-navigation"
        aria-label={t(labels.menu)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
      >
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>
      {open && (
        <div id="public-mobile-navigation" className="absolute end-0 top-11 z-50 w-[min(22rem,calc(100vw-1.5rem))] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <nav className="flex flex-col gap-1" aria-label={t(labels.menu)}>
            <NavigationLinks page={page} onNavigate={() => setOpen(false)} />
            <div className="my-2 h-px bg-slate-200" />
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-[#173b73] hover:bg-slate-50">{t(labels.signIn)}</Link>
            <Link href="/apply" onClick={() => setOpen(false)} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">{t(labels.apply)}</Link>
            <div className="mt-2 border-t border-slate-200 pt-2"><LocaleLinks onNavigate={() => setOpen(false)} /></div>
          </nav>
        </div>
      )}
    </div>
  );
}

export function PublicSiteHeader({ active = "home" }: { active?: PublicPage }) {
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 text-slate-950 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Neopolis Akademy" className="flex shrink-0 items-center"><img src={LOGO_URL} alt="Neopolis Akademy" width={180} height={63} decoding="async" className="h-9 w-auto object-contain" /></Link>
        <nav className="mx-auto hidden min-w-0 items-center gap-0.5 lg:flex" aria-label={t(labels.menu)}>
          <NavigationLinks page={active} />
          <DeferredHomeAuth slot="training" fallback={<Link href="/login" className="rounded-md px-3 py-2 text-[12.5px] font-semibold text-[#173b73] hover:bg-slate-50">{t(labels.signIn)}</Link>} />
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-0">
          <div className="hidden sm:block"><LocaleLinks /></div>
          <div className="hidden lg:block"><DeferredHomeAuth slot="logout" /></div>
          <div className="hidden lg:block"><DeferredHomeAuth slot="header-primary" fallback={<Link href="/apply" className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"><span>{t(labels.apply)}</span><ChevronRight size={14} /></Link>} /></div>
          <MobilePublicMenu page={active} />
        </div>
      </div>
    </header>
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
            <ul className="mt-3 space-y-2 text-sm"><li><Link href={publicTrainingPath(lang)} className="hover:text-white hover:underline">{t(labels.training)}</Link></li><li><Link href="/ai-news" className="hover:text-white hover:underline">{t(labels.news)}</Link></li><li><Link href="/training?tab=catalog" className="hover:text-white hover:underline">{t({ fr: "Catalogue", en: "Catalogue", ar: "الكتالوج" })}</Link></li><li><Link href="/apply" className="hover:text-white hover:underline">{t(labels.apply)}</Link></li></ul>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white">{t(labels.contact)}</h2>
            <ul className="mt-3 space-y-2 text-sm"><li><a href="mailto:info@neopolis-dev.com" className="hover:text-white hover:underline">info@neopolis-dev.com</a></li><li><a href="https://www.neopolis-dev.com" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">Neopolis Development ↗</a></li><li><Link href="/mentions-legales" className="hover:text-white hover:underline">{t(labels.legal)}</Link></li></ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/15 pt-5 text-center text-xs text-slate-400">© {currentYear} Neopolis Development. {t(labels.allRights)}</div>
      </div>
    </footer>
  );
}
