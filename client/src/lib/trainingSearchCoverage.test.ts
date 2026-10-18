import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import catalog from "../data/trainingIndex.json";
import searchIndex from "../../public/data/training-search-index.json";
import { searchTrainingContent } from "./trainingSearch";
import { getCoursesForTraining } from "@shared/courseTrainingMembership";

type SearchEntry = { id: string; kind: "certification" | "course" | "chapter"; title: string; href: string; keywords: string[] };

const entries = searchIndex as SearchEntry[];
const root = process.cwd();
const courseSourceDirectory = path.join(root, "client/public/data/courses");
const sourceCourseIds = fs.readdirSync(courseSourceDirectory).filter((name) => name.endsWith(".json")).map((name) => path.basename(name, ".json"));
const localize = (value: unknown): string => typeof value === "string" ? value : typeof value === "object" && value !== null ? String((value as { fr?: string; en?: string }).fr || (value as { en?: string }).en || "") : "";

describe("couverture de l’index de recherche des formations", () => {
  it("indexe exactement une entrée de cours exploitable par contexte de formation", () => {
    const expectedIds = catalog.certifications.flatMap((training) => getCoursesForTraining(catalog.courses as any[], training.id).map((course) => `course:${training.id}:${course.id}`));
    const courseEntries = entries.filter((entry) => entry.kind === "course");
    const indexedIds = courseEntries.map((entry) => entry.id);
    expect(expectedIds.filter((id) => !indexedIds.includes(id))).toEqual([]);
    expect(indexedIds.filter((id, index) => indexedIds.indexOf(id) !== index)).toEqual([]);
    expect(indexedIds.filter((id) => !expectedIds.includes(id))).toEqual([]);
    expect(courseEntries.every((entry) => Boolean(entry.title) && Boolean(entry.href) && entry.keywords.length > 0)).toBe(true);
  });

  it("indexe tous les chapitres réellement présents dans les fichiers de cours catalogue", () => {
    const expectedChapterIds: string[] = [];
    for (const training of catalog.certifications) for (const courseRef of getCoursesForTraining(catalog.courses as any[], training.id)) {
      if (!sourceCourseIds.includes(courseRef.id)) continue;
      const course = JSON.parse(fs.readFileSync(path.join(courseSourceDirectory, `${courseRef.id}.json`), "utf8"));
      for (const [lessonIndex, lesson] of (course.lessons || []).entries()) for (const [chapterIndex] of (lesson.chapters || []).entries()) expectedChapterIds.push(`chapter:${training.id}:${courseRef.id}:${lessonIndex}:${chapterIndex}`);
    }
    const indexedChapterIds = new Set(entries.filter((entry) => entry.kind === "chapter").map((entry) => entry.id));
    expect(expectedChapterIds.filter((id) => !indexedChapterIds.has(id))).toEqual([]);
  });

  it("retrouve chaque cours catalogue lorsqu’un utilisateur recherche son titre public", () => {
    const missingFromTitleSearch = catalog.certifications.flatMap((training) => getCoursesForTraining(catalog.courses as any[], training.id).flatMap((course) => {
      const title = localize(course.title || course.name);
      const results = searchTrainingContent(entries, title, { kind: "course", limit: 500 });
      return results.some((entry) => entry.id === `course:${training.id}:${course.id}`) ? [] : [`${training.id}/${course.id} (${title})`];
    }));
    expect(missingFromTitleSearch).toEqual([]);
  });
});
