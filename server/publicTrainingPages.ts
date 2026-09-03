import type { Express, Request, Response } from "express";
import {
  getPublicTrainingCatalogMetrics,
  getPublicTrainingTheme,
  getPublicTrainingThemeAlias,
  getPublicTrainingThemes,
  type PublicTrainingMetrics,
  type PublicTrainingTheme,
} from "@shared/publicTrainingThemes";
import {
  publicTrainingCopy,
  publicTrainingHrefAlternates,
  publicTrainingLocaleMeta,
  publicTrainingLocales,
  publicTrainingPath,
  type PublicTrainingLocale,
} from "@shared/publicTrainingLocale";
import { PUBLIC_CHROME_STYLES } from "@shared/publicChromeStyles";

const SITE_NAME = "Neopolis Akademy";
const ORIGIN = "https://akademy.neodev.click";
const SHARE_IMAGE_URL = `${ORIGIN}/api/assets/neopolis-akademy-social-share_7fc7d2a3.png`;
const LOGO_URL = "/api/assets/neopolis-akademy-official-logo_40a16b6c.svg";
const OECD_URL = "https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en.html";

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const toJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
const number = (value: number, locale: PublicTrainingLocale) => new Intl.NumberFormat(publicTrainingLocaleMeta[locale].numberLocale).format(value);
const absolute = (path: string) => `${ORIGIN}${path}`;

function publicChromeCopy(locale: PublicTrainingLocale) {
  return {
    formula: locale === "ar" ? "الصيغة" : locale === "en" ? "The Formula" : "La Formule",
    why: locale === "ar" ? "لماذا الآن" : locale === "en" ? "Why now" : "Pourquoi maintenant",
    partners: locale === "ar" ? "الشركاء" : locale === "en" ? "Partners" : "Partenaires",
    faq: locale === "ar" ? "الأسئلة الشائعة" : "FAQ",
    apply: locale === "ar" ? "تقدّم" : locale === "en" ? "Apply" : "Postuler",
    program: locale === "ar" ? "البرنامج" : locale === "en" ? "Program" : "Programme",
    explore: locale === "ar" ? "استكشاف" : locale === "en" ? "Explore" : "Explorer",
    contact: locale === "ar" ? "التواصل" : "Contact",
    legal: locale === "ar" ? "الإشعار القانوني" : locale === "en" ? "Legal notice" : "Mentions légales",
    lead: locale === "ar" ? "طوّر مهارات عملية في الذكاء الاصطناعي لمهنتك." : locale === "en" ? "Build practical AI skills for your profession." : "Développer des compétences IA utiles dans votre métier.",
    rights: locale === "ar" ? "جميع الحقوق محفوظة." : locale === "en" ? "All rights reserved." : "Tous droits réservés.",
  };
}

function head({ locale, title, description, canonicalPath, keywords, noindex = false, schema, themeSlug }: {
  locale: PublicTrainingLocale;
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string;
  noindex?: boolean;
  schema: Record<string, unknown>;
  themeSlug?: string;
}) {
  const canonical = absolute(canonicalPath);
  const meta = publicTrainingLocaleMeta[locale];
  const alternates = publicTrainingHrefAlternates(themeSlug);
  return `
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ""}
    <link rel="canonical" href="${canonical}" />
    ${alternates.map(({ locale: alternateLocale, href }) => `<link rel="alternate" hreflang="${publicTrainingLocaleMeta[alternateLocale].languageTag}" href="${absolute(href)}" />`).join("\n    ")}
    <link rel="alternate" hreflang="x-default" href="${absolute(publicTrainingPath("fr", themeSlug))}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="${meta.ogLocale}" />
    ${publicTrainingLocales.filter((item) => item !== locale).map((item) => `<meta property="og:locale:alternate" content="${publicTrainingLocaleMeta[item].ogLocale}" />`).join("\n    ")}
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${SHARE_IMAGE_URL}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Logo Neopolis Akademy" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${SHARE_IMAGE_URL}" />
    ${noindex ? '<meta name="robots" content="noindex, follow" />' : ""}
    <script type="application/ld+json">${toJson(schema)}</script>`;
}

function styles() {
  return `<style>
    ${PUBLIC_CHROME_STYLES}
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #172033; background: #f7f8fb; line-height: 1.55; }
    html[dir="rtl"] { font-family: Tahoma, "Noto Sans Arabic", Arial, sans-serif; }
    a { color: inherit; }
    .shell { width: min(1440px, calc(100% - 32px)); margin: 0 auto; }
    .site-header { background: #fff; border-bottom: 1px solid #e7eaf0; }
    .topbar { min-height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
    .brand { display: inline-flex; align-items: center; color: #19345f; text-decoration: none; }
    .brand-logo { display: block; width: 180px; height: 44px; object-fit: contain; }
    .nav, .language-nav { display: flex; flex-wrap: wrap; gap: 2px; align-items: center; font-size: .92rem; }
    .nav { margin-inline: auto; }
    .nav a, .language-nav a { text-decoration: none; color: #475569; font-weight: 650; padding: 8px 10px; border-radius: 8px; }
    .nav a:hover, .language-nav a:hover, .language-nav a[aria-current="page"] { color: #173b73; background: #f1f5f9; }
    .language-nav { gap: 0; font-size: .76rem; direction: ltr; }.header-actions { display: flex; align-items: center; gap: 9px; }.apply-link { display: inline-flex; align-items: center; padding: 10px 15px; border-radius: 9px; background: #0f1f3b; color: #fff; font-size: .85rem; font-weight: 760; text-decoration: none; }.mobile-nav { display: none; position: relative; }.mobile-nav summary { cursor: pointer; list-style: none; padding: 9px 10px; border-radius: 8px; color: #334763; background: #f1f5f9; font-size: .78rem; font-weight: 780; }.mobile-nav summary::-webkit-details-marker { display: none; }.mobile-nav-panel { position: absolute; inset-inline-end: 0; top: calc(100% + 8px); width: min(320px, calc(100vw - 24px)); padding: 12px; background: #fff; border: 1px solid #e4e9f1; border-radius: 12px; box-shadow: 0 16px 36px rgba(18,47,87,.15); }.mobile-nav-panel a { display: block; padding: 9px 10px; border-radius: 8px; color: #334763; text-decoration: none; font-size: .9rem; font-weight: 650; }.mobile-nav-panel a:hover { background: #f1f5f9; }.mobile-language-nav { display: flex; gap: 2px; padding: 8px 10px 0; margin-top: 6px; border-top: 1px solid #e4e9f1; direction: ltr; }.mobile-language-nav a { display: inline-block; padding: 7px 8px; font-size: .75rem; }
    .hero { background: linear-gradient(125deg, #0c1f3e, #173f7b 60%, #237c93); color: #fff; padding: 64px 0 50px; }
    .eyebrow { margin: 0 0 12px; color: #b9d9ff; font-weight: 750; font-size: .78rem; letter-spacing: .1em; text-transform: uppercase; }
    h1 { margin: 0; max-width: 860px; font-size: clamp(2.05rem, 5vw, 3.9rem); letter-spacing: -.045em; line-height: 1.05; }
    .lead { max-width: 800px; margin: 20px 0 0; font-size: clamp(1.02rem, 2vw, 1.25rem); color: #e6f0ff; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
    .button { display: inline-flex; justify-content: center; align-items: center; min-height: 42px; border-radius: 9px; text-decoration: none; font-weight: 760; padding: 10px 16px; }
    .button-primary { color: #102747; background: #fff; }.button-secondary { color: #fff; border: 1px solid rgba(255,255,255,.55); }
    main { padding: 42px 0 60px; } h2 { margin: 0; color: #13294b; font-size: clamp(1.45rem, 3vw, 2.15rem); letter-spacing: -.03em; line-height: 1.18; } h3 { margin: 0; font-size: 1.08rem; color: #162f57; letter-spacing: -.02em; }
    .section-intro { margin: 12px 0 24px; max-width: 820px; color: #526178; }.metrics { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 28px 0 44px; }.metric { padding: 17px; min-width: 0; background: #fff; border: 1px solid #e4e9f1; border-radius: 12px; }.metric-number { display: block; color: #193c73; font-size: 1.8rem; font-weight: 820; letter-spacing: -.04em; }.metric-label { display: block; margin-top: 2px; color: #62738e; font-size: .82rem; font-weight: 650; }
    .themes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }.theme-card, .training-card, .use-case { display: flex; flex-direction: column; min-width: 0; padding: 20px; background: #fff; border: 1px solid #e4e9f1; border-radius: 14px; text-decoration: none; }.theme-card:hover, .training-card:hover { border-color: #9db6dc; box-shadow: 0 12px 28px rgba(18, 47, 87, .09); }.accent { display: block; width: 42px; height: 4px; margin-bottom: 17px; border-radius: 999px; }.accent-blue { background: #3171c4; }.accent-violet { background: #7350ba; }.accent-emerald { background: #20856e; }.accent-amber { background: #bd7412; }.accent-rose { background: #bd4b6a; }.card-copy { margin: 10px 0 18px; color: #596a82; font-size: .94rem; }.card-meta { margin-top: auto; color: #1c4d8e; font-size: .86rem; font-weight: 760; }.use-case-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 20px; }.use-case h3 { font-size: 1.02rem; }.use-case p { margin: 10px 0 0; color: #526178; font-size: .9rem; }.domain-line { margin: 12px 0 0; color: #657791; font-size: .78rem; }
    .split { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(280px, .85fr); gap: 28px; align-items: start; margin-top: 16px; }.panel { background: #fff; border: 1px solid #e4e9f1; border-radius: 14px; padding: 22px; }.bar-list { display: grid; gap: 14px; }.bar-title { display: flex; justify-content: space-between; gap: 10px; color: #334763; font-size: .9rem; font-weight: 700; }.bar-track { width: 100%; height: 9px; overflow: hidden; background: #e9eff7; border-radius: 999px; margin-top: 7px; }.bar-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #1d4f91, #388f9f); }.training-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 20px; }.training-top { display: flex; gap: 10px; align-items: center; }.training-icon { width: 34px; height: 34px; flex: 0 0 34px; display: grid; place-items: center; border-radius: 9px; background: #edf4ff; }.badge { display: inline-flex; width: fit-content; margin: 14px 0 0; padding: 4px 8px; color: #26578d; background: #eaf3ff; border-radius: 999px; font-size: .74rem; font-weight: 760; }.stats-line { margin-top: 13px; color: #51627b; font-size: .84rem; }.chip-list { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 0; }.chip { color: #3e5473; background: #f1f5fa; padding: 6px 9px; border-radius: 999px; font-size: .81rem; }.context { margin-top: 42px; padding: 24px; color: #2a4266; background: #eaf4f5; border-inline-start: 4px solid #247b87; border-radius: 8px; }.context p { margin: 8px 0 0; }.context a { color: #135d70; font-weight: 700; }.site-footer { margin-top: 54px; padding: 40px 0 20px; color: #d9e1ee; background: #10213e; font-size: .88rem; }.footer-grid { display: grid; grid-template-columns: 1.25fr repeat(3, 1fr); gap: 30px; }.footer-logo { width: 137px; height: 48px; object-fit: contain; filter: brightness(0) invert(1); }.footer-title { margin: 0; color: #fff; font-size: .75rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }.footer-list { list-style: none; padding: 0; margin: 14px 0 0; display: grid; gap: 8px; }.footer-list a { text-decoration: none; color: #d9e1ee; }.footer-list a:hover { color: #fff; text-decoration: underline; }.footer-bottom { margin-top: 30px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.15); color: #9babbe; text-align: center; font-size: .78rem; }
    html[dir="rtl"] .bar-fill { background: linear-gradient(270deg, #1d4f91, #388f9f); } html[dir="rtl"] .language-nav { direction: ltr; }
    @media (max-width: 900px) { .metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }.themes { grid-template-columns: repeat(2, minmax(0, 1fr)); }.split { grid-template-columns: 1fr; } }
    @media (max-width: 900px) { .nav a:nth-child(-n+3) { display: none; }.footer-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .shell { width: min(100% - 24px, 1440px); }.topbar { min-height: 64px; gap: 8px; }.brand-logo { width: 154px; height: 38px; }.nav, .language-nav { display: none; }.mobile-nav { display: block; }.apply-link { padding: 9px 11px; font-size: .78rem; }.hero { padding: 48px 0 40px; }.metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }.themes, .training-grid, .use-case-grid, .footer-grid { grid-template-columns: 1fr; }.metric { padding: 14px; } }
  </style>`;
}

function layout(body: string, options: Parameters<typeof head>[0]) {
  const copy = publicTrainingCopy[options.locale];
  const chrome = publicChromeCopy(options.locale);
  const languageLinks = publicTrainingLocales.map((locale) => `<a class="public-chrome-language-link" href="${publicTrainingPath(locale, options.themeSlug)}" hreflang="${publicTrainingLocaleMeta[locale].languageTag}"${locale === options.locale ? ' aria-current="page"' : ""}>${publicTrainingCopy[locale].languageLabel}</a>`).join("");
  return `<!doctype html><html lang="${publicTrainingLocaleMeta[options.locale].languageTag}" dir="${publicTrainingLocaleMeta[options.locale].direction}"><head>${head(options)}${styles()}</head><body>
    <header class="public-chrome-header"><div class="public-chrome-shell"><a class="public-chrome-brand" href="/" aria-label="Neopolis Akademy"><img class="public-chrome-logo" src="${LOGO_URL}" alt="Neopolis Akademy" width="180" height="63" /></a><nav class="public-chrome-nav" aria-label="${escapeHtml(chrome.program)}"><a class="public-chrome-nav-link" href="/#formule">${escapeHtml(chrome.formula)}</a><a class="public-chrome-nav-link" href="/#pourquoi">${escapeHtml(chrome.why)}</a><a class="public-chrome-nav-link" href="/#partenaires">${escapeHtml(chrome.partners)}</a><a class="public-chrome-nav-link" href="${publicTrainingPath(options.locale)}" aria-current="page">${escapeHtml(copy.navTraining)}</a><a class="public-chrome-nav-link" href="/ai-news">${escapeHtml(copy.navNews)}</a><a class="public-chrome-nav-link" href="/#faq">${escapeHtml(chrome.faq)}</a><a class="public-chrome-signin" href="/login">${escapeHtml(copy.navSignIn)}</a></nav><div class="public-chrome-actions"><nav class="public-chrome-language public-chrome-locale-desktop" aria-label="Language">${languageLinks}</nav><details class="public-chrome-mobile"><summary aria-label="${escapeHtml(chrome.program)}"><span aria-hidden="true">☰</span></summary><nav class="public-chrome-mobile-panel" aria-label="${escapeHtml(chrome.program)}"><div class="public-chrome-nav"><a class="public-chrome-nav-link" href="/#formule">${escapeHtml(chrome.formula)}</a><a class="public-chrome-nav-link" href="/#pourquoi">${escapeHtml(chrome.why)}</a><a class="public-chrome-nav-link" href="/#partenaires">${escapeHtml(chrome.partners)}</a><a class="public-chrome-nav-link" href="${publicTrainingPath(options.locale)}" aria-current="page">${escapeHtml(copy.navTraining)}</a><a class="public-chrome-nav-link" href="/ai-news">${escapeHtml(copy.navNews)}</a><a class="public-chrome-nav-link" href="/#faq">${escapeHtml(chrome.faq)}</a><a class="public-chrome-signin" href="/login">${escapeHtml(copy.navSignIn)}</a><a class="public-chrome-apply" href="/apply"><span>${escapeHtml(chrome.apply)}</span><span class="public-chrome-apply-chevron">›</span></a><nav class="public-chrome-language" aria-label="Language">${languageLinks}</nav></div></nav></details><a class="public-chrome-apply" href="/apply"><span>${escapeHtml(chrome.apply)}</span><span class="public-chrome-apply-chevron">›</span></a></div></div></header>
    ${body}<footer class="site-footer"><div class="shell"><div class="footer-grid"><div><img class="footer-logo" src="${LOGO_URL}" alt="Neopolis Akademy" width="137" height="48" /><p>${escapeHtml(chrome.lead)}</p></div><div><h2 class="footer-title">${escapeHtml(chrome.program)}</h2><ul class="footer-list"><li><a href="/#formule">${escapeHtml(chrome.formula)}</a></li><li><a href="/#pourquoi">${escapeHtml(chrome.why)}</a></li><li><a href="/#partenaires">${escapeHtml(chrome.partners)}</a></li><li><a href="/#faq">${escapeHtml(chrome.faq)}</a></li></ul></div><div><h2 class="footer-title">${escapeHtml(chrome.explore)}</h2><ul class="footer-list"><li><a href="${publicTrainingPath(options.locale)}">${escapeHtml(copy.navTraining)}</a></li><li><a href="/ai-news">${escapeHtml(copy.navNews)}</a></li><li><a href="/training?tab=catalog">${escapeHtml(copy.navCatalogue)}</a></li><li><a href="/apply">${escapeHtml(chrome.apply)}</a></li></ul></div><div><h2 class="footer-title">${escapeHtml(chrome.contact)}</h2><ul class="footer-list"><li><a href="mailto:info@neopolis-dev.com">info@neopolis-dev.com</a></li><li><a href="https://www.neopolis-dev.com" rel="noopener noreferrer">Neopolis Development ↗</a></li><li><a href="/mentions-legales">${escapeHtml(chrome.legal)}</a></li></ul></div></div><div class="footer-bottom">© 2026 Neopolis Development. ${escapeHtml(chrome.rights)}</div></div></footer></body></html>`;
}

function metricCards(metrics: PublicTrainingMetrics, locale: PublicTrainingLocale) {
  const copy = publicTrainingCopy[locale];
  const metricsToDisplay = [[metrics.certificationCount, copy.paths], [metrics.courseCount, copy.courses], [metrics.activityCount, copy.activities], [metrics.exerciseCount, copy.exercises], [metrics.videoCount, copy.videos]];
  return `<div class="metrics" aria-label="${escapeHtml(SITE_NAME)}">${metricsToDisplay.map(([value, label]) => `<div class="metric"><span class="metric-number">${number(value as number, locale)}</span><span class="metric-label">${escapeHtml(label as string)}</span></div>`).join("")}</div>`;
}

function themeCard(theme: PublicTrainingTheme, locale: PublicTrainingLocale) {
  const copy = publicTrainingCopy[locale];
  return `<a class="theme-card" href="${publicTrainingPath(locale, theme.slug)}"><span class="accent accent-${theme.accent}"></span><h3>${escapeHtml(theme.shortTitle)}</h3><p class="card-copy">${escapeHtml(theme.description)}</p><span class="card-meta">${number(theme.metrics.certificationCount, locale)} ${escapeHtml(copy.paths)} · ${number(theme.metrics.courseCount, locale)} ${escapeHtml(copy.courses)}</span></a>`;
}

function hero(title: string, lead: string, locale: PublicTrainingLocale) {
  const copy = publicTrainingCopy[locale];
  return `<section class="hero"><div class="shell"><p class="eyebrow">Neopolis Akademy · ${escapeHtml(copy.freeTraining)}</p><h1>${escapeHtml(title)}</h1><p class="lead">${escapeHtml(lead)}</p><div class="actions"><a class="button button-primary" href="/training?tab=catalog">${escapeHtml(copy.viewCatalogue)}</a><a class="button button-secondary" href="/apply">${escapeHtml(copy.discoverAccess)}</a></div></div></section>`;
}

function publicIndexSchema(locale: PublicTrainingLocale) {
  const copy = publicTrainingCopy[locale];
  const themes = getPublicTrainingThemes(locale);
  return { "@context": "https://schema.org", "@type": "CollectionPage", name: `${copy.indexTitle} | ${SITE_NAME}`, description: copy.menaDescription, url: absolute(publicTrainingPath(locale)), inLanguage: publicTrainingLocaleMeta[locale].languageTag, hasPart: { "@type": "ItemList", itemListElement: themes.map((theme, index) => ({ "@type": "ListItem", position: index + 1, name: theme.shortTitle, url: absolute(publicTrainingPath(locale, theme.slug)) })) } };
}

function themeSchema(theme: PublicTrainingTheme, locale: PublicTrainingLocale) {
  return { "@context": "https://schema.org", "@type": "CollectionPage", name: `${theme.title} | ${SITE_NAME}`, description: theme.description, url: absolute(publicTrainingPath(locale, theme.slug)), inLanguage: publicTrainingLocaleMeta[locale].languageTag, mainEntity: { "@type": "ItemList", numberOfItems: theme.certifications.length, itemListElement: theme.certifications.map((certification, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "Course", name: certification.title, description: certification.description, provider: { "@type": "Organization", name: SITE_NAME, url: ORIGIN }, url: `${ORIGIN}/training/${encodeURIComponent(certification.id)}` } })) } };
}

export function renderPublicTrainingIndex(locale: PublicTrainingLocale = "fr") {
  const copy = publicTrainingCopy[locale];
  const themes = getPublicTrainingThemes(locale);
  const metrics = getPublicTrainingCatalogMetrics();
  const body = `${hero(copy.indexTitle, copy.indexLead, locale)}<main class="shell"><section aria-labelledby="offer-title"><h2 id="offer-title">${escapeHtml(copy.offerTitle)}</h2><p class="section-intro">${escapeHtml(copy.offerText)}</p>${metricCards(metrics, locale)}</section><section aria-labelledby="themes-title"><h2 id="themes-title">${escapeHtml(copy.themesTitle)}</h2><p class="section-intro">${escapeHtml(copy.themesText)}</p><div class="themes">${themes.map((theme) => themeCard(theme, locale)).join("")}</div></section><section class="context" aria-labelledby="context-title"><h2 id="context-title">${escapeHtml(copy.contextTitle)}</h2><p>${escapeHtml(copy.contextText)} <a href="${OECD_URL}" rel="noopener noreferrer">${escapeHtml(copy.contextLink)}</a>.</p></section></main>`;
  return layout(body, { locale, title: `${copy.indexTitle} | ${SITE_NAME}`, description: copy.menaDescription, keywords: copy.indexKeywords, canonicalPath: publicTrainingPath(locale), schema: publicIndexSchema(locale) });
}

export function renderPublicTrainingTheme(theme: PublicTrainingTheme, locale: PublicTrainingLocale = "fr") {
  const copy = publicTrainingCopy[locale];
  const maxMetric = Math.max(...theme.certifications.map((certification) => certification.metrics.activityCount), 1);
  const body = `${hero(theme.title, theme.description, locale)}<main class="shell"><section aria-labelledby="theme-overview"><h2 id="theme-overview">${escapeHtml(copy.themeOverview)}</h2><p class="section-intro">${escapeHtml(theme.introduction)}</p>${metricCards(theme.metrics, locale)}</section><div class="split"><section class="panel" aria-labelledby="volume-title"><h2 id="volume-title">${escapeHtml(copy.volumeTitle)}</h2><p class="section-intro">${escapeHtml(copy.volumeText)}</p><div class="bar-list">${theme.certifications.map((certification) => `<div><div class="bar-title"><span>${escapeHtml(certification.title)}</span><span>${number(certification.metrics.activityCount, locale)}</span></div><div class="bar-track" role="img" aria-label="${escapeHtml(certification.title)}: ${number(certification.metrics.activityCount, locale)} ${escapeHtml(copy.activities)}"><div class="bar-fill" style="width:${Math.max(4, Math.round((certification.metrics.activityCount / maxMetric) * 100))}%"></div></div></div>`).join("")}</div></section><aside class="panel" aria-labelledby="roles-title"><h2 id="roles-title">${escapeHtml(copy.rolesTitle)}</h2><p class="section-intro">${escapeHtml(copy.rolesText)}</p><h3>${escapeHtml(copy.targetRoles)}</h3><div class="chip-list">${(theme.roles.length ? theme.roles : [copy.transversal]).slice(0, 14).map((role) => `<span class="chip">${escapeHtml(role)}</span>`).join("")}</div><h3 style="margin-top:22px">${escapeHtml(copy.skills)}</h3><div class="chip-list">${(theme.skills.length ? theme.skills : [copy.appliedSkills]).slice(0, 14).map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("")}</div></aside></div>${theme.useCases.length ? `<section aria-labelledby="use-cases-title" style="margin-top:42px"><h2 id="use-cases-title">${escapeHtml(copy.useCasesTitle)}</h2><p class="section-intro">${escapeHtml(copy.useCasesText)}</p><div class="use-case-grid">${theme.useCases.map((useCase) => `<a class="use-case" href="/training/${encodeURIComponent(useCase.certificationId)}"><h3>${escapeHtml(useCase.title)}</h3><p>${escapeHtml(useCase.summary)}</p><div class="chip-list">${useCase.skills.map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("")}</div></a>`).join("")}</div></section>` : ""}<section aria-labelledby="formations-title" style="margin-top:42px"><h2 id="formations-title">${escapeHtml(copy.availableTraining)}</h2><p class="section-intro">${escapeHtml(copy.availableTrainingText)}</p><div class="training-grid">${theme.certifications.map((certification) => `<a class="training-card" href="/training/${encodeURIComponent(certification.id)}"><div class="training-top"><span class="training-icon" aria-hidden="true">${escapeHtml(certification.icon)}</span><h3>${escapeHtml(certification.title)}</h3></div><p class="card-copy">${escapeHtml(certification.description)}</p><span class="badge">${escapeHtml(certification.trainingFormat)} · ${escapeHtml(certification.level)}</span><p class="stats-line">${number(certification.metrics.courseCount, locale)} ${escapeHtml(copy.courses)} · ${number(certification.metrics.activityCount, locale)} ${escapeHtml(copy.activities)} · ${number(certification.metrics.exerciseCount, locale)} ${escapeHtml(copy.exercises)} · ${number(certification.metrics.videoCount, locale)} ${escapeHtml(copy.videos)}</p>${certification.relatedDomains.length ? `<p class="domain-line">${escapeHtml(copy.relatedDomains)}: ${escapeHtml(certification.relatedDomains.join(" · "))}</p>` : ""}</a>`).join("")}</div></section><section class="context"><h2>${escapeHtml(copy.otherJobs)}</h2><p>${escapeHtml(copy.otherJobsText)} <a href="${publicTrainingPath(locale)}">${escapeHtml(copy.allThemes)}</a>.</p></section></main>`;
  return layout(body, { locale, title: theme.seo.title, description: theme.seo.description, keywords: theme.seo.keywords, canonicalPath: publicTrainingPath(locale, theme.slug), schema: themeSchema(theme, locale), themeSlug: theme.slug });
}

export function renderPublicTrainingNotFound(locale: PublicTrainingLocale = "fr") {
  const copy = publicTrainingCopy[locale];
  return layout(`<main class="shell" style="padding:72px 0"><h1>${escapeHtml(copy.notFoundTitle)}</h1><p class="section-intro">${escapeHtml(copy.notFoundText)}</p><a class="button" style="background:#173f7b;color:#fff" href="${publicTrainingPath(locale)}">${escapeHtml(copy.notFoundLink)}</a></main>`, { locale, title: `${copy.notFoundTitle} | ${SITE_NAME}`, description: copy.notFoundText, canonicalPath: publicTrainingPath(locale), noindex: true, schema: { "@context": "https://schema.org", "@type": "WebPage", name: copy.notFoundTitle } });
}

export function renderPublicTrainingSitemap() {
  const routes = publicTrainingLocales.flatMap((locale) => [undefined, ...getPublicTrainingThemes(locale).map((theme) => theme.slug)].map((themeSlug) => ({ locale, themeSlug, path: publicTrainingPath(locale, themeSlug) })));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${routes.map((route) => `<url><loc>${absolute(route.path)}</loc>${publicTrainingHrefAlternates(route.themeSlug).map((alternate) => `<xhtml:link rel="alternate" hreflang="${publicTrainingLocaleMeta[alternate.locale].languageTag}" href="${absolute(alternate.href)}" />`).join("")}<xhtml:link rel="alternate" hreflang="x-default" href="${absolute(publicTrainingPath("fr", route.themeSlug))}" /></url>`).join("")}</urlset>`;
}

export function registerPublicTrainingPages(app: Express) {
  const sendHtml = (res: Response, html: string, status = 200) => res.status(status).set({ "Cache-Control": "no-cache", "Content-Type": "text/html; charset=utf-8" }).send(html);
  const index = (locale: PublicTrainingLocale) => (_req: Request, res: Response) => sendHtml(res, renderPublicTrainingIndex(locale));
  const theme = (locale: PublicTrainingLocale) => (req: Request, res: Response) => {
    const resolved = getPublicTrainingTheme(req.params.themeSlug, locale);
    if (resolved) return sendHtml(res, renderPublicTrainingTheme(resolved, locale));
    const alias = getPublicTrainingThemeAlias(req.params.themeSlug);
    return alias ? res.redirect(301, publicTrainingPath(locale, alias)) : sendHtml(res, renderPublicTrainingNotFound(locale), 404);
  };
  app.get("/formations-ia", index("fr"));
  app.get("/en/ai-training", index("en"));
  app.get("/ar/ai-training", index("ar"));
  app.get("/formations-ia/:themeSlug", theme("fr"));
  app.get("/en/ai-training/:themeSlug", theme("en"));
  app.get("/ar/ai-training/:themeSlug", theme("ar"));
  app.get("/sitemap.xml", (_req: Request, res: Response) => res.status(200).set({ "Cache-Control": "no-cache", "Content-Type": "application/xml; charset=utf-8" }).send(renderPublicTrainingSitemap()));
  app.get("/robots.txt", (_req: Request, res: Response) => res.status(200).set({ "Cache-Control": "no-cache", "Content-Type": "text/plain; charset=utf-8" }).send(`User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`));
}
