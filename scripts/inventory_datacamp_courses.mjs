import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const coursesDirectory = path.join(root, "client", "public", "data", "courses");
const outputPath = path.join(root, "docs", "datacamp-course-inventory-2026-09-17.json");

const courses = fs.readdirSync(coursesDirectory)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .flatMap((fileName) => {
    const relativePath = path.join("client", "public", "data", "courses", fileName);
    const course = JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
    if (course.datacampImport?.sourceProvider !== "DataCamp") return [];

    const chapters = (course.lessons ?? []).flatMap((lesson) => lesson.chapters ?? []);
    const blocks = chapters.flatMap((chapter) => chapter.blocks ?? []);
    return [{
      courseId: course.courseId,
      fileName,
      relativePath,
      title: course.title?.fr ?? course.title?.en ?? course.title ?? course.courseId,
      sourceUrl: course.datacampImport?.sourceUrl ?? course.datacampImport?.sourceCourseUrl ?? null,
      lessons: course.lessons?.length ?? 0,
      chapters: chapters.length,
      practicalBlocks: blocks.filter((block) => block.type === "cloud_exercise").length,
      checkpoints: blocks.filter((block) => ["checkpoint", "single_choice_exercise", "multi_choice_exercise", "knowledge_check"].includes(block.type)).length,
      blocks: blocks.length,
    }];
  });

fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), count: courses.length, courses }, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, count: courses.length, courseIds: courses.map((course) => course.courseId) }, null, 2));
