import { describe, expect, it } from "vitest";
import catalog from "@/data/trainingIndex.json";
import { CAREER_FAMILY_DEFINITIONS, extractTargetJobRoles, getCareerFamilyIds, getCertificationCareerFamilyIds, getTrainingFormatDefinitions, matchesCatalogueSearchText, normalizeCatalogueSearchTokens, resolveTrainingFormat } from "./trainingCatalogTaxonomy";

describe("taxonomie de formation", () => {
  it("déclare les trois sous-catégories de formation demandées", () => {
    expect(getTrainingFormatDefinitions((catalog as any).trainingFormats).map((format) => format.id)).toEqual([
      "certification_preparation",
      "formation",
      "tutorial_tp",
    ]);
  });

  it("classe les quarante TP comme tutoriels autonomes et les résume dans des familles métier sans doublon", () => {
    const certifications = (catalog as any).certifications.filter((certification: any) => certification.group === "ia_appliquee_metiers_tp");
    const courses = (catalog as any).courses.filter((course: any) => course.certId?.startsWith("ia_appliquee_metiers_tp__formation_"));
    const visibleRoles = extractTargetJobRoles(courses);

    expect(certifications).toHaveLength(40);
    expect(certifications.every((certification: any) => resolveTrainingFormat(certification) === "tutorial_tp")).toBe(true);
    expect(courses).toHaveLength(40);
    expect(courses.every((course: any) => typeof course.targetJob === "string" && course.targetJob.length > 0)).toBe(true);
    expect(visibleRoles.length).toBeLessThanOrEqual(CAREER_FAMILY_DEFINITIONS.length);
    expect(new Set(visibleRoles).size).toBe(visibleRoles.length);
    expect(getCareerFamilyIds(courses).length).toBeGreaterThan(0);
    expect(visibleRoles).toContain("Marketing, vente & croissance");
    expect(CAREER_FAMILY_DEFINITIONS.map((family) => family.id)).toContain("health_research");
    expect(extractTargetJobRoles([{ targetJob: "Médecin chercheur en épidémiologie clinique" }])).toEqual(["Santé, médecine & recherche clinique"]);
  });

  it("intersecte une recherche textuelle avec les autres critères sans sensibilité aux accents", () => {
    expect(normalizeCatalogueSearchTokens("  Développer  agents IA ")).toEqual(["developper", "agents", "ia"]);
    expect(matchesCatalogueSearchText("Développer des agents IA avec Python et API", "developper agents")).toBe(true);
    expect(matchesCatalogueSearchText("Développer des agents IA avec Python et API", "developper finance")).toBe(false);
    expect(matchesCatalogueSearchText("Développer des agents IA avec Python et API", "")).toBe(true);
  });

  it("n'expose que les familles métier contrôlées et rattache le parcours santé", () => {
    const ids = getCertificationCareerFamilyIds({
      certificationId: "claude_science_recherche_sante_v3",
      searchText: "Claude Science pour la recherche médicale et clinique",
      courses: [],
    });
    expect(ids).toContain("health_research");
    expect(ids.every((id) => CAREER_FAMILY_DEFINITIONS.some((family) => family.id === id))).toBe(true);
    expect(CAREER_FAMILY_DEFINITIONS).toHaveLength(12);
  });
});
