import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const coursePath = path.join(projectRoot, "client/public/data/courses/claude_certified_architect_foundations__01.json");
const developerCoursePath = path.join(projectRoot, "client/public/data/courses/claude_certified_developer_foundations__02.json");
const indexPath = path.join(projectRoot, "client/src/data/trainingIndex.json");

describe("cohérence des parcours Anthropic", () => {
  it("rend l’exercice officiel AI Fluency validable avant de poursuivre", () => {
    const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
    const lesson = course.lessons.find((item: any) => item.title?.en === "Introduction to AI Fluency");
    const chapter = lesson.chapters.find((item: any) => item.title?.en === "Exercise: Introduction to AI Fluency");
    const checkpoint = chapter.blocks.find((block: any) => block.id === "checkpoint_ai_fluency_intro_reflection");
    const exercise = course.exercises.find((item: any) => item.id === checkpoint.exerciseId);

    expect(chapter.completionRule.requires).toContain("requiredExercisesPassed");
    expect(checkpoint.exerciseId).toBe("ex_ai_fluency_intro_reflection");
    expect(exercise.interactionType).toBe("free_text");
    expect(exercise.required).toBe(true);
    expect(exercise.inputSchema.minWords).toBe(50);
  });

  it("expose des totaux synchronisés pour les quatre certifications Anthropic", () => {
    const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    const certifications = index.certifications.filter((item: any) => String(item.id).startsWith("claude_certified_"));

    expect(certifications).toHaveLength(4);
    for (const certification of certifications) {
      const courses = index.courses.filter((course: any) => course.certId === certification.id);
      expect(certification.courseCount).toBe(courses.length);
      expect(certification.totalLessons).toBe(courses.reduce((sum: number, course: any) => sum + course.lessonCount, 0));
      expect(certification.totalExercises).toBe(courses.reduce((sum: number, course: any) => sum + course.exerciseCount, 0));
      expect(certification.totalVideos).toBe(courses.reduce((sum: number, course: any) => sum + course.videoCount, 0));
      expect(certification.totalDownloads).toBe(courses.reduce((sum: number, course: any) => sum + course.downloadCount, 0));
    }
  });

  it("distingue les préparations aux certifications officielles Anthropic du titre de certification lui-même", () => {
    const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    const category = index.categories.find((item: any) => item.id === "anthropic_certification_preparation");
    const certifications = index.certifications.filter((item: any) => String(item.id).startsWith("claude_certified_"));

    expect(category?.title?.fr).toMatch(/Préparations aux certifications officielles Anthropic/);
    expect(certifications).toHaveLength(4);
    for (const certification of certifications) {
      expect(certification.group).toBe("anthropic_certification_preparation");
      expect(certification.catalogTag?.fr).toMatch(/Préparation à une certification officielle Anthropic/);
      expect(certification.description?.fr).toMatch(/préparation à l’examen de certification officielle Anthropic/i);
    }
  });

  it("emploie des consignes indépendantes de la position pour les interactions responsives Developer", () => {
    const course = JSON.parse(fs.readFileSync(developerCoursePath, "utf8"));
    const lesson = course.lessons.find((item: any) => item.id === "lesson_01");
    const memoryChapter = lesson.chapters.find((item: any) => item.id === "chapter_13");
    const memoryCheckpoint = memoryChapter.blocks.find((block: any) => block.id === "checkpoint_7_memory_patterns");
    const extendedThinking = course.exercises.find((item: any) => item.id === "ex_claude_certified_developer_foundations__02_005");

    expect(memoryCheckpoint.instructions.en).not.toMatch(/on the left|on the right/i);
    expect(memoryCheckpoint.instructions.fr).not.toMatch(/à gauche|à droite/i);
    expect(extendedThinking.prompt.en).not.toMatch(/CheckpointExtended|this\.Leave/i);
    expect(extendedThinking.prompt.fr).not.toMatch(/à gauche|à droite/i);
  });
});
