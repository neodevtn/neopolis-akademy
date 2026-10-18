import course from "../client/public/data/courses/innovating_with_google_cloud_ai__01.json";
import { describe, expect, it } from "vitest";

const text = (value: unknown) => typeof value === "string" ? value : (value as { fr?: string; en?: string } | undefined)?.fr || (value as { en?: string } | undefined)?.en || "";

describe("cours DataCamp Innover avec Google Cloud AI", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("publie les QCM vérifiables et rend non bloquants les anciens écrans visuels", () => {
    const quizzes = blocks.filter((block: any) => block.type === "single_choice_exercise");
    const practicalTypes = new Set(["cloud_exercise", "code_repl", "ai_evaluation", "free_text_exercise", "terminal_sim"]);

    expect(activities).toHaveLength(23);
    expect(quizzes).toHaveLength(12);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "VisualExercise").every((activity: any) => activity.requiredBeforeAdvance === false)).toBe(true);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "PureMultipleChoiceExercise").every((activity: any) => activity.requiredBeforeAdvance === true)).toBe(true);
    expect(quizzes.every((quiz: any) =>
      quiz.options?.length >= 2
      && quiz.options.some((option: any) => option.id === quiz.correctAnswer)
      && text(quiz.explanation).trim().length > 20,
    )).toBe(true);
    expect(blocks.some((block: any) => practicalTypes.has(block.type))).toBe(false);
    expect(JSON.stringify(course)).not.toMatch(/datacamp\.com|\/manus-storage\//i);
  });
});
