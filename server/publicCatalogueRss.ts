import { getPublicCatalogueTrainings } from "@shared/publicTrainingCatalog";
import { getPublicCatalogueEditorialBuiltAt } from "@shared/publicCatalogueEditorial";
import { publicTrainingCataloguePath, type PublicTrainingLocale } from "@shared/publicTrainingLocale";
import imageBytes from "@shared/publicCatalogueRssImageBytes.generated.json";

const ORIGIN = "https://akademy.neodev.click";
const RSS_PATH: Record<"fr" | "en", string> = {
  fr: "/formations-ia/rss.xml",
  en: "/en/ai-training/rss.xml",
};

const xml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const trustedCardPath = (path: string) => /^\/api\/assets\/[A-Za-z0-9_.-]+\.png$/.test(path);
const bytesByPath = imageBytes as Record<string, number>;

/** Publier les images du catalogue avec des liens pérennes, jamais des URL signées. */
export function renderPublicCatalogueRss(locale: "fr" | "en" = "fr") {
  const trainings = getPublicCatalogueTrainings(locale);
  const title = locale === "fr" ? "Neopolis Akademy — Formations IA" : "Neopolis Akademy — AI Training";
  const channelDescription = locale === "fr"
    ? "Formations et cours publics disponibles sur Neopolis Akademy, avec description et visuel de chaque formation."
    : "Available public training programmes and courses at Neopolis Akademy, with descriptions and programme images.";
  const items = trainings.flatMap((training) => {
    const image = trustedCardPath(training.visual.cardPath) ? `${ORIGIN}${training.visual.cardPath}` : null;
    const size = image ? bytesByPath[training.visual.cardPath] : null;
    const imageMeta = image
      ? `<media:content url="${xml(image)}" medium="image" type="image/png" width="${training.visual.cardWidth}" height="${training.visual.cardHeight}" /><media:thumbnail url="${xml(image)}" width="${training.visual.cardWidth}" height="${training.visual.cardHeight}" />${size && Number.isSafeInteger(size) && size > 0 ? `<enclosure url="${xml(image)}" length="${size}" type="image/png" />` : ""}`
      : "";
    const itemsForTraining = [
      { title: training.title, description: training.description, overview: training.overview, path: publicTrainingCataloguePath(locale, training.slug), imageMeta, image, category: training.format },
      ...training.courses.map((course) => ({ title: course.title, description: course.description, overview: course.overview, path: publicTrainingCataloguePath(locale, training.slug, course.slug), imageMeta, image, category: training.title })),
    ];
    return itemsForTraining.map((item) => {
      const canonical = `${ORIGIN}${item.path}`;
      const html = `${item.image ? `<p><img src="${xml(item.image)}" alt="${xml(item.title)}" width="${training.visual.cardWidth}" height="${training.visual.cardHeight}" /></p>` : ""}<p>${xml(item.description)}</p>${item.overview.map((paragraph) => `<p>${xml(paragraph)}</p>`).join("")}<p><a href="${xml(canonical)}">${locale === "fr" ? "Consulter la fiche de la formation" : "View the training page"}</a></p>`;
      return `<item><title>${xml(item.title)}</title><link>${xml(canonical)}</link><guid isPermaLink="true">${xml(canonical)}</guid><description>${xml(item.description)}</description><category>${xml(item.category)}</category>${item.imageMeta}<content:encoded>${xml(html)}</content:encoded></item>`;
    });
  });
  const builtAt = getPublicCatalogueEditorialBuiltAt();
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>${xml(title)}</title><link>${ORIGIN}${publicTrainingCataloguePath(locale)}</link><description>${xml(channelDescription)}</description><language>${locale === "fr" ? "fr-FR" : "en"}</language><ttl>60</ttl>${builtAt ? `<lastBuildDate>${builtAt.toUTCString()}</lastBuildDate>` : ""}<atom:link href="${ORIGIN}${RSS_PATH[locale]}" rel="self" type="application/rss+xml" />${items.join("")}</channel></rss>`;
}

/** La troisième langue n'a pas encore d'enrichissement éditorial rédigé et vérifié. */
export function getPublicCatalogueRssPath(locale: PublicTrainingLocale) {
  return locale === "en" ? RSS_PATH.en : RSS_PATH.fr;
}
