import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalog = JSON.parse(fs.readFileSync(path.join(root, "client/src/data/trainingIndex.json"), "utf8"));
const text = (value) => typeof value === "string" ? value : value?.fr || value?.en || "";
const roles = (course) => String(course.targetJob || "").split(",").map((role) => role.trim()).filter(Boolean);

const groups = new Map();
for (const certification of catalog.certifications || []) {
  const key = certification.group || "sans-categorie";
  const list = groups.get(key) || [];
  list.push(certification);
  groups.set(key, list);
}

const report = Array.from(groups.entries()).map(([groupId, certifications]) => {
  const ids = new Set(certifications.map((item) => item.id));
  const courses = (catalog.courses || []).filter((course) => ids.has(course.certId));
  const bySubcategory = new Map();
  for (const course of courses) {
    const key = course.subCategoryId || "sans-sous-categorie";
    const list = bySubcategory.get(key) || [];
    list.push(course);
    bySubcategory.set(key, list);
  }
  return {
    groupId,
    certificationCount: certifications.length,
    courseCount: courses.length,
    examples: certifications.slice(0, 6).map((item) => ({ id: item.id, title: text(item.title) })),
    roles: Array.from(new Set(courses.flatMap(roles))).sort((a, b) => a.localeCompare(b, "fr")),
    subcategories: Array.from(bySubcategory.entries()).map(([id, entries]) => ({
      id,
      courseCount: entries.length,
      roles: Array.from(new Set(entries.flatMap(roles))).sort((a, b) => a.localeCompare(b, "fr")),
      examples: entries.slice(0, 5).map((course) => ({ id: course.id, certificationId: course.certId, title: text(course.title), skills: (course.acquiredSkills || []).slice(0, 4) })),
    })),
  };
});

console.log(JSON.stringify({ catalogRevision: catalog.catalogRevision, certificationCount: catalog.certifications?.length || 0, courseCount: catalog.courses?.length || 0, groups: report }, null, 2));
