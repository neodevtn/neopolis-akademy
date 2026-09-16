import { describe, expect, it } from "vitest";
import allQuestions from "./data/mockExamQuestions.json";

type Localized = { en?: string; fr?: string };
type Choice = {
  id: string;
  text: Localized;
  rationale: Localized;
  rationaleProvenance?: { model?: string; method?: string };
};
type Question = {
  id: string;
  certificationId: string;
  domain: string;
  subdomain?: string;
  objective?: string;
  difficulty?: string;
  sourceType?: string;
  version?: string;
  question: Localized;
  choices: Choice[];
  correctChoiceIds: string[];
  explanation: Localized;
  scenarioFamily?: string;
};

const targetCounts = {
  claude_certified_architect_foundations: 330,
  claude_certified_associate_foundations: 330,
  claude_certified_developer_foundations: 300,
  claude_certified_architect_professional: 315,
} as const;

const expectedDomains = {
  claude_certified_architect_foundations: ["Agentic Architecture & Orchestration", "Tool Design & MCP Integration", "Claude Code Configuration & Workflows", "Prompt Engineering & Structured Output", "Context Management & Reliability"],
  claude_certified_associate_foundations: ["Prompting and Task Execution", "Output Evaluation and Validation", "Product and Model Selection", "Workflow Integration and Solution Design", "Configuration and Knowledge Management", "Governance, Risk, and Responsible Use", "Troubleshooting and Optimization"],
  claude_certified_developer_foundations: ["Agents and Workflows", "Applications and Integration", "Claude Code", "Eval, Testing, and Debugging", "Model Selection and Optimization", "Prompt and Context Engineering", "Security and Safety", "Tools and MCPs"],
  claude_certified_architect_professional: ["Solution Design & Architecture", "Claude Models, Prompting & Context Engineering", "Integration", "Evaluation, Testing & Optimization", "Governance, Safety & Risk Management", "Stakeholder Communication & Lifecycle Management", "Developer Productivity & Operational Enablement"],
} as const;

const questions = allQuestions as Question[];

describe("banques d’examens blancs Anthropic refondues", () => {
  it("respecte les volumes et les domaines planifiés pour chaque certification", () => {
    for (const [certificationId, expectedCount] of Object.entries(targetCounts)) {
      const scoped = questions.filter((question) => question.certificationId === certificationId);
      expect(scoped).toHaveLength(expectedCount);
      expect(new Set(scoped.map((question) => question.domain))).toEqual(new Set(expectedDomains[certificationId as keyof typeof expectedDomains]));
    }
  });

  it("maintient une structure bilingue complète, quatre options et une seule meilleure réponse", () => {
    const ids = new Set<string>();
    for (const question of questions) {
      expect(ids.has(question.id)).toBe(false);
      ids.add(question.id);
      expect(question.question.en?.trim()).toBeTruthy();
      expect(question.question.fr?.trim()).toBeTruthy();
      expect(question.subdomain?.trim()).toBeTruthy();
      expect(question.objective?.trim()).toBeTruthy();
      expect(["foundational", "intermediate", "advanced"]).toContain(question.difficulty);
      expect(question.explanation.en?.trim()).toBeTruthy();
      expect(question.explanation.fr?.trim()).toBeTruthy();
      expect(question.choices).toHaveLength(4);
      expect(question.correctChoiceIds).toHaveLength(1);
      expect(question.choices.map((choice) => choice.id)).toEqual(["a", "b", "c", "d"]);
      expect(new Set(question.choices.map((choice) => choice.text.en.trim().toLocaleLowerCase("en"))).size).toBe(4);
      for (const choice of question.choices) {
        expect(choice.text.en?.trim()).toBeTruthy();
        expect(choice.text.fr?.trim()).toBeTruthy();
        expect(choice.rationale.en?.trim()).toBeTruthy();
        expect(choice.rationale.fr?.trim()).toBeTruthy();
        expect(choice.rationaleProvenance?.model).toBe("claude-sonnet-4-6");
      }
    }
  });

  it("trace les exemples autorisés et impose Claude Sonnet pour toutes les questions nouvellement rédigées", () => {
    const sampleQuestions = questions.filter((question) => question.sourceType === "user-provided-mock-sample");
    const generatedQuestions = questions.filter((question) => question.sourceType === "claude-sonnet-original");
    expect(sampleQuestions).toHaveLength(43);
    expect(generatedQuestions).toHaveLength(1232);
    expect(generatedQuestions.every((question) => question.version === "neopolis-original-2026-09-16")).toBe(true);
    expect(generatedQuestions.every((question) => question.question.en.length >= 140)).toBe(true);
    expect(JSON.stringify(generatedQuestions)).not.toMatch(/official exam question|real exam question|leaked exam question/i);
  });

  it("préserve les six familles scénarisées CCAR-F avec un volume robuste pour le tirage", () => {
    const ccarf = questions.filter((question) => question.certificationId === "claude_certified_architect_foundations");
    const counts = ccarf.filter((question) => question.scenarioFamily).reduce<Record<string, number>>((result, question) => ({
      ...result,
      [question.scenarioFamily as string]: (result[question.scenarioFamily as string] || 0) + 1,
    }), {});
    expect(counts).toEqual({
      research_coordination: 6,
      migration_control: 6,
      support_mcp: 6,
      code_rollout: 6,
      structured_intake: 6,
      long_context_review: 6,
    });
  });
});
