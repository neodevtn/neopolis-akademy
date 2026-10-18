import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { findServerValidatedChoiceKey, getSensitiveExerciseAnswerKey } from "./sensitiveExerciseAnswerKeys";
import { sanitizeCourseDataForLearner } from "./courseDataRoute";
import { HostedMediaLearningSupport, localizedMediaText, shouldUseProjector } from "../client/src/components/HostedMediaLearningSupport";

const quiz = { type: "single_choice_exercise", id: "q1", serverValidated: true,
  question: { fr: "Que faut-il observer dans ce cas ?", en: "What should be observed in this case?" },
  options: [{ id: "a", text: "A" }, { id: "b", text: "B" }], correctAnswer: "b",
  explanation: { fr: "Cette explication est privée jusqu’à la soumission.", en: "This explanation is private until submission." } };
const course = (blocks: any[]) => ({ courseId: "demo", lessons: [{ chapters: [{ blocks }] }] });

describe("expert course editing: server-validated knowledge checks", () => {
  it("resolves a new standard quiz without a hardcoded course whitelist", () => {
    expect(findServerValidatedChoiceKey(course([quiz]), "q1")).toEqual({ correctAnswer: "b", explanation: quiz.explanation });
  });
  it("fails closed for missing, ambiguous, invalid or non-server-validated keys", () => {
    expect(findServerValidatedChoiceKey(course([]), "q1")).toBeNull();
    expect(findServerValidatedChoiceKey(course([quiz, quiz]), "q1")).toBeNull();
    expect(findServerValidatedChoiceKey(course([{ ...quiz, correctAnswer: "z" }]), "q1")).toBeNull();
    expect(findServerValidatedChoiceKey(course([{ ...quiz, serverValidated: false }]), "q1")).toBeNull();
    expect(findServerValidatedChoiceKey(course([{ ...quiz, options: [{ id: "a" }, { id: "a" }] }]), "q1")).toBeNull();
  });
  it("keeps the question accessible but never sends the key or rationale before submission", () => {
    const projected = JSON.parse(sanitizeCourseDataForLearner(JSON.stringify(course([quiz]))));
    const safeQuiz = projected.lessons[0].chapters[0].blocks[0];
    expect(safeQuiz.question).toEqual(quiz.question);
    expect(safeQuiz.serverValidated).toBe(true);
    expect(safeQuiz.correctAnswer).toBeUndefined();
    expect(safeQuiz.explanation).toBeUndefined();
  });

  it("can grade every knowledge check introduced by the expert correction batch", () => {
    const root = path.resolve(import.meta.dirname, "..");
    const report = JSON.parse(readFileSync(path.join(root, "pedagogical-audit/15-expert-p1-corrections-2026-10-18.json"), "utf8"));
    expect(report.new_quizzes.length).toBeGreaterThan(0);
    for (const item of report.new_quizzes) {
      const source = JSON.parse(readFileSync(path.join(root, `client/public/data/courses/${item.course_id}.json`), "utf8"));
      const block = source.lessons.flatMap((lesson: any) => lesson.chapters).flatMap((chapter: any) => chapter.blocks).find((entry: any) => entry.id === item.id);
      expect(getSensitiveExerciseAnswerKey(item.course_id, item.id), `${item.course_id}/${item.id}`).toEqual({ correctAnswer: block.correctAnswer, explanation: block.explanation });
    }
  });
});

describe("expert course editing: hosted media support", () => {
  it("respects explicit real-video selection despite legacy slide metadata", () => {
    const legacy = { projectorSlides: [{ type: "TitleSlide" }], projectorTimings: [] };
    expect(shouldUseProjector(legacy)).toBe(true);
    expect(shouldUseProjector({ ...legacy, sourceType: "video" })).toBe(false);
    expect(shouldUseProjector({ ...legacy, sourceType: "hls" })).toBe(false);
    expect(shouldUseProjector({ projectorSlides: [] })).toBe(false);
  });
  it("selects actual localized strings", () => {
    expect(localizedMediaText({ fr: "Objectif", en: "Objective" }, "fr")).toBe("Objectif");
    expect(localizedMediaText({ en: "Objective" }, "ar")).toBe("Objective");
  });
  it("renders the French alternative on hosted media without relabeling an English audio track", () => {
    const block = { videoLanguage: "en", durationSeconds: 75, objectiveBefore: { fr: "Observer la séquence", en: "Observe the sequence" }, alternativeTextFr: "Le contenu français explique ici la séquence illustrée." };
    const htmlFr = renderToStaticMarkup(React.createElement(HostedMediaLearningSupport, { block, lang: "fr" }));
    expect(htmlFr).toContain("English");
    expect(htmlFr).toContain("1:15");
    expect(htmlFr).toContain("Observer la séquence");
    expect(htmlFr).toContain("Alternative textuelle française");
    const htmlEn = renderToStaticMarkup(React.createElement(HostedMediaLearningSupport, { block, lang: "en" }));
    expect(htmlEn).toContain("Observe the sequence");
    expect(htmlEn).not.toContain("Alternative textuelle française");
  });
});
