import { describe, expect, it } from "vitest";
import trainingIndex from "../client/src/data/trainingIndex.json";
import { selectExamQuestions, toLearnerExamReview, type ExamQuestion } from "./examDefinition";
import { normalizeExamConfiguration } from "../shared/examConfiguration";
import allQuestions from "./data/mockExamQuestions.json";

const certificationId = "claude_certified_architect_foundations";
const questions = (allQuestions as ExamQuestion[]).filter((question) => question.certificationId === certificationId);
const rawConfiguration = (trainingIndex as any).examConfig[certificationId];
const configuration = normalizeExamConfiguration(rawConfiguration, questions.length);

describe("CCAR-F scenario selection", () => {
  it("keeps the approved CCAR-F format and blueprint", () => {
    expect(configuration).toMatchObject({
      examCode: "CCAR-F",
      totalQuestions: 60,
      timeLimit: 120,
      passingScore: 720,
      scenarioSelection: { availableFamilies: 6, selectedFamilies: 4, questionsPerFamily: 3 },
    });
    expect(configuration.domains.map((domain) => domain.weight)).toEqual([27, 18, 20, 20, 15]);
  });

  it("selects exactly four original scenario families and retains sixty private questions", () => {
    const attempt = selectExamQuestions(questions, configuration);
    const scenarioQuestions = attempt.filter((question) => question.scenarioFamily);
    const families = new Set(scenarioQuestions.map((question) => question.scenarioFamily));
    expect(attempt).toHaveLength(60);
    expect(new Set(attempt.map((question) => question.id)).size).toBe(60);
    expect(families.size).toBe(4);
    expect(scenarioQuestions).toHaveLength(12);
    expect(scenarioQuestions.every((question) => question.version === "neopolis-original-2026-09-14")).toBe(true);
  });

  it("maintains the target blueprint distribution when the scenario questions are included", () => {
    const attempt = selectExamQuestions(questions, configuration);
    const counts = new Map<string, number>();
    for (const question of attempt) {
      const domain = typeof question.domain === "string" ? question.domain : question.domain?.en || "";
      counts.set(domain, (counts.get(domain) || 0) + 1);
    }
    expect(Array.from(counts.values()).reduce((total, count) => total + count, 0)).toBe(60);
    expect(counts.get("Agentic Architecture & Orchestration")).toBe(16);
    expect(counts.get("Tool Design & MCP Integration")).toBe(11);
    expect(counts.get("Claude Code Configuration & Workflows")).toBe(12);
    expect(counts.get("Prompt Engineering & Structured Output")).toBe(12);
    expect(counts.get("Context Management & Reliability")).toBe(9);
  });

  it("returns a choice-specific rationale for every CCAR-F option only after server-side submission", () => {
    const attempt = selectExamQuestions(questions, configuration);
    const review = toLearnerExamReview(attempt);
    expect(review).toHaveLength(60);
    expect(review.every((question) => question.choices.every((choice) => typeof choice.rationale === "string" || Boolean(choice.rationale?.en || choice.rationale?.fr)))).toBe(true);
  });
});
