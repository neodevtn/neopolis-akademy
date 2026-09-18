import { describe, expect, it } from "vitest";
import { normalizeSectionLessonTitles } from "./LessonSidebar";

describe("normalizeSectionLessonTitles", () => {
  it("resolves localized section lesson titles before sidebar matching", () => {
    expect(normalizeSectionLessonTitles([
      { fr: "Introduction du module", en: "Module Introduction" },
      { fr: "Données de santé", en: "Health data" },
      "Module Complete",
    ])).toEqual(["Module Introduction", "Health data", "Module Complete"]);
  });

  it("keeps legacy string lists and ignores an invalid section value", () => {
    expect(normalizeSectionLessonTitles(["Foundations", "Practice"])).toEqual(["Foundations", "Practice"]);
    expect(normalizeSectionLessonTitles({ lessons: [] })).toEqual([]);
  });
});
