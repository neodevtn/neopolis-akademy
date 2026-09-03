import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalog = JSON.parse(fs.readFileSync(path.join(root, "client/src/data/trainingIndex.json"), "utf8"));
const localize = (value) => typeof value === "string" ? value : value?.fr || value?.en || "";
const asNumber = (value) => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;

const categories = (catalog.categories ?? []).map((category) => {
  const certifications = (catalog.certifications ?? []).filter((certification) => certification.group === category.id);
  const certificationIds = new Set(certifications.map((certification) => certification.id));
  const courses = (catalog.courses ?? []).filter((course) => certificationIds.has(course.certId));
  const roles = Array.from(new Set(courses.flatMap((course) => String(course.targetJob || "").split(",").map((role) => role.trim()).filter(Boolean)))).sort((a, b) => a.localeCompare(b, "fr"));
  const totals = courses.reduce((summary, course) => ({
    courseCount: summary.courseCount + 1,
    lessonCount: summary.lessonCount + asNumber(course.lessonCount),
    chapterCount: summary.chapterCount + asNumber(course.chapterCount),
    activityCount: summary.activityCount + (asNumber(course.totalActivities) || asNumber(course.chapterCount)),
    exerciseCount: summary.exerciseCount + asNumber(course.exerciseCount),
    videoCount: summary.videoCount + asNumber(course.videoCount),
  }), { courseCount: 0, lessonCount: 0, chapterCount: 0, activityCount: 0, exerciseCount: 0, videoCount: 0 });

  return {
    id: category.id,
    title: localize(category.title),
    subcategories: (category.subcategories ?? []).map((subcategory) => ({ id: subcategory.id, title: localize(subcategory.title) })),
    certificationCount: certifications.length,
    roles,
    ...totals,
  };
});

console.log(JSON.stringify({
  catalogRevision: catalog.catalogRevision,
  certifications: (catalog.certifications ?? []).length,
  courses: (catalog.courses ?? []).length,
  categories,
}, null, 2));
