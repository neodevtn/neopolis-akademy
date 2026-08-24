import { describe, expect, it } from "vitest";
import trainingIndex from "../client/src/data/trainingIndex.json";

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
    expect(partnerCertifications).toHaveLength(36);
    expect(partnerCertifications.every((certification) => certification.provider === "datacamp" && certification.group !== "datacamp_partner")).toBe(true);
  });
});
