import { describe, expect, it } from "vitest";
import { DEFAULT_EXAM_CONFIGURATION } from "@shared/examConfiguration";
import { buildExamLearnerPreviewModel } from "./examLearnerPreviewModel";

describe("buildExamLearnerPreviewModel", () => {
  it("signale qu’une banque vide ne peut pas être présentée comme un examen", () => {
    const preview = buildExamLearnerPreviewModel({ ...DEFAULT_EXAM_CONFIGURATION, isPublished: true, totalQuestions: 10 }, 0);
    expect(preview).toMatchObject({ state: "needs_questions", displayedQuestionCount: 0 });
  });

  it("identifie un examen non publié sans prétendre qu’il est accessible", () => {
    const preview = buildExamLearnerPreviewModel({ ...DEFAULT_EXAM_CONFIGURATION, isPublished: false, totalQuestions: 10 }, 12);
    expect(preview).toMatchObject({ state: "draft", displayedQuestionCount: 10 });
  });

  it("borne le nombre affiché à la taille réelle de la banque publiée", () => {
    const preview = buildExamLearnerPreviewModel({ ...DEFAULT_EXAM_CONFIGURATION, isPublished: true, totalQuestions: 20 }, 8);
    expect(preview).toMatchObject({ state: "ready", displayedQuestionCount: 8 });
  });
});
