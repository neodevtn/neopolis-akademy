import { describe, expect, it } from "vitest";
import { ANALYTICS_EVENT_NAMES, createDataLayerGtag, sanitizeAnalyticsLocation, sanitizeAnalyticsParams } from "./analytics";

describe("analytics privacy guards", () => {
  it("expose la nomenclature stable des événements métier attendus", () => {
    expect(ANALYTICS_EVENT_NAMES).toEqual(expect.arrayContaining([
      "sign_up", "login", "search", "view_course", "begin_course", "lesson_start", "lesson_complete",
      "chapter_complete", "quiz_start", "quiz_complete", "exercise_start", "exercise_complete", "download_resource",
      "video_start", "video_progress", "video_complete", "course_complete", "certificate_mock_start", "certificate_mock_complete",
    ]));
  });

  it("ne conserve que les paramètres autorisés et non personnels", () => {
    expect(sanitizeAnalyticsParams({ course_id: "cours_ia_01", lesson_index: 2, email: "personne@example.test", token: "secret", search_category: "catalogue" })).toEqual({ course_id: "cours_ia_01", lesson_index: 2, search_category: "catalogue" });
  });

  it("supprime les valeurs personnelles ou sensibles même sous une propriété autorisée", () => {
    expect(sanitizeAnalyticsParams({
      course_id: "personne@example.test",
      certification_id: "https://example.test/secret",
      content_id: "+216 20 000 000",
      content_type: "course",
    })).toEqual({ content_type: "course" });
  });

  it("conserve les identifiants fonctionnels des appels à l’action", () => {
    expect(sanitizeAnalyticsParams({ content_type: "home_hero", content_id: "apply_primary" })).toEqual({ content_type: "home_hero", content_id: "apply_primary" });
  });

  it("conserve les paramètres pédagogiques strictement fonctionnels demandés", () => {
    expect(sanitizeAnalyticsParams({
      course_slug: "analyse-donnees-ia",
      category_slug: "data-bi",
      language: "fr",
      lesson_slug: "lesson-2",
      resource_type: "pdf",
      resource_name_sanitized: "guide-demarrage",
      score_band: "75_100",
      passed: true,
    })).toEqual({
      course_slug: "analyse-donnees-ia",
      category_slug: "data-bi",
      language: "fr",
      lesson_slug: "lesson-2",
      resource_type: "pdf",
      resource_name_sanitized: "guide-demarrage",
      score_band: "75_100",
      passed: true,
    });
  });

  it("met les commandes dans dataLayer au format standard attendu par gtag.js", () => {
    const dataLayer: unknown[] = [];
    const gtag = createDataLayerGtag(dataLayer);

    gtag("config", "measurement-test", { send_page_view: false });

    expect(dataLayer).toHaveLength(1);
    expect(Array.isArray(dataLayer[0])).toBe(false);
    expect(Array.from(dataLayer[0] as ArrayLike<unknown>)).toEqual(["config", "measurement-test", { send_page_view: false }]);
  });

  it("supprime les paramètres de parrainage et les fragments des vues de page", () => {
    expect(sanitizeAnalyticsLocation("https://akademy.neodev.click/refer?ref=NEO-123&utm_source=linkedin#share")).toBe("https://akademy.neodev.click/refer");
    expect(sanitizeAnalyticsLocation("/training/a/b?lesson=2&chapter=3&email=test@example.test", "https://akademy.neodev.click")).toBe("https://akademy.neodev.click/training/a/b?lesson=2&chapter=3");
  });
});
