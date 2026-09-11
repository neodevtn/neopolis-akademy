import { getPublicTrainingThemes } from "../shared/publicTrainingThemes";

const locales = ["fr", "en", "ar"] as const;
const byLocale = Object.fromEntries(locales.map((locale) => [locale, new Map(
  getPublicTrainingThemes(locale)
    .flatMap((theme) => theme.useCases)
    .map((useCase) => [useCase.courseId, useCase]),
)]));

const cases = [...byLocale.fr.values()].map((frenchCase) => ({
  courseId: frenchCase.courseId,
  fr: frenchCase.title,
  en: byLocale.en.get(frenchCase.courseId)?.title || "",
  ar: byLocale.ar.get(frenchCase.courseId)?.title || "",
}));

const missing = cases.filter((item) => !item.en || !item.ar);
const duplicatedFrench = cases.filter((item) => item.en === item.fr || item.ar === item.fr);

console.log(JSON.stringify({
  total: cases.length,
  missingCount: missing.length,
  duplicatedFrenchCount: duplicatedFrench.length,
  missing,
  duplicatedFrench,
}, null, 2));

if (missing.length > 0) process.exitCode = 1;
