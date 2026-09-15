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

  it("retrouve des approfondissements hors de l’écran actif pour une question elliptique", () => {
    const results = searchTekTekSources({
      certificationId: "claude_certified_architect_foundations",
      allowedCourseIds: [
        "claude_certified_architect_foundations__01",
        "claude_certified_architect_foundations__02",
      ],
      activeCourseId: "claude_certified_architect_foundations__01",
      lessonIndex: 0,
      chapterIndex: 0,
      question: "Where is this topic explored further?",
      language: "en",
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((source) => source.courseId !== "claude_certified_architect_foundations__01" || source.lessonIndex !== 0 || source.chapterIndex !== 0)).toBe(true);
  });

  it("ne fabrique pas de source pour une question hors formation à partir d’un mot générique", () => {
    const results = searchTekTekSources({
      certificationId: "claude_certified_architect_foundations",
      allowedCourseIds: ["claude_certified_architect_foundations__01"],
      activeCourseId: "claude_certified_architect_foundations__01",
      lessonIndex: 0,
      chapterIndex: 0,
      question: "What is the current price of Bitcoin?",
      language: "en",
    });

    expect(results).toEqual([]);
  });

  it("retrouve un autre cours autorisé de la formation pour une question inter-cours explicite", () => {
    const results = searchTekTekSources({
      certificationId: "claude_certified_architect_foundations",
      allowedCourseIds: [
        "claude_certified_architect_foundations__01",
        "claude_certified_architect_foundations__02",
      ],
      activeCourseId: "claude_certified_architect_foundations__01",
      lessonIndex: 0,
      chapterIndex: 0,
      question: "How do Claude Code hooks work?",
      language: "en",
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((source) => source.courseId === "claude_certified_architect_foundations__02")).toBe(true);
  });

  it("retrouve les quatre compétences AI Fluency pour une question conceptuelle explicite", () => {
    const results = searchTekTekSources({
      certificationId: "claude_certified_architect_foundations",
      allowedCourseIds: ["claude_certified_architect_foundations__01"],
      activeCourseId: "claude_certified_architect_foundations__01",
      lessonIndex: 0,
      chapterIndex: 0,
      question: "What are the four Ds of AI fluency?",
      language: "en",
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((source) => /delegation|description|discernment|diligence/i.test(source.text))).toBe(true);
  });

  it("préserve l’identifiant court 4D et retrouve son cadre dans le cours actif", () => {
    const results = searchTekTekSources({
      certificationId: "claude_certified_architect_foundations",
      allowedCourseIds: ["claude_certified_architect_foundations__01"],
      activeCourseId: "claude_certified_architect_foundations__01",
      lessonIndex: 0,
      chapterIndex: 0,
      question: "Explique le framework 4D présenté dans ce cours.",
      language: "fr",
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((source) => /4d|delegation|description|discernment|diligence/i.test(`${source.title} ${source.text}`))).toBe(true);
  });
});
