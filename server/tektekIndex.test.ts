import { describe, expect, it } from "vitest";
import { getTekTekTrainingSources, searchTekTekSources } from "./tektekIndex";

describe("index TekTek", () => {
  it("indexe les cours et séquences vidéo de la formation demandée", () => {
    const indexed = getTekTekTrainingSources("claude_certified_architect_foundations", "fr");
    expect(indexed).not.toBeNull();
    expect(indexed?.courseIds.size).toBe(7);
    expect(indexed?.sources.some((source) => source.kind === "video" && source.text.length > 0)).toBe(true);
    expect(indexed?.sources.some((source) => source.id.includes("transcript-text-") && source.kind === "video")).toBe(true);
  });

  it("priorise le contexte du cours actif sans sortir de la formation autorisée", () => {
    const results = searchTekTekSources({
      certificationId: "claude_certified_architect_foundations",
      allowedCourseIds: ["claude_certified_architect_foundations__01", "claude_certified_architect_foundations__02"],
      activeCourseId: "claude_certified_architect_foundations__01",
      lessonIndex: 0,
      chapterIndex: 0,
      question: "Comment fonctionne Claude et quels sont les modèles ?",
      language: "fr",
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((source) => source.courseId === "claude_certified_architect_foundations__01" || source.courseId === "claude_certified_architect_foundations__02")).toBe(true);
    expect(results[0]?.courseId).toBe("claude_certified_architect_foundations__01");
  });
});
