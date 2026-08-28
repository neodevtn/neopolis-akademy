import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const course = JSON.parse(fs.readFileSync(path.resolve("client/public/data/courses/working_with_the_openai_api__01.json"), "utf8"));
const activities = course.lessons.flatMap((lesson: { chapters?: unknown[] }) => lesson.chapters ?? []) as Array<Record<string, unknown>>;
const text = JSON.stringify(activities);

describe("Travailler avec l’API OpenAI", () => {
  it("conserve les vingt-neuf activités canoniques sans gamification ni DataLab visible", () => {
    expect(activities).toHaveLength(29);
    expect(text).not.toMatch(/XP quotidiens|datacamp\.com\/datalab/i);
  });
});
