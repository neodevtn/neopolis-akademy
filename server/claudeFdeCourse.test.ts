import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getBlockDef } from "../shared/blockRegistry";
import { validateStructuredCourse } from "../shared/contentStudio";
import { sanitizeCourseDataForLearner } from "./courseDataRoute";
import { getSensitiveExerciseAnswerKey } from "./sensitiveExerciseAnswerKeys";
import { getTekTekTrainingSources } from "./tektekIndex";

const root = path.resolve(import.meta.dirname, "..");
const coursesDir = path.join(root, "client", "public", "data", "courses");
const indexPath = path.join(root, "client", "src", "data", "trainingIndex.json");
const certId = "claude_forward_deployed_engineer";
const courseIds = ["claude_fde_delivery_methodology__01", "claude_fde_enterprise_adoption__01"] as const;
const sharedCourseIds = ["claude_101__01", "claude_code_101__01", "claude_code_in_action__01", "introduction_to_agent_skills__01", "introduction_to_claude_models__01", "introduction_to_subagents__01", "model_context_protocol_advanced_topics__01", "software_development_with_claude_code__01", "building_scalable_agentic_systems__01"] as const;
const expectedLessons: Record<(typeof courseIds)[number], number> = {
  claude_fde_delivery_methodology__01: 7,
  claude_fde_enterprise_adoption__01: 14,
};
const readJson = <T,>(file: string) => JSON.parse(fs.readFileSync(file, "utf8")) as T;
const readCourse = (courseId: string) => readJson<any>(path.join(coursesDir, `${courseId}.json`));

/** Contracts for the two FDE-only modules observed in the authenticated Skilljar path. */
describe("Claude Forward Deployed Engineer path", () => {
  it("registers a non-certifying learning path with its two exclusive and nine natively shared modules", () => {
    const index = readJson<any>(indexPath);
    const training = index.certifications.find((item: any) => item.id === certId);
    expect(training).toMatchObject({
      id: certId,
      trainingFormat: "formation",
      provider: "anthropic",
      sequentialCourseLocking: true,
      contentKind: "learning_path",
      certificationStatus: "non_certifying",
      assessmentPolicy: "none",
      credentialPolicy: "none",
      courses: [...courseIds, ...sharedCourseIds],
    });
    expect(training.catalogTag.en).toMatch(/enterprise adoption/i);
    expect(training.description.en).not.toMatch(/official certification/i);
    expect(training.companionCourses).toBeUndefined();
    for (const [indexInPath, sharedCourseId] of sharedCourseIds.entries()) {
      const sharedCourse = index.courses.find((course: any) => course.id === sharedCourseId);
      expect(sharedCourse.certId).not.toBe(certId);
      expect(sharedCourse.trainingMemberships).toContainEqual({ certificationId: certId, order: indexInPath + 3 });
    }
  });

  it("preserves the official source topology with 7 Delivery lessons and 14 Enterprise Adoption lessons", () => {
    for (const courseId of courseIds) {
      const course = readCourse(courseId);
      expect(course.courseId).toBe(courseId);
      expect(course.sourceProvider).toBe("Anthropic Partner Academy / Skilljar");
      expect(course.sourceCourseUrl).toMatch(/^https:\/\/anthropic-partners\.skilljar\.com\/path\/claude-fde\//);
      expect(course.integration.schemaVersion).toBe("neopolis.anthropic_fde.skilljar.v1");
      expect(course.integration.sourceMediaAudit.result).toMatch(/No source learning image, video, audio, iframe/i);
      expect(course.lessons).toHaveLength(expectedLessons[courseId]);
      expect(course.lessons.every((lesson: any) => lesson.chapters.length === 1)).toBe(true);
    }
  });

  it("uses only standard blocks, one screen per lesson, no media substitution, and one required server-validated check per screen", () => {
    for (const courseId of courseIds) {
      const course = readCourse(courseId);
      const validation = validateStructuredCourse(course);
      expect(validation.errors).toEqual([]);
      for (const lesson of course.lessons) {
        expect(lesson.recommendedVideos).toEqual([]);
        expect(lesson.recommendedVideosManaged).toBe(false);
        const [chapter] = lesson.chapters;
        expect(chapter.requiredBeforeAdvance).toBe(true);
        expect(chapter.blocks.filter((block: any) => block.type === "video")).toHaveLength(0);
        expect(chapter.blocks.map((block: any) => block.type)).toEqual(["content", "single_choice_exercise"]);
        expect(chapter.blocks.every((block: any) => getBlockDef(block.type))).toBe(true);
        const quiz = chapter.blocks[1];
        expect(chapter.completionRule).toEqual({ type: "exercise", exerciseId: quiz.exerciseId });
        expect(quiz.serverValidated).toBe(true);
        expect(quiz.completionRequiresCorrectAnswer).toBe(true);
        expect(quiz.options).toHaveLength(4);
        expect(new Set(quiz.options.map((option: any) => option.id)).size).toBe(4);
        expect(getSensitiveExerciseAnswerKey(courseId, quiz.exerciseId)).toEqual({ correctAnswer: quiz.correctAnswer, explanation: quiz.explanation });
      }
    }
  });

  it("keeps answer keys private in the learner projection and makes the full content available to TekTek", () => {
    for (const courseId of courseIds) {
      const raw = fs.readFileSync(path.join(coursesDir, `${courseId}.json`), "utf8");
      const learner = sanitizeCourseDataForLearner(raw);
      expect(learner).not.toContain('"correctAnswer"');
      expect(learner).not.toContain('"explanation"');
    }
    const tektek = getTekTekTrainingSources(certId, "fr");
    expect(tektek?.courseIds).toEqual(new Set([...courseIds, ...sharedCourseIds]));
    expect(tektek?.sources.some((source) => source.courseId === courseIds[0] && /qualifier/i.test(source.text))).toBe(true);
    expect(tektek?.sources.some((source) => source.courseId === courseIds[1] && /activation/i.test(source.text))).toBe(true);
  });
});
