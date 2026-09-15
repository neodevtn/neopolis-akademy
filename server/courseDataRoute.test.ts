import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { getCourseDataDirectory, isValidCourseDataId, readCourseDataAsset } from "./courseDataRoute";

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
    expect(getCourseDataDirectory("production")).toContain(path.join("public", "data", "courses"));
  });
});
