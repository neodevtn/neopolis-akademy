import { describe, expect, it } from "vitest";
import trainingIndex from "@/data/trainingIndex.json";
import { certificationHasExam, formatExamSummary, getTrainingExamInfo } from "./trainingExamMetadata";

describe("métadonnées d’examen de formation", () => {
  it("expose uniquement les formations avec un examen blanc configuré", () => {
    const examCertifications = (trainingIndex as any).certifications.filter((certification: any) => certificationHasExam(trainingIndex as any, certification));

    expect(examCertifications.map((certification: any) => certification.id).sort()).toEqual([
      "claude_certified_architect_foundations",
      "claude_certified_architect_professional",
      "claude_certified_associate_foundations",
      "claude_certified_developer_foundations",
    ]);
  });

  it("fournit les questions, la durée et le seuil depuis la configuration canonique", () => {
    const info = getTrainingExamInfo(trainingIndex as any, "claude_certified_associate_foundations");

    expect(info?.examCode).toBe("CCAO-F");
    expect(info?.totalQuestions).toBe(60);
    expect(info?.timeLimit).toBe(120);
    expect(info?.passingScore).toBe(720);
    expect(formatExamSummary(info, "fr")).toBe("60 questions · 120 min · seuil 720/1000");
  });

  it("ne marque pas les tutoriels TP autonomes comme formations certifiantes", () => {
    const tpCertifications = (trainingIndex as any).certifications.filter((certification: any) => certification.group === "ia_appliquee_metiers_tp");

    expect(tpCertifications).toHaveLength(40);
    expect(tpCertifications.every((certification: any) => !certificationHasExam(trainingIndex as any, certification))).toBe(true);
  });
});

