import type { Express, Request, Response } from "express";
import {
  getPublicTrainingCatalogMetrics,
  getPublicTrainingTheme,
  getPublicTrainingThemes,
  type PublicTrainingMetrics,
  type PublicTrainingTheme,
} from "@shared/publicTrainingThemes";

const SITE_NAME = "Neopolis Akademy";
const ORIGIN = "https://akademy.neodev.click";
const SHARE_IMAGE_URL = `${ORIGIN}/api/assets/neopolis-akademy-social-share_7fc7d2a3.png`;
const LOGO_URL = "/api/assets/neopolis-akademy-official-logo_40a16b6c.svg";
const OECD_URL = "https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en.html";

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const toJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
const themeUrl = (slug: string) => `${ORIGIN}/formations-ia/${encodeURIComponent(slug)}`;
const number = (value: number) => new Intl.NumberFormat("fr-FR").format(value);

function head({ title, description, canonicalPath, noindex = false, schema }: {
  title: string;
  description: string;
  canonicalPath: string;
  noindex?: boolean;
  schema: Record<string, unknown>;
}) {
  const canonical = `${ORIGIN}${canonicalPath}`;
  return `
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fr_FR" />
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
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #172033; background: #f7f8fb; line-height: 1.55; }
    a { color: inherit; }
    .shell { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
    .site-header { background: #fff; border-bottom: 1px solid #e7eaf0; }
    .topbar { min-height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
    .brand { display: inline-flex; align-items: center; color: #19345f; text-decoration: none; }
    .brand-logo { display: block; width: 154px; height: 38px; object-fit: contain; }
    .nav { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; font-size: .92rem; }
    .nav a { text-decoration: none; color: #475569; font-weight: 650; padding: 8px 10px; border-radius: 8px; }
    .nav a:hover { color: #173b73; background: #f1f5f9; }
    .hero { background: linear-gradient(125deg, #0c1f3e, #173f7b 60%, #237c93); color: #fff; padding: 64px 0 50px; }
    .eyebrow { margin: 0 0 12px; color: #b9d9ff; font-weight: 750; font-size: .78rem; letter-spacing: .1em; text-transform: uppercase; }
    h1 { margin: 0; max-width: 860px; font-size: clamp(2.05rem, 5vw, 3.9rem); letter-spacing: -.045em; line-height: 1.05; }
    .lead { max-width: 800px; margin: 20px 0 0; font-size: clamp(1.02rem, 2vw, 1.25rem); color: #e6f0ff; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
    .button { display: inline-flex; justify-content: center; align-items: center; min-height: 42px; border-radius: 9px; text-decoration: none; font-weight: 760; padding: 10px 16px; }
    .button-primary { color: #102747; background: #fff; }
    .button-secondary { color: #fff; border: 1px solid rgba(255,255,255,.55); }
    main { padding: 42px 0 60px; }
    h2 { margin: 0; color: #13294b; font-size: clamp(1.45rem, 3vw, 2.15rem); letter-spacing: -.03em; line-height: 1.18; }
    h3 { margin: 0; font-size: 1.08rem; color: #162f57; letter-spacing: -.02em; }
    .section-intro { margin: 12px 0 24px; max-width: 820px; color: #526178; }
    .metrics { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 28px 0 44px; }
    .metric { padding: 17px; min-width: 0; background: #fff; border: 1px solid #e4e9f1; border-radius: 12px; }
    .metric-number { display: block; color: #193c73; font-size: 1.8rem; font-weight: 820; letter-spacing: -.04em; }
    .metric-label { display: block; margin-top: 2px; color: #62738e; font-size: .82rem; font-weight: 650; }
    .themes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .theme-card, .training-card { display: flex; flex-direction: column; min-width: 0; padding: 20px; background: #fff; border: 1px solid #e4e9f1; border-radius: 14px; text-decoration: none; }
    .theme-card:hover, .training-card:hover { border-color: #9db6dc; box-shadow: 0 12px 28px rgba(18, 47, 87, .09); }
    .accent { display: block; width: 42px; height: 4px; margin-bottom: 17px; border-radius: 999px; }
    .accent-blue { background: #3171c4; }.accent-violet { background: #7350ba; }.accent-emerald { background: #20856e; }.accent-amber { background: #bd7412; }.accent-rose { background: #bd4b6a; }
    .card-copy { margin: 10px 0 18px; color: #596a82; font-size: .94rem; }
    .card-meta { margin-top: auto; color: #1c4d8e; font-size: .86rem; font-weight: 760; }
    .split { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(280px, .85fr); gap: 28px; align-items: start; margin-top: 16px; }
    .panel { background: #fff; border: 1px solid #e4e9f1; border-radius: 14px; padding: 22px; }
    .bar-list { display: grid; gap: 14px; }
    .bar-title { display: flex; justify-content: space-between; gap: 10px; color: #334763; font-size: .9rem; font-weight: 700; }
    .bar-track { width: 100%; height: 9px; overflow: hidden; background: #e9eff7; border-radius: 999px; margin-top: 7px; }
    .bar-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #1d4f91, #388f9f); }
    .training-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 20px; }
    .training-top { display: flex; gap: 10px; align-items: center; }
    .training-icon { width: 34px; height: 34px; flex: 0 0 34px; display: grid; place-items: center; border-radius: 9px; background: #edf4ff; }
    .badge { display: inline-flex; width: fit-content; margin: 14px 0 0; padding: 4px 8px; color: #26578d; background: #eaf3ff; border-radius: 999px; font-size: .74rem; font-weight: 760; }
    .stats-line { margin-top: 13px; color: #51627b; font-size: .84rem; }
    .chip-list { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 0; }
    .chip { color: #3e5473; background: #f1f5fa; padding: 6px 9px; border-radius: 999px; font-size: .81rem; }
    .context { margin-top: 42px; padding: 24px; color: #2a4266; background: #eaf4f5; border-left: 4px solid #247b87; border-radius: 8px; }
    .context p { margin: 8px 0 0; }
    .context a { color: #135d70; font-weight: 700; }
    .footer { margin-top: 54px; padding: 28px 0; color: #65748b; border-top: 1px solid #dfe6ef; font-size: .88rem; }
    @media (max-width: 900px) { .metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }.themes { grid-template-columns: repeat(2, minmax(0, 1fr)); }.split { grid-template-columns: 1fr; } }
    @media (max-width: 640px) { .shell { width: min(100% - 24px, 1180px); }.topbar { min-height: 64px; }.nav a { padding: 7px 6px; }.nav a:nth-child(2) { display: none; }.hero { padding: 48px 0 40px; }.metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }.themes, .training-grid { grid-template-columns: 1fr; }.metric { padding: 14px; } }
  </style>`;
}

function layout(body: string, options: Parameters<typeof head>[0]) {
  return `<!doctype html><html lang="fr"><head>${head(options)}${styles()}</head><body>
    <header class="site-header"><div class="shell topbar"><a class="brand" href="/" aria-label="Neopolis Akademy"><img class="brand-logo" src="${LOGO_URL}" alt="Neopolis Akademy" width="154" height="38" /></a><nav class="nav" aria-label="Navigation principale"><a href="/formations-ia">Formations IA</a><a href="/ai-news">AI News</a><a href="/training?tab=catalog">Catalogue</a><a href="/login">Se connecter</a></nav></div></header>
    ${body}
    <footer class="shell footer">Neopolis Akademy · Parcours et travaux pratiques IA. Les contenus affichés proviennent du catalogue de formation de la plateforme.</footer>
  </body></html>`;
}

function metricCards(metrics: PublicTrainingMetrics) {
  const metricsToDisplay = [
    [metrics.certificationCount, "parcours"],
    [metrics.courseCount, "cours"],
    [metrics.activityCount, "activités"],
    [metrics.exerciseCount, "exercices"],
    [metrics.videoCount, "vidéos"],
  ];
  return `<div class="metrics" aria-label="Indicateurs de l’offre Neopolis Akademy">${metricsToDisplay.map(([value, label]) => `<div class="metric"><span class="metric-number">${number(value as number)}</span><span class="metric-label">${label}</span></div>`).join("")}</div>`;
}

function themeCard(theme: PublicTrainingTheme) {
  return `<a class="theme-card" href="/formations-ia/${encodeURIComponent(theme.slug)}"><span class="accent accent-${theme.accent}"></span><h3>${escapeHtml(theme.shortTitle)}</h3><p class="card-copy">${escapeHtml(theme.description)}</p><span class="card-meta">${number(theme.metrics.certificationCount)} parcours · ${number(theme.metrics.courseCount)} cours</span></a>`;
}

function hero(title: string, lead: string) {
  return `<section class="hero"><div class="shell"><p class="eyebrow">Neopolis Akademy · Formations IA gratuites</p><h1>${escapeHtml(title)}</h1><p class="lead">${escapeHtml(lead)}</p><div class="actions"><a class="button button-primary" href="/training?tab=catalog">Voir le catalogue</a><a class="button button-secondary" href="/apply">Découvrir l’accès</a></div></div></section>`;
}

function publicIndexSchema() {
  const themes = getPublicTrainingThemes();
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Formations IA gratuites par métier | Neopolis Akademy",
    description: "Pages publiques de découverte des formations IA gratuites Neopolis Akademy, organisées par thème et métier.",
    url: `${ORIGIN}/formations-ia`,
    inLanguage: "fr-FR",
    hasPart: {
      "@type": "ItemList",
      itemListElement: themes.map((theme, index) => ({ "@type": "ListItem", position: index + 1, name: theme.shortTitle, url: themeUrl(theme.slug) })),
    },
  };
}

function themeSchema(theme: PublicTrainingTheme) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${theme.title} | ${SITE_NAME}`,
    description: theme.description,
    url: themeUrl(theme.slug),
    inLanguage: "fr-FR",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: theme.certifications.length,
      itemListElement: theme.certifications.map((certification, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Course",
          name: certification.title,
          description: certification.description,
          provider: { "@type": "Organization", name: SITE_NAME, url: ORIGIN },
          url: `${ORIGIN}/training/${encodeURIComponent(certification.id)}`,
        },
      })),
    },
  };
}

export function renderPublicTrainingIndex() {
  const themes = getPublicTrainingThemes();
  const metrics = getPublicTrainingCatalogMetrics();
  const body = `${hero("Formations IA gratuites par métier", "Explorez l’offre Neopolis Akademy par domaine d’activité : compétences, exercices, vidéos et formations disponibles sur la plateforme.")}
    <main class="shell">
      <section aria-labelledby="offer-title"><h2 id="offer-title">Une offre structurée autour des usages professionnels</h2><p class="section-intro">Choisissez un thème correspondant à votre métier ou à l’objectif que vous souhaitez développer. Les volumes ci-dessous décrivent l’offre déclarée dans le catalogue Neopolis Akademy.</p>${metricCards(metrics)}</section>
      <section aria-labelledby="themes-title"><h2 id="themes-title">Choisir une formation IA par métier</h2><p class="section-intro">Chaque page rassemble les formations et parcours rattachés à un thème précis, avec leurs indicateurs réels et les métiers visés.</p><div class="themes">${themes.map(themeCard).join("")}</div></section>
      <section class="context" aria-labelledby="context-title"><h2 id="context-title">Pourquoi développer des compétences IA ?</h2><p>L’OCDE indique que son enquête 2024 auprès de plus de 5 000 PME a observé un usage de l’IA générative dans 31 % des entreprises interrogées ; 65 % des PME utilisatrices rapportaient une amélioration de la performance des salariés. Ce contexte ne constitue pas une promesse de résultat : il souligne l’intérêt d’un apprentissage structuré, adapté au métier et à l’organisation. <a href="${OECD_URL}" rel="noopener noreferrer">Consulter la publication de l’OCDE</a>.</p></section>
    </main>`;
  return layout(body, {
    title: "Formations IA gratuites par métier | Neopolis Akademy",
    description: "Découvrez les formations IA gratuites Neopolis Akademy par métier : data, finance, marketing, RH, support client, opérations, juridique et ingénierie IA.",
    canonicalPath: "/formations-ia",
    schema: publicIndexSchema(),
  });
}

export function renderPublicTrainingTheme(theme: PublicTrainingTheme) {
  const maxMetric = Math.max(...theme.certifications.map((certification) => certification.metrics.activityCount), 1);
  const body = `${hero(theme.title, theme.description)}
    <main class="shell">
      <section aria-labelledby="theme-overview"><h2 id="theme-overview">Développer les compétences utiles pour ce domaine</h2><p class="section-intro">${escapeHtml(theme.introduction)}</p>${metricCards(theme.metrics)}</section>
      <div class="split"><section class="panel" aria-labelledby="volume-title"><h2 id="volume-title">Répartition des activités par formation</h2><p class="section-intro">La visualisation représente les activités déclarées dans l’offre Neopolis Akademy de ce thème.</p><div class="bar-list">${theme.certifications.map((certification) => `<div><div class="bar-title"><span>${escapeHtml(certification.title)}</span><span>${number(certification.metrics.activityCount)}</span></div><div class="bar-track" role="img" aria-label="${escapeHtml(certification.title)} : ${number(certification.metrics.activityCount)} activités"><div class="bar-fill" style="width:${Math.max(4, Math.round((certification.metrics.activityCount / maxMetric) * 100))}%"></div></div></div>`).join("")}</div></section>
        <aside class="panel" aria-labelledby="roles-title"><h2 id="roles-title">Métiers et compétences associés</h2><p class="section-intro">Les termes ci-dessous sont dérivés des données pédagogiques du catalogue.</p><h3>Métiers cibles</h3><div class="chip-list">${theme.roles.slice(0, 14).map((role) => `<span class="chip">${escapeHtml(role)}</span>`).join("") || '<span class="chip">Parcours transversal</span>'}</div><h3 style="margin-top:22px">Compétences abordées</h3><div class="chip-list">${theme.skills.slice(0, 14).map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("") || '<span class="chip">Compétences IA appliquées</span>'}</div></aside>
      </div>
      <section aria-labelledby="formations-title" style="margin-top:42px"><h2 id="formations-title">Formations disponibles dans ce thème</h2><p class="section-intro">Accédez au catalogue pour consulter le détail des cours, les conditions d’accès et votre progression personnelle.</p><div class="training-grid">${theme.certifications.map((certification) => `<a class="training-card" href="/training/${encodeURIComponent(certification.id)}"><div class="training-top"><span class="training-icon" aria-hidden="true">${escapeHtml(certification.icon)}</span><h3>${escapeHtml(certification.title)}</h3></div><p class="card-copy">${escapeHtml(certification.description)}</p><span class="badge">${escapeHtml(certification.trainingFormat)} · ${escapeHtml(certification.level)}</span><p class="stats-line">${number(certification.metrics.courseCount)} cours · ${number(certification.metrics.activityCount)} activités · ${number(certification.metrics.exerciseCount)} exercices · ${number(certification.metrics.videoCount)} vidéos</p></a>`).join("")}</div></section>
      <section class="context"><h2>Explorer d’autres métiers</h2><p>Comparez ce thème avec les autres parcours publics et choisissez le domaine qui correspond le mieux à votre objectif professionnel. <a href="/formations-ia">Voir toutes les pages thématiques</a>.</p></section>
    </main>`;
  return layout(body, {
    title: `${theme.title} | ${SITE_NAME}`,
    description: theme.description,
    canonicalPath: `/formations-ia/${theme.slug}`,
    schema: themeSchema(theme),
  });
}

export function renderPublicTrainingNotFound() {
  return layout(`<main class="shell" style="padding:72px 0"><h1>Thème de formation introuvable</h1><p class="section-intro">La page demandée n’existe pas ou n’est plus disponible.</p><a class="button" style="background:#173f7b;color:#fff" href="/formations-ia">Voir les formations IA par métier</a></main>`, {
    title: `Page introuvable | ${SITE_NAME}`,
    description: "La page demandée est introuvable.",
    canonicalPath: "/formations-ia",
    noindex: true,
    schema: { "@context": "https://schema.org", "@type": "WebPage", name: "Page introuvable" },
  });
}

export function renderPublicTrainingSitemap() {
  const urls = ["/formations-ia", ...getPublicTrainingThemes().map((theme) => `/formations-ia/${theme.slug}`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${ORIGIN}${url}</loc></url>`).join("")}</urlset>`;
}

export function registerPublicTrainingPages(app: Express) {
  const sendHtml = (res: Response, html: string, status = 200) => res.status(status).set({ "Cache-Control": "no-cache", "Content-Type": "text/html; charset=utf-8" }).send(html);
  app.get("/formations-ia", (_req: Request, res: Response) => sendHtml(res, renderPublicTrainingIndex()));
  app.get("/formations-ia/:themeSlug", (req: Request, res: Response) => {
    const theme = getPublicTrainingTheme(req.params.themeSlug);
    return theme ? sendHtml(res, renderPublicTrainingTheme(theme)) : sendHtml(res, renderPublicTrainingNotFound(), 404);
  });
  app.get("/sitemap.xml", (_req: Request, res: Response) => res.status(200).set({ "Cache-Control": "no-cache", "Content-Type": "application/xml; charset=utf-8" }).send(renderPublicTrainingSitemap()));
  app.get("/robots.txt", (_req: Request, res: Response) => res.status(200).set({ "Cache-Control": "no-cache", "Content-Type": "text/plain; charset=utf-8" }).send(`User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`));
}
