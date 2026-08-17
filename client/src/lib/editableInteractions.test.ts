import { describe, expect, it } from "vitest";
import { resolveEditableInteractions } from "./editableInteractions";

describe("resolveEditableInteractions", () => {
  const course = {
    courseId: "course_demo",
    lessons: [{ chapters: [{ blocks: [
      { id: "sort_1", type: "bucket_sort", title: { fr: "Tri" } },
      { id: "checkpoint_1", type: "checkpoint", exerciseId: "exercise_used" },
    ] }] }],
    exercises: [
      { id: "exercise_used", interactionType: "free_text", title: { fr: "Exercice visible" }, chapterId: "chapter_0" },
      { id: "exercise_orphan", interactionType: "free_text", title: { fr: "Exercice non rendu" }, chapterId: "chapter_0" },
    ],
  };

  it("returns chapter blocks, the referenced checkpoint exercise and the chapter quiz questions", () => {
    const result = resolveEditableInteractions({
      course,
      lessonIndex: 0,
      chapterIndex: 0,
      lessonQuizzes: { course_demo: { "0_0": [{ id: "q1", question: { fr: "Question affichée" }, choices: [] }] } },
    });
    expect(result.map((entry) => [entry.source, entry.id])).toEqual([
      ["chapter_block", "sort_1"],
      ["checkpoint_exercise", "exercise_used"],
      ["chapter_quiz", "q1"],
    ]);
  });

  it("does not expose a legacy exercise only because it shares a chapter label", () => {
    const result = resolveEditableInteractions({ course, lessonIndex: 0, chapterIndex: 0, lessonQuizzes: {} });
    expect(result.some((entry) => entry.id === "exercise_orphan")).toBe(false);
  });

  it("uses the legacy chapter key only when no lesson-qualified quiz key exists", () => {
    const result = resolveEditableInteractions({
      course,
      lessonIndex: 0,
      chapterIndex: 0,
      lessonQuizzes: { course_demo: { "0": [{ id: "fallback", question: "Fallback" }] } },
    });
    expect(result.find((entry) => entry.id === "fallback")?.sourceKey).toBe("0");
  });

  it("uses the course identifier supplied by the editor when a draft has no courseId", () => {
    const draftWithoutCourseId = { ...course, courseId: undefined };
    const result = resolveEditableInteractions({
      course: draftWithoutCourseId,
      courseId: "course_demo",
      lessonIndex: 0,
      chapterIndex: 0,
      lessonQuizzes: { course_demo: { "0_0": [{ id: "draft_q", question: "Question du brouillon" }] } },
    });
    expect(result.find((entry) => entry.id === "draft_q")?.sourceKey).toBe("0_0");
  });
});
