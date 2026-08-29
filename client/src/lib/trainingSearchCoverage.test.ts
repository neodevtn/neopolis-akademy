import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import catalog from "../data/trainingIndex.json";
import searchIndex from "../../public/data/training-search-index.json";
import { searchTrainingContent } from "./trainingSearch";

type SearchEntry = { id: string; kind: "certification" | "course" | "chapter"; title: string; href: string; keywords: string[] };

const entries = searchIndex as SearchEntry[];
const root = process.cwd();
const courseSourceDirectory = path.join(root, "client/public/data/courses");
const sourceCourseIds = fs.readdirSync(courseSourceDirectory).filter((name) => name.endsWith(".json")).map((name) => path.basename(name, ".json"));
const localize = (value: unknown): string => typeof value === "string" ? value : typeof value === "object" && value !== null ? String((value as { fr?: string; en?: string }).fr || (value as { en?: string }).en || "") : "";

describe("couverture de l’index de recherche des formations", () => {
  it("indexe exactement une entrée de cours exploitable pour chaque cours catalogue", () => {
    const catalogCourseIds = new Set(catalog.courses.map((course) => course.id));
    const courseEntries = entries.filter((entry) => entry.kind === "course");
    const courseEntryIds = courseEntries.map((entry) => entry.id.replace(/^course:/, ""));
    const missing = [...catalogCourseIds].filter((courseId) => !courseEntryIds.includes(courseId));
    const duplicates = courseEntryIds.filter((courseId, index) => courseEntryIds.indexOf(courseId) !== index);
    const orphaned = courseEntryIds.filter((courseId) => !catalogCourseIds.has(courseId));

    expect(missing).toEqual([]);
    expect(duplicates).toEqual([]);
    expect(orphaned).toEqual([]);
    expect(courseEntries.every((entry) => Boolean(entry.title) && Boolean(entry.href) && entry.keywords.length > 0)).toBe(true);
  });

  it("indexe tous les chapitres réellement présents dans les fichiers de cours catalogue", () => {
    const catalogCourseIds = new Set(catalog.courses.map((course) => course.id));
    const expectedChapterIds: string[] = [];
    for (const courseId of sourceCourseIds.filter((id) => catalogCourseIds.has(id))) {
      const course = JSON.parse(fs.readFileSync(path.join(courseSourceDirectory, `${courseId}.json`), "utf8"));
      for (const [lessonIndex, lesson] of (course.lessons || []).entries()) {
        for (const [chapterIndex] of (lesson.chapters || []).entries()) expectedChapterIds.push(`chapter:${courseId}:${lessonIndex}:${chapterIndex}`);
      }
    }
    const indexedChapterIds = new Set(entries.filter((entry) => entry.kind === "chapter").map((entry) => entry.id));
    expect(expectedChapterIds.filter((id) => !indexedChapterIds.has(id))).toEqual([]);
  });

  it("retrouve chaque cours catalogue lorsqu’un utilisateur recherche son titre public", () => {
    const missingFromTitleSearch = catalog.courses.flatMap((course) => {
      const title = localize(course.title || course.name);
      const results = searchTrainingContent(entries, title, { kind: "course", limit: 500 });
      return results.some((entry) => entry.id === `course:${course.id}`) ? [] : [`${course.id} (${title})`];
    });
    expect(missingFromTitleSearch).toEqual([]);
  });
});
