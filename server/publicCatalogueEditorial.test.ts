import { describe, expect, it } from "vitest";
import catalogue from "@/data/trainingIndex.json";
import editorial from "@shared/publicCatalogueEditorial.generated.json";
import { getPublicCatalogueTrainings } from "@shared/publicTrainingCatalog";
import { renderPublicCatalogueTraining, renderPublicCatalogueCourse } from "./publicTrainingPages";

const sourceNames = /\b(?:datacamp|skilljar|certsafari|coursera|udemy|cours partenaire|parcours partenaire|formation partenaire|partner course|partner learning path)\b/i;

describe("descriptions publiques enrichies", () => {
  it("couvre exactement les 117 formations et les 182 cours avec une rédaction FR/EN relue", () => {
    expect(Number.isFinite(Date.parse(editorial.generatedAt))).toBe(true);
    expect(catalogue.certifications).toHaveLength(117);
    expect(catalogue.courses).toHaveLength(182);
    expect(Object.keys(editorial.programmes)).toHaveLength(catalogue.certifications.length);
    expect(Object.keys(editorial.courses)).toHaveLength(catalogue.courses.length);
    for (const [kind, ids] of [["programmes", catalogue.certifications.map((item) => item.id)], ["courses", catalogue.courses.map((item) => item.id)]] as const) {
      const entries = editorial[kind];
      expect(Object.keys(entries).sort()).toEqual(ids.slice().sort());
      for (const entry of Object.values(entries)) {
        for (const locale of ["fr", "en"] as const) {
          const text = entry[locale];
          expect(text.summary.length).toBeGreaterThan(90);
          expect(text.overview.length).toBeGreaterThanOrEqual(1);
          expect(text.overview.every((paragraph) => paragraph.length > 35)).toBe(true);
          expect([text.summary, ...text.overview].some((part) => sourceNames.test(part))).toBe(false);
        }
      }
    }
  });

  it("réutilise le même résumé dans le rendu public, la description SEO et les programmes du RSS", () => {
    for (const locale of ["fr", "en"] as const) {
      const training = getPublicCatalogueTrainings(locale)[0]!;
      expect(Object.values(editorial.programmes).some((entry) => entry[locale]?.summary === training.description)).toBe(true);
      const html = renderPublicCatalogueTraining(training, locale);
      expect(html).toContain(training.description.replace(/&/g, "&amp;").replace(/</g, "&lt;"));
      expect(html).toContain(training.overview[0]!.replace(/&/g, "&amp;").replace(/</g, "&lt;"));
      const course = training.courses[0]!;
      expect(Object.values(editorial.courses).some((entry) => entry[locale]?.summary === course.description)).toBe(true);
      expect(renderPublicCatalogueCourse(training, course, locale)).toContain(course.overview[0]!.replace(/&/g, "&amp;").replace(/</g, "&lt;"));
    }
  });
});
