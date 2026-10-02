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

describe("provenance Claude du lot Architect Foundations", () => {
  it("distingue la correction fournie par le partenaire des explications originales Claude Sonnet", () => {
    const questions = (allQuestions as Array<{ certificationId: string; id: string; sourceType?: string; choices: Array<{ id: string; rationaleProvenance?: { model?: string; method?: string }; translationProvenance?: { model?: string } }> }>)
      .filter((question) => question.certificationId === certificationId);
    const invalid = questions.flatMap((question) => question.choices
      .filter((choice) => !allowedMethods.has(choice.rationaleProvenance?.method || "")
        || choice.translationProvenance?.model !== "claude-sonnet-4-6"
        || (question.sourceType === "claude-sonnet-original" && choice.rationaleProvenance?.model !== "claude-sonnet-4-6")
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
