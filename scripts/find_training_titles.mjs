import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const query = (process.argv[2] ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase();
if (!query) throw new Error("Usage: node scripts/find_training_titles.mjs <terme>");

const normalize = (value) => String(value ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase();
const titles = (value) => typeof value === "string" ? [value] : Object.values(value ?? {}).filter((item) => typeof item === "string");
const matches = [];
const courseDir = "client/public/data/courses";

for (const filename of await readdir(courseDir)) {
  if (!filename.endsWith(".json")) continue;
  const content = JSON.parse(await readFile(join(courseDir, filename), "utf8"));
  const courseId = content.courseId ?? filename.replace(/\.json$/, "");
  for (const lesson of content.lessons ?? []) {
    for (const chapter of lesson.chapters ?? []) {
      const candidateTitles = titles(chapter.title);
      if (candidateTitles.some((title) => normalize(title).includes(query))) {
        matches.push({ source: filename, courseId, lessonId: lesson.id, chapterId: chapter.id, titles: candidateTitles });
      }
    }
  }
}

const index = JSON.parse(await readFile("client/src/data/trainingIndex.json", "utf8"));
for (const course of index.courses ?? []) {
  const candidateTitles = titles(course.title);
  if (candidateTitles.some((title) => normalize(title).includes(query))) {
    matches.push({ source: "trainingIndex.json", courseId: course.id, lessonId: null, chapterId: null, titles: candidateTitles });
  }
}

console.log(JSON.stringify(matches, null, 2));
