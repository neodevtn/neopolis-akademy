import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "client/src/data/trainingIndex.json");
const coursesDir = path.join(root, "client/public/data/courses");
const outputPath = path.join(root, "client/public/data/training-search-index.json");
const catalog = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const localize = (value, locale = "fr") => typeof value === "string" ? value : value?.[locale] || value?.fr || value?.en || "";
const cleanSnippet = (value) => String(value || "")
  .replace(/```[\s\S]*?```/g, " ")
  .replace(/[#*_`>|]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, 240);

const certById = new Map(catalog.certifications.map((cert) => [cert.id, cert]));
const formatById = new Map((catalog.trainingFormats || []).map((format) => [format.id, format]));
const entries = [];
const toKeywords = (...values) => values.flatMap((value) => Array.isArray(value) ? value : [value])
  .flatMap((value) => typeof value === "object" && value !== null ? Object.values(value) : [value])
  .filter((value) => typeof value === "string" && value.trim().length > 0);

for (const cert of catalog.certifications) {
  const trainingFormat = formatById.get(cert.trainingFormat);
  entries.push({
    id: `certification:${cert.id}`,
    kind: "certification",
    title: localize(cert.title),
    subtitle: localize(cert.description),
    keywords: toKeywords(cert.id, cert.group, cert.trainingFormat, trainingFormat?.title, localize(cert.level), localize(cert.title, "en"), localize(cert.description, "en"), (cert.subcategories || []).map((item) => item.title)),
    group: cert.group,
    certId: cert.id,
    href: `/training/${cert.id}`,
  });
}

for (const course of catalog.courses) {
  const cert = certById.get(course.certId);
  const trainingFormat = formatById.get(cert?.trainingFormat);
  const courseTitle = localize(course.title || course.name);
  entries.push({
    id: `course:${course.id}`,
    kind: "course",
    title: courseTitle,
    subtitle: localize(course.description),
    keywords: toKeywords(course.id, course.certId, cert?.group, cert?.trainingFormat, trainingFormat?.title, course.subCategory, course.subCategoryId, course.tags, course.targetJob, course.tools, course.acquiredSkills, localize(course.title || course.name, "en"), localize(course.description, "en")),
    group: cert?.group,
    certId: course.certId,
    href: `/training/${course.certId}/${course.id}`,
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
        id: `chapter:${course.id}:${lessonIndex}:${chapterIndex}`,
        kind: "chapter",
        title: chapterTitle || lessonTitle || courseTitle,
        subtitle: lessonTitle || courseTitle,
        snippet: cleanSnippet(localize(firstText)),
        keywords: toKeywords(courseTitle, lessonTitle, chapter.id, chapter.type, cert?.trainingFormat, trainingFormat?.title, course.subCategory, course.tags, course.targetJob, course.tools, course.acquiredSkills, localize(chapter.title, "en"), localize(lesson.title, "en")),
        group: cert?.group,
        certId: course.certId,
        href: `/training/${course.certId}/${course.id}?lesson=${lessonIndex}&chapter=${chapterIndex}`,
      });
    }
  }
}

fs.writeFileSync(outputPath, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`Generated ${entries.length} searchable training entries at ${path.relative(root, outputPath)}.`);
