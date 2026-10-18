import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import express from "express";
import { afterEach, describe, expect, it } from "vitest";
import { COURSE_DATA_ROUTE_PATHS, getCourseDataDirectories, getCourseDataDirectory, isValidCourseDataId, readCourseDataAsset, registerCourseDataRoute, sanitizeCourseDataForLearner } from "./courseDataRoute";
import { getSensitiveExerciseAnswerKey } from "./sensitiveExerciseAnswerKeys";

const temporaryDirectories: string[] = [];
const courseDataDirectory = path.resolve(import.meta.dirname, "..", "client", "public", "data", "courses");

function normalizeKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function isLeakedCorrectionKey(key: string): boolean {
  const normalized = normalizeKey(key);
  return normalized === "answer" || normalized === "answers"
    || normalized.startsWith("correct")
    || normalized.startsWith("answerkey")
    || normalized.startsWith("solution")
    || normalized.startsWith("correction")
    || normalized.startsWith("sampleanswer")
    || normalized.startsWith("modelanswer")
    || normalized.startsWith("expectedanswer")
    || normalized.startsWith("expectedvalue")
    || normalized.startsWith("expectedevidence")
    || normalized.startsWith("expectedoutput")
    || normalized.startsWith("expectedresult")
    || normalized.startsWith("expectedresponse")
    || normalized.startsWith("explanation")
    || normalized.startsWith("feedback")
    || normalized.startsWith("rationale")
    || normalized.startsWith("rubric")
    || normalized.startsWith("evaluation")
    || normalized.startsWith("grading");
}

function findLeakedCorrectionKeys(value: unknown, pathPrefix = "$"): string[] {
  if (Array.isArray(value)) return value.flatMap((item, index) => findLeakedCorrectionKeys(item, `${pathPrefix}[${index}]`));
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nestedValue]) => [
    ...(isLeakedCorrectionKey(key) ? [`${pathPrefix}.${key}`] : []),
    ...findLeakedCorrectionKeys(nestedValue, `${pathPrefix}.${key}`),
  ]);
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(directory => rm(directory, { recursive: true, force: true })));
});

describe("course data route", () => {
  it("accepts only stable course identifiers", () => {
    expect(isValidCourseDataId("claude_certified_associate_foundations__04")).toBe(true);
    expect(isValidCourseDataId("../../secrets")).toBe(false);
    expect(isValidCourseDataId("course name")).toBe(false);
  });

  it("reads valid JSON only from the requested course asset", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "course-data-"));
    temporaryDirectories.push(directory);
    await writeFile(path.join(directory, "course_01.json"), '{"lessons":[]}');
    await writeFile(path.join(directory, "invalid_01.json"), "not-json");

    await expect(readCourseDataAsset("course_01", directory)).resolves.toBe('{"lessons":[]}');
    await expect(readCourseDataAsset("invalid_01", directory)).resolves.toBeNull();
    await expect(readCourseDataAsset("../../course_01", directory)).resolves.toBeNull();
  });

  it("resolves the development and production roots used by the build", () => {
    expect(getCourseDataDirectory("development")).toContain(path.join("client", "public", "data", "courses"));
    expect(getCourseDataDirectories("production", "/application")).toContain(path.join("/application", "dist", "public", "data", "courses"));
  });

  it("intercepts both the API URL and the legacy public asset URL before static serving", () => {
    expect(COURSE_DATA_ROUTE_PATHS).toEqual([
      "/api/trpc/course-data/:courseId",
      "/data/courses/:courseId.json",
    ]);
  });

  it("uses a subsequent build directory when the first candidate is unavailable", async () => {
    const emptyDirectory = await mkdtemp(path.join(os.tmpdir(), "course-data-empty-"));
    const validDirectory = await mkdtemp(path.join(os.tmpdir(), "course-data-valid-"));
    temporaryDirectories.push(emptyDirectory, validDirectory);
    await writeFile(path.join(validDirectory, "course_02.json"), '{"lessons":[{"id":"chapter"}]}');

    await expect(readCourseDataAsset("course_02", [emptyDirectory, validDirectory])).resolves.toBe('{"lessons":[{"id":"chapter"}]}');
  });

  it("removes recursively every correction-key convention while retaining rendering metadata", () => {
    const raw = JSON.stringify({
      courseId: "projection_fixture",
      datacampImport: { expected: { courseCount: 1 } },
      lessons: [{ chapters: [{ blocks: [{
        id: "nested_answers",
        type: "single_choice_exercise",
        serverValidated: true,
        completionRequiresCorrectAnswer: true,
        minimumAnswerLength: 12,
        correctAnswer: "b",
        correct_answer: "b",
        correct_option: "b",
        correct_option_index: 1,
        correctOptionIds: ["b"],
        answerKey: { selected: "b" },
        answer_key: "b",
        solution: "Server-only solution",
        correction: { fr: "Correction privée" },
        explanation: { en: "Server explanation", fr: "Explication serveur" },
        feedback: { fr: "Feedback à retourner seulement après soumission" },
        nested: {
          model_answer: "nested model answer",
          rubricCriteria: [{ expectedEvidence: "nested expected evidence" }],
          options: [{ id: "a", correct: false }, { id: "b", correct: true }],
        },
      }] }] }],
      exercises: [{
        id: "legacy_checkpoint",
        serverCorrectionRequired: true,
        completionRequiresCorrectAnswer: true,
        prompt: { fr: "Question visible" },
        correction: { fr: "Correction privée" },
        options: [{ id: "a", correct: true }, { id: "b", correct: false }],
      }],
    });

    const learnerData = JSON.parse(sanitizeCourseDataForLearner(raw));
    const learnerBlock = learnerData.lessons[0].chapters[0].blocks[0];
    expect(findLeakedCorrectionKeys(learnerData)).toEqual([]);
    expect(learnerBlock).toMatchObject({
      id: "nested_answers",
      type: "single_choice_exercise",
      serverValidated: true,
      completionRequiresCorrectAnswer: true,
      minimumAnswerLength: 12,
      nested: { options: [{ id: "a" }, { id: "b" }] },
    });
    expect(learnerData.exercises[0]).toMatchObject({
      id: "legacy_checkpoint",
      serverCorrectionRequired: true,
      completionRequiresCorrectAnswer: true,
      prompt: { fr: "Question visible" },
      options: [{ id: "a" }, { id: "b" }],
    });
    expect(learnerData.datacampImport).toEqual({ expected: { courseCount: 1 } });
  });

  it("sanitizes all 180 course assets without changing their learner-visible structure", async () => {
    const filenames = (await readdir(courseDataDirectory)).filter(filename => filename.endsWith(".json")).sort();
    expect(filenames).toHaveLength(180);

    for (const filename of filenames) {
      const raw = await readFile(path.join(courseDataDirectory, filename), "utf8");
      const source = JSON.parse(raw);
      const learner = JSON.parse(sanitizeCourseDataForLearner(raw));
      expect(findLeakedCorrectionKeys(learner), filename).toEqual([]);
      expect(learner.courseId, filename).toBe(source.courseId);
      expect(learner.lessons, filename).toHaveLength(source.lessons.length);
      expect(learner.lessons[0]?.chapters?.length, filename).toBe(source.lessons[0]?.chapters?.length);
    }
  });

  it("serves the legacy public course URL through the sanitized projection", async () => {
    const app = express();
    registerCourseDataRoute(app);
    const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
      const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    try {
      const courseId = "advanced_ai_assisted_coding_for_developers__01";
      const raw = await readFile(path.join(courseDataDirectory, `${courseId}.json`), "utf8");
      expect(raw).toContain('"correctAnswer"');
      const port = (server.address() as AddressInfo).port;
      const response = await fetch(`http://127.0.0.1:${port}/data/courses/${courseId}.json`);
      const learner = await response.json();
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
      expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
      expect(findLeakedCorrectionKeys(learner)).toEqual([]);
      expect(learner.courseId).toBe(courseId);
      expect(learner.lessons).toHaveLength(JSON.parse(raw).lessons.length);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it("keeps the Developer 3 sensitive answer key in the server-only registry", () => {
    expect(getSensitiveExerciseAnswerKey("claude_certified_developer_foundations__03", "checkpoint4_fix_plugin_definition")).toMatchObject({
      correctAnswer: "b",
      explanation: { fr: expect.stringContaining("${CLAUDE_PLUGIN_ROOT}") },
    });
    expect(getSensitiveExerciseAnswerKey("claude_certified_developer_foundations__03", "unknown_choice")).toBeNull();
  });

  it("keeps the Enterprise Integration answer key in the server-only registry", () => {
    expect(getSensitiveExerciseAnswerKey("claude_certified_developer_foundations__03", "checkpoint_s17_enterprise_integration")).toMatchObject({
      correctAnswer: "b",
      explanation: { fr: expect.stringContaining("variable d’environnement") },
    });
  });

  it("keeps the two Skilljar requirements answer keys in the server-only registry", () => {
    expect(getSensitiveExerciseAnswerKey("claude_certified_developer_foundations__05", "skilljar_s07b_q1")).toMatchObject({
      correctAnswer: "b",
      explanation: { fr: expect.stringContaining("exigence fonctionnelle") },
    });
    expect(getSensitiveExerciseAnswerKey("claude_certified_developer_foundations__05", "skilljar_s07b_q2")).toMatchObject({
      correctAnswer: "c",
      explanation: { fr: expect.stringContaining("résidence des données") },
    });
    expect(getSensitiveExerciseAnswerKey("claude_certified_developer_foundations__05", "unknown_choice")).toBeNull();
  });
});
