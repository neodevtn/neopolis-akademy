import { describe, expect, it } from "vitest";
import catalog from "@/data/trainingIndex.json";
import { extractTargetJobRoles, getTrainingFormatDefinitions, resolveTrainingFormat } from "./trainingCatalogTaxonomy";

describe("taxonomie de formation", () => {
  it("déclare les trois sous-catégories de formation demandées", () => {
    expect(getTrainingFormatDefinitions((catalog as any).trainingFormats).map((format) => format.id)).toEqual([
      "certification_preparation",
      "formation",
      "tutorial_tp",
    ]);
  });

  it("classe les quarante TP comme tutoriels autonomes et expose tous leurs métiers au filtre", () => {
    const certifications = (catalog as any).certifications.filter((certification: any) => certification.group === "ia_appliquee_metiers_tp");
    const courses = (catalog as any).courses.filter((course: any) => course.certId?.startsWith("ia_appliquee_metiers_tp__formation_"));
    const visibleRoles = extractTargetJobRoles(courses);

    expect(certifications).toHaveLength(40);
    expect(certifications.every((certification: any) => resolveTrainingFormat(certification) === "tutorial_tp")).toBe(true);
    expect(courses).toHaveLength(40);
    expect(courses.every((course: any) => typeof course.targetJob === "string" && course.targetJob.length > 0)).toBe(true);
    for (const course of courses) {
      for (const role of course.targetJob.split(",").map((value: string) => value.trim())) {
        expect(visibleRoles).toContain(role);
      }
    }
  });
});
