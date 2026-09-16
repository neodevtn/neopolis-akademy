import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import allQuestions from "./data/mockExamQuestions.json";
import { toLearnerExamQuestions } from "./examDefinition";

describe("projection apprenant d’examen", () => {
  it("retire les réponses correctes et explications avant tout envoi au navigateur", () => {
    const [question] = toLearnerExamQuestions([{
      id: "question_test", certificationId: "certification_test", domain: "Fondamentaux", question: "Question ?",
      choices: [{ id: "a", text: "A" }, { id: "b", text: "B" }],
      correctChoiceIds: ["a"], explanation: "Correction réservée au serveur",
    }]);
    expect(question).toEqual({ id: "question_test", certificationId: "certification_test", domain: "Fondamentaux", question: "Question ?", choices: [{ id: "a", text: "A" }, { id: "b", text: "B" }], requiredSelections: 1 });
    expect(JSON.stringify(question)).not.toContain("correctChoiceIds");
    expect(JSON.stringify(question)).not.toContain("Correction réservée");
  });

  it("conserve la banque de questions hors des fichiers statiques servis au navigateur", () => {
    const projectRoot = path.resolve(import.meta.dirname, "..");
    expect(fs.existsSync(path.join(projectRoot, "server/data/mockExamQuestions.json"))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, "client/public/data/mockExamQuestions.json"))).toBe(false);
    expect(fs.existsSync(path.join(projectRoot, "client/public/data/examConfigurations.json"))).toBe(false);
  });

  it("retire également les métadonnées et rationales des nouvelles questions Anthropic avant soumission", () => {
    const source = (allQuestions as Array<Record<string, unknown>>).find((question) => question.certificationId === "claude_certified_architect_foundations");
    expect(source).toBeTruthy();
    const learnerQuestion = toLearnerExamQuestions([source as any])[0];
    const serialized = JSON.stringify(learnerQuestion);
    expect(serialized).not.toContain("correctChoiceIds");
    expect(serialized).not.toContain("rationale");
    expect(serialized).not.toContain("explanation");
    expect(serialized).not.toContain("sourcePedagogique");
    expect(serialized).not.toContain("sourceType");
  });
});
