import { describe, expect, it } from "vitest";
import allQuestions from "./data/mockExamQuestions.json";
import { toLearnerExamQuestions, type ExamQuestion } from "./examDefinition";

type Localized = { en?: string; fr?: string };
type Question = ExamQuestion & {
  sourceType?: string;
  sourceQuestionId?: number;
  sourceVariantGroup?: string;
  version?: string;
  sourceRefs?: string[];
  question: Localized;
  choices: Array<{ id: string; text: Localized; rationale: Localized; rationaleProvenance?: { model?: string; method?: string }; translationProvenance?: { model?: string } }>;
};
const questions = allQuestions as Question[];
const counts = {
  claude_certified_architect_foundations: { partner: 480, original: 516, total: 996 },
  claude_certified_architect_professional: { partner: 456, original: 456, total: 912 },
  claude_certified_associate_foundations: { partner: 546, original: 546, total: 1092 },
  claude_certified_developer_foundations: { partner: 524, original: 524, total: 1048 },
} as const;
const expectedDomains = {
  claude_certified_architect_foundations: ["Agentic Architecture & Orchestration", "Tool Design & MCP Integration", "Claude Code Configuration & Workflows", "Prompt Engineering & Structured Output", "Context Management & Reliability"],
  claude_certified_architect_professional: ["Solution Design & Architecture", "Claude Models, Prompting & Context Engineering", "Evaluation, Testing & Optimization", "Governance, Safety & Risk Management", "Integration", "Stakeholder Communication & Lifecycle Management", "Developer Productivity & Operational Enablement"],
  claude_certified_associate_foundations: ["Prompting and Task Execution", "Output Evaluation and Validation", "Product and Model Selection", "Workflow Integration and Solution Design", "Configuration and Knowledge Management", "Governance, Risk, and Responsible Use", "Troubleshooting and Optimization"],
  claude_certified_developer_foundations: ["Agents and Workflows", "Applications and Integration", "Claude Code", "Eval, Testing, and Debugging", "Model Selection and Optimization", "Prompt and Context Engineering", "Security and Safety", "Tools and MCPs"],
} as const;

const anthro = questions.filter((question) => question.certificationId in counts);

describe("quatre banques d’examens blancs Anthropic / CertSafari", () => {
  it("remplace l’ancien CCAR-P par le lot partenaire complet et ses nouveaux compléments, sans ancien item facile", () => {
    const scoped = questions.filter((question) => question.certificationId === "claude_certified_architect_professional");
    expect(scoped).toHaveLength(912);
    expect(scoped.every((question) => question.id.startsWith("cs_ccar_p_") || question.id.startsWith("neo_ccar_p_"))).toBe(true);
  });
  it("remplace uniquement les anciennes banques Anthropic, avec traçabilité du partenaire et du complément original", () => {
    for (const [id, expected] of Object.entries(counts)) {
      const scoped = anthro.filter((question) => question.certificationId === id);
      expect(scoped).toHaveLength(expected.total);
      expect(scoped.filter((question) => question.sourceType === "certsafari-partner-practice")).toHaveLength(expected.partner);
      expect(scoped.filter((question) => question.sourceType === "neopolis-original")).toHaveLength(expected.original);
      expect(new Set(scoped.map((question) => question.domain))).toEqual(new Set(expectedDomains[id as keyof typeof expectedDomains]));
    }
  });

  it("préserve les clés simples ET multiples, les 4 à 8 options et la correction spécifique de chaque option en français et anglais", () => {
    const ids = new Set<string>();
    const multiByCert = new Map<string, number>();
    for (const q of anthro) {
      expect(ids.has(q.id)).toBe(false);
      ids.add(q.id);
      expect(q.question.en?.trim()).toBeTruthy();
      expect(q.question.fr?.trim()).toBeTruthy();
      expect(q.subdomain?.trim()).toBeTruthy();
      expect(q.choices.length).toBeGreaterThanOrEqual(4);
      expect(q.choices.length).toBeLessThanOrEqual(8);
      expect(q.choices.map((choice) => choice.id)).toEqual(q.choices.map((_, index) => String.fromCharCode(97 + index)));
      expect(new Set(q.correctChoiceIds).size).toBe(q.correctChoiceIds.length);
      expect(q.correctChoiceIds.length).toBeGreaterThanOrEqual(1);
      expect(q.correctChoiceIds.length).toBeLessThanOrEqual(q.choices.length);
      expect(q.correctChoiceIds.every((key) => q.choices.some((choice) => choice.id === key))).toBe(true);
      expect(new Set(q.choices.map((choice) => choice.text.en!.trim().toLowerCase())).size).toBe(q.choices.length);
      if (q.correctChoiceIds.length > 1) multiByCert.set(q.certificationId, (multiByCert.get(q.certificationId) || 0) + 1);
      for (const choice of q.choices) {
        for (const locale of ["en", "fr"] as const) {
          expect(choice.text[locale]?.trim()).toBeTruthy();
          expect(choice.rationale[locale]?.trim()).toBeTruthy();
        }
        expect(["claude-sonnet-4-6", "gpt-5-mini"]).toContain(choice.translationProvenance?.model);
        if (q.sourceType === "certsafari-partner-practice") {
          expect(choice.rationaleProvenance?.method).toBe("partner-supplied-verbatim");
        } else {
          expect(["claude-sonnet-4-6", "gpt-5"]).toContain(choice.rationaleProvenance?.model);
        }
      }
      if (q.sourceType === "neopolis-original" && q.choices[0]?.rationaleProvenance?.model === "gpt-5") {
        expect(q.sourceRefs).toHaveLength(1);
        expect(q.sourceRefs![0]).toMatch(/^https:\/\/(?:(?:code|platform)\.claude\.com\/docs\/en\/|support\.anthropic\.com\/en\/articles\/)/);
        expect(q.question.en).toMatch(/\b(?:Claude|Anthropic|MCP|Messages API|Agent SDK|Sonnet|Haiku|Opus)\b/i);
        for (const choice of q.choices) {
          const expectedPrefix = q.correctChoiceIds.includes(choice.id) ? "correct:" : "incorrect:";
          expect(choice.rationale.en.trim().toLowerCase().startsWith(expectedPrefix)).toBe(true);
        }
      }
    }
    expect(Object.fromEntries(multiByCert)).toEqual({
      claude_certified_associate_foundations: 114,
      claude_certified_architect_professional: 226,
      claude_certified_developer_foundations: 212,
    });
  });

  it("ne révèle jamais les clés et explications à l’apprenant pendant l’épreuve et indique le nombre exact de choix", () => {
    const multiple = anthro.find((question) => question.correctChoiceIds.length === 5)!;
    expect(multiple).toBeTruthy();
    const projected = toLearnerExamQuestions([multiple])[0];
    expect(projected.requiredSelections).toBe(5);
    expect(projected.choices.length).toBe(multiple.choices.length);
    expect(JSON.stringify(projected)).not.toMatch(/correctChoiceIds|rationale|explanation|sourceQuestionId/);
  });

  it("conserve 20 variantes partenaire Developer et les six scénarios originaux CCAR-F", () => {
    const variants = anthro.filter((q) => q.certificationId === "claude_certified_developer_foundations" && q.sourceType === "certsafari-partner-practice")
      .reduce<Record<string, number>>((acc, q) => ({ ...acc, [q.sourceVariantGroup!]: (acc[q.sourceVariantGroup!] || 0) + 1 }), {});
    expect(Object.values(variants).filter((count) => count === 2)).toHaveLength(20);
    const scenarios = anthro.filter((q) => q.certificationId === "claude_certified_architect_foundations" && q.scenarioFamily);
    expect(Object.values(scenarios.reduce<Record<string, number>>((acc, q) => ({ ...acc, [q.scenarioFamily!]: (acc[q.scenarioFamily!] || 0) + 1 }), {})).sort()).toEqual([6, 6, 6, 6, 6, 6]);
    expect(scenarios.every((q) => q.sourceType === "neopolis-original")).toBe(true);
  });
});
