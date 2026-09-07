import { describe, expect, it } from "vitest";
import { toLearnerExamQuestions, toLearnerExamReview, type ExamQuestion } from "./examDefinition";

const question: ExamQuestion = {
  id: "q1",
  certificationId: "cert",
  domain: "Fondamentaux",
  question: "Question",
  choices: [{ id: "a", text: "A" }, { id: "b", text: "B" }],
  correctChoiceIds: ["a", "b"],
  explanation: "Explication",
};

describe("projections d’examen apprenant", () => {
  it("ne révèle pas les corrections avant soumission et fournit seulement le nombre de choix requis", () => {
    expect(toLearnerExamQuestions([question])).toEqual([{
      id: "q1", certificationId: "cert", domain: "Fondamentaux", question: "Question",
      choices: [{ id: "a", text: "A" }, { id: "b", text: "B" }], requiredSelections: 2,
    }]);
  });

  it("révèle la correction seulement dans la projection de revue après validation", () => {
    expect(toLearnerExamReview([question])[0]).toMatchObject({ correctChoiceIds: ["a", "b"], explanation: "Explication" });
  });
});
