import course from "../client/public/data/courses/innovating_with_google_cloud_ai__01.json";
import { describe, expect, it } from "vitest";
import { getSensitiveExerciseAnswerKey } from "./sensitiveExerciseAnswerKeys";

const text = (value: unknown) => typeof value === "string" ? value : (value as { fr?: string; en?: string } | undefined)?.fr || (value as { en?: string } | undefined)?.en || "";
const localizedText = (value: unknown, locale: "fr" | "en") => typeof value === "string"
  ? value
  : (value as { fr?: string; en?: string } | undefined)?.[locale] || "";

function expectServerCorrectedLocalizedQuestion(quiz: any) {
  expect(quiz.serverValidated).toBe(true);
  expect(quiz.options).toHaveLength(4);
  expect(quiz.options.map((option: any) => option.id)).toContain(quiz.correctAnswer);
  for (const locale of ["fr", "en"] as const) {
    expect(localizedText(quiz.question, locale).trim().length).toBeGreaterThan(20);
    expect(localizedText(quiz.explanation, locale).trim().length).toBeGreaterThan(20);
    const optionTexts = quiz.options.map((option: any) => localizedText(option.text, locale).trim());
    expect(optionTexts.every(Boolean)).toBe(true);
    expect(new Set(optionTexts).size).toBe(optionTexts.length);
  }
}

describe("cours DataCamp Innover avec Google Cloud AI", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("publie quatorze QCM localisés et corrigibles, dont les deux nouveaux contrôles de transfert", () => {
    const quizzes = blocks.filter((block: any) => block.type === "single_choice_exercise");
    const practicalTypes = new Set(["cloud_exercise", "code_repl", "ai_evaluation", "free_text_exercise", "terminal_sim"]);
    const visualActivities = activities.filter((activity: any) => activity.sourceActivityType === "VisualExercise");
    const renderedVisualQuizzes = visualActivities.flatMap((activity: any) => activity.blocks || [])
      .filter((block: any) => block.type === "single_choice_exercise");

    expect(activities).toHaveLength(23);
    expect(quizzes).toHaveLength(14);
    quizzes.forEach(expectServerCorrectedLocalizedQuestion);
    quizzes.forEach((quiz: any) => {
      expect(getSensitiveExerciseAnswerKey(course.courseId, quiz.id)).toEqual({
        correctAnswer: quiz.correctAnswer,
        explanation: quiz.explanation,
      });
    });
    expect(renderedVisualQuizzes.map((quiz: any) => quiz.id)).toEqual([
      "neopolis_innovating_with_google_cloud_ai__01_summary_decision_quiz",
      "neopolis_innovating_with_google_cloud_ai__01_study_guide_decision_quiz",
    ]);

    expect(visualActivities).toHaveLength(11);
    visualActivities.forEach((activity: any) => {
      const contentBlocks = (activity.blocks || []).filter((block: any) => block.type === "content");
      expect(contentBlocks.length).toBeGreaterThan(0);
      contentBlocks.forEach((block: any) => {
        expect(localizedText(block.content || block.body, "fr").trim().length).toBeGreaterThan(80);
        expect(localizedText(block.content || block.body, "en").trim().length).toBeGreaterThan(80);
      });
      expect(JSON.stringify(activity)).not.toMatch(/optionalMediaUnavailable/i);
    });

    // The gate policy follows delivered submit-able activities, not the former source-type flags.
    const requiredActivityIds = activities.filter((activity: any) => activity.requiredBeforeAdvance === true).map((activity: any) => activity.id);
    expect(requiredActivityIds).toEqual([
      "dc_ch01_act06", "dc_ch01_act07", "dc_ch01_act08", "dc_ch01_act09", "dc_ch01_act10", "dc_ch01_act11",
      "dc_ch02_act05", "dc_ch02_act06", "dc_ch02_act07", "dc_ch02_act08", "dc_ch02_act09", "dc_ch02_act10",
    ]);
    activities.filter((activity: any) => activity.requiredBeforeAdvance === true).forEach((activity: any) => {
      expect((activity.blocks || []).every((block: any) => block.type === "single_choice_exercise" && block.serverValidated === true)).toBe(true);
    });
    expect(blocks.some((block: any) => practicalTypes.has(block.type))).toBe(false);
    expect(JSON.stringify(course)).not.toMatch(/datacamp\.com|\/manus-storage\//i);
  });
});
