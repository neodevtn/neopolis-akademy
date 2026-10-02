import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import allQuestions from "./data/mockExamQuestions.json";

const root = resolve(import.meta.dirname, "..");
const certificationId = "claude_certified_architect_foundations";
const allowedMethods = new Set([
  "partner-supplied-verbatim",
  "original-question-authoring",
]);

describe("provenance des questions Architect Foundations", () => {
  it("distingue les corrections partenaire des explications originales générées avec Manus ou Claude", () => {
    const questions = (allQuestions as Array<{ certificationId: string; id: string; sourceType?: string; choices: Array<{ id: string; rationaleProvenance?: { model?: string; method?: string }; translationProvenance?: { model?: string } }> }>)
      .filter((question) => question.certificationId === certificationId);
    const invalid = questions.flatMap((question) => question.choices
      .filter((choice) => !allowedMethods.has(choice.rationaleProvenance?.method || "")
        || !["claude-sonnet-4-6", "gpt-5-mini"].includes(choice.translationProvenance?.model || "")
        || (question.sourceType === "neopolis-original" && !["claude-sonnet-4-6", "gpt-5"].includes(choice.rationaleProvenance?.model || ""))
        || (question.sourceType === "certsafari-partner-practice" && Boolean(choice.rationaleProvenance?.model)))
      .map((choice) => `${question.id}:${choice.id}`));

    expect(questions).toHaveLength(996);
    expect(invalid).toEqual([]);
  });

  it("configure TekTek et le générateur CCAR-F sur un modèle Claude sans référence de modèle non-Claude", async () => {
    const [tektekRouter, rationaleGenerator] = await Promise.all([
      readFile(resolve(root, "server/tektekRouter.ts"), "utf8"),
      readFile(resolve(root, "scripts/generate-ccarf-authored-rationales.mjs"), "utf8"),
    ]);

    expect(tektekRouter).toContain('model: "claude-sonnet-4-6"');
    expect(rationaleGenerator).toContain('const model = "claude-sonnet-4-6"');
    expect(tektekRouter).not.toMatch(/model:\s*["'](?:gpt|gemini)-/i);
    expect(rationaleGenerator).not.toMatch(/model:\s*["'](?:gpt|gemini)-/i);
  });
});
