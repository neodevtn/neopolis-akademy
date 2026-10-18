import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "client/src/data/trainingIndex.json");
const coursesDir = path.join(root, "client/public/data/courses");
const outputPath = path.join(root, "client/public/data/training-search-index.json");
const catalog = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const localize = (value, locale = "fr") => typeof value === "string" ? value : value?.[locale] || value?.fr || value?.en || "";
const cleanSnippet = (value) => String(value || "").replace(/```[\s\S]*?```/g, " ").replace(/[#*_`>|]/g, " ").replace(/\s+/g, " ").trim().slice(0, 240);
const formatById = new Map((catalog.trainingFormats || []).map((format) => [format.id, format]));
const entries = [];
const toKeywords = (...values) => values.flatMap((value) => Array.isArray(value) ? value : [value])
  .flatMap((value) => typeof value === "object" && value !== null ? Object.values(value) : [value])
  .filter((value) => typeof value === "string" && value.trim().length > 0);
const belongsToTraining = (course, trainingId) => course.certId === trainingId || (Array.isArray(course.trainingMemberships) && course.trainingMemberships.some((entry) => entry?.certificationId === trainingId));
const orderInTraining = (course, trainingId) => course.certId === trainingId ? Number(course.order) || Number.MAX_SAFE_INTEGER : Number((course.trainingMemberships || []).find((entry) => entry?.certificationId === trainingId)?.order) || Number.MAX_SAFE_INTEGER;
const coursesForTraining = (trainingId) => catalog.courses.filter((course) => belongsToTraining(course, trainingId)).sort((a, b) => orderInTraining(a, trainingId) - orderInTraining(b, trainingId) || a.id.localeCompare(b.id));

for (const training of catalog.certifications) {
  const trainingFormat = formatById.get(training.trainingFormat);
  entries.push({
    id: `training:${training.id}`,
    kind: "training",
    title: localize(training.title),
    subtitle: localize(training.description),
    keywords: toKeywords(training.id, training.group, training.trainingFormat, trainingFormat?.title, localize(training.level), localize(training.title, "en"), localize(training.description, "en"), (training.subcategories || []).map((item) => item.title)),
    group: training.group,
    certId: training.id,
    href: `/training/${training.id}`,
  });
  for (const course of coursesForTraining(training.id)) {
    const courseTitle = localize(course.title || course.name);
    entries.push({
      id: `course:${training.id}:${course.id}`,
      kind: "course",
      title: courseTitle,
      subtitle: localize(course.description),
      keywords: toKeywords(course.id, training.id, course.certId, training.group, training.trainingFormat, trainingFormat?.title, course.subCategory, course.subCategoryId, course.tags, course.targetJob, course.tools, course.acquiredSkills, localize(course.title || course.name, "en"), localize(course.description, "en")),
      group: training.group,
      certId: training.id,
      href: `/training/${training.id}/${course.id}`,
    });
    const sourcePath = path.join(coursesDir, `${course.id}.json`);
    if (!fs.existsSync(sourcePath)) continue;
    const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
    for (const [lessonIndex, lesson] of (source.lessons || []).entries()) {
      const lessonTitle = localize(lesson.title);
      for (const [chapterIndex, chapter] of (lesson.chapters || []).entries()) {
        const chapterTitle = localize(chapter.title);
        const firstText = (chapter.blocks || []).find((block) => block?.body)?.body;
        entries.push({
          id: `chapter:${training.id}:${course.id}:${lessonIndex}:${chapterIndex}`,
          kind: "chapter",
          title: chapterTitle || lessonTitle || courseTitle,
          subtitle: lessonTitle || courseTitle,
          snippet: cleanSnippet(localize(firstText)),
          keywords: toKeywords(courseTitle, lessonTitle, chapter.id, chapter.type, training.trainingFormat, trainingFormat?.title, course.subCategory, course.tags, course.targetJob, course.tools, course.acquiredSkills, localize(chapter.title, "en"), localize(lesson.title, "en")),
          group: training.group,
          certId: training.id,
          href: `/training/${training.id}/${course.id}?lesson=${lessonIndex}&chapter=${chapterIndex}`,
        });
      }
    }
  }
}

fs.writeFileSync(outputPath, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`Generated ${entries.length} searchable training entries at ${path.relative(root, outputPath)}.`);
