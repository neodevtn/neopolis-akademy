import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { getCourseDataDirectories, getCourseDataDirectory, isValidCourseDataId, readCourseDataAsset, sanitizeCourseDataForLearner } from "./courseDataRoute";
import { getSensitiveExerciseAnswerKey } from "./sensitiveExerciseAnswerKeys";

const temporaryDirectories: string[] = [];

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

  it("uses a subsequent build directory when the first candidate is unavailable", async () => {
    const emptyDirectory = await mkdtemp(path.join(os.tmpdir(), "course-data-empty-"));
    const validDirectory = await mkdtemp(path.join(os.tmpdir(), "course-data-valid-"));
    temporaryDirectories.push(emptyDirectory, validDirectory);
    await writeFile(path.join(validDirectory, "course_02.json"), '{"lessons":[{"id":"chapter"}]}');

    await expect(readCourseDataAsset("course_02", [emptyDirectory, validDirectory])).resolves.toBe('{"lessons":[{"id":"chapter"}]}');
  });

  it("masks any accidental sensitive single-choice answer from learner data", () => {
    const raw = JSON.stringify({
      lessons: [{ chapters: [{ blocks: [{
        id: "server_checked_choice",
        type: "single_choice_exercise",
        serverValidated: true,
        correctAnswer: "b",
        explanation: { en: "Server explanation", fr: "Explication serveur" },
      }, {
        id: "standard_choice",
        type: "single_choice_exercise",
        correctAnswer: "a",
      }] }] }],
    });

    const learnerData = JSON.parse(sanitizeCourseDataForLearner(raw));
    expect(learnerData.lessons[0].chapters[0].blocks[0]).toMatchObject({ id: "server_checked_choice", serverValidated: true });
    expect(learnerData.lessons[0].chapters[0].blocks[0]).not.toHaveProperty("correctAnswer");
    expect(learnerData.lessons[0].chapters[0].blocks[0]).not.toHaveProperty("explanation");
    expect(learnerData.lessons[0].chapters[0].blocks[1].correctAnswer).toBe("a");
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
