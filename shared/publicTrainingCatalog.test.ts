import { describe, expect, it } from "vitest";
import {
  getPublicCatalogueCourse,
  getPublicCatalogueSitemapEntries,
  getPublicCatalogueTraining,
  getPublicCatalogueTrainings,
} from "./publicTrainingCatalog";

describe("catalogue public de formation", () => {
  it("dérive des formations et des cours avec des slugs neutres et uniques", () => {
    const trainings = getPublicCatalogueTrainings("fr");
    const slugs = trainings.map((training) => training.slug);

    expect(trainings.length).toBeGreaterThan(0);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(trainings.every((training) => training.title && training.format && training.metrics.courseCount === training.courses.length)).toBe(true);
    expect(getPublicCatalogueSitemapEntries().length).toBeGreaterThan(trainings.length);
  });

  it("retrouve un cours uniquement à l’intérieur de sa formation publique", () => {
    const training = getPublicCatalogueTrainings("en").find((item) => item.courses.length > 0);
    expect(training).toBeDefined();

    const foundTraining = getPublicCatalogueTraining(training!.slug, "en");
    const foundCourse = getPublicCatalogueCourse(training!.slug, training!.courses[0].slug, "en");

    expect(foundTraining?.title).toBe(training!.title);
    expect(foundCourse?.course.title).toBe(training!.courses[0].title);
    expect(getPublicCatalogueCourse(training!.slug, "inexistant", "en")).toBeNull();
  });

  it("retire des fiches publiques les formulations de provenance d’import", () => {
    for (const locale of ["fr", "en", "ar"] as const) {
      const descriptions = getPublicCatalogueTrainings(locale)
        .flatMap((training) => [training.description, ...training.courses.map((course) => course.description)]);

      const prohibitedDescription = descriptions.find((description) => /cours partenaire|partner course|hugging face learn autorisé/i.test(description));
      expect(prohibitedDescription, locale).toBeUndefined();
    }
  });
});
