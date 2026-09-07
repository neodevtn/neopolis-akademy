import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { toLearnerExamQuestions } from "./examDefinition";

describe("projection apprenant d’examen", () => {
  it("retire les réponses correctes et explications avant tout envoi au navigateur", () => {
    const [question] = toLearnerExamQuestions([{
      id: "question_test", certificationId: "certification_test", domain: "Fondamentaux", question: "Question ?",
      choices: [{ id: "a", text: "A" }, { id: "b", text: "B" }],
      correctChoiceIds: ["a"], explanation: "Correction réservée au serveur",
    }]);
    expect(question).toEqual({ id: "question_test", certificationId: "certification_test", domain: "Fondamentaux", question: "Question ?", choices: [{ id: "a", text: "A" }, { id: "b", text: "B" }] });
    expect(JSON.stringify(question)).not.toContain("correctChoiceIds");
    expect(JSON.stringify(question)).not.toContain("Correction réservée");
  });

  it("conserve la banque de questions hors des fichiers statiques servis au navigateur", () => {
    const projectRoot = path.resolve(import.meta.dirname, "..");
    expect(fs.existsSync(path.join(projectRoot, "server/data/mockExamQuestions.json"))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, "client/public/data/mockExamQuestions.json"))).toBe(false);
    expect(fs.existsSync(path.join(projectRoot, "client/public/data/examConfigurations.json"))).toBe(false);
  });
});
