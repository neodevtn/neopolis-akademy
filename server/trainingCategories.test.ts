import { describe, expect, it } from "vitest";
import trainingIndex from "../client/src/data/trainingIndex.json";
import { certificationHasExam, formatExamSummary, getTrainingExamInfo } from "../client/src/lib/trainingExamMetadata";

describe("training category coverage", () => {
  const categories = new Set(trainingIndex.categories.map((category) => category.id));
  const certifications = new Map(trainingIndex.certifications.map((certification) => [certification.id, certification]));

  it("assigns every certification to an existing category", () => {
    const invalid = trainingIndex.certifications.filter((certification) => !certification.group || !categories.has(certification.group));
    expect(invalid).toEqual([]);
  });

  it("assigns every course through its certification category", () => {
    const unresolved = trainingIndex.courses.filter((course) => {
      const certification = certifications.get(course.certId);
      return !certification || !categories.has(certification.group);
    });
    expect(unresolved).toEqual([]);
  });

  it("keeps DataCamp provenance while using subject-specific categories", () => {
    const partnerCertifications = trainingIndex.certifications.filter((certification) => certification.id.startsWith("datacamp_"));
    expect(partnerCertifications).toHaveLength(55);
    expect(partnerCertifications.every((certification) => certification.provider === "datacamp" && certification.group !== "datacamp_partner")).toBe(true);
  });

  it("expose les métadonnées d’examen uniquement pour les formations certifiantes configurées", () => {
    const examCertifications = trainingIndex.certifications.filter((certification) => certificationHasExam(trainingIndex, certification));

    expect(examCertifications).toHaveLength(4);
    for (const certification of examCertifications) {
      const exam = getTrainingExamInfo(trainingIndex, certification.id);
      expect(certification.trainingFormat).toBe("certification_preparation");
      expect(exam?.totalQuestions).toBeGreaterThan(0);
      expect(exam?.timeLimit).toBeGreaterThan(0);
      expect(formatExamSummary(exam, "fr")).toContain("questions");
      expect(formatExamSummary(exam, "fr")).toContain("min");
    }
  });
});
