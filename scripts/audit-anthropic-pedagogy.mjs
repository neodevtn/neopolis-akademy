import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const coursesDir = resolve("client/public/data/courses");
const index = JSON.parse(readFileSync(resolve("client/src/data/trainingIndex.json"), "utf8"));
const courseMeta = new Map((index.courses || []).map((course) => [course.id, course]));
const certMeta = new Map((index.certifications || []).map((certification) => [certification.id, certification]));
const outputJson = resolve("docs/anthropic_pedagogical_audit_2026-08-26.json");
const outputMd = resolve("docs/anthropic_pedagogical_audit_2026-08-26.md");
const directionalInstructionPattern = /\b(on the (?:left|right)(?:\s+(?:side|panel|column))?|(?:left|right)[ -]hand(?:\s+(?:side|panel|column))?|à (?:gauche|droite)|dans (?:la|le) (?:colonne|panneau) (?:gauche|droit(?:e)?)|côté (?:gauche|droit(?:e)?))\b/i;

function text(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return [value.fr, value.en].filter(Boolean).join("\n");
  return "";
}

function collectStrings(value, values = []) {
  if (typeof value === "string") values.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, values));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, values));
  return values;
}

const records = [];
for (const filename of readdirSync(coursesDir).filter((name) => name.endsWith(".json")).sort()) {
  let course;
  try { course = JSON.parse(readFileSync(join(coursesDir, filename), "utf8")); } catch { continue; }
  const courseId = course.courseId || filename.replace(/\.json$/, "");
  const meta = courseMeta.get(courseId) || {};
  const certification = certMeta.get(meta.certId) || {};
  const isAnthropic = /^claude_certified_/.test(courseId) || /anthropic/.test(String(certification.group || ""));
  if (!isAnthropic) continue;
  const blockTypes = new Map();
  const structuralTitles = [];
  const directionReferences = [];
  const legacyTypes = [];
  for (const lesson of course.lessons || []) {
    for (const chapter of lesson.chapters || []) {
      const chapterTitle = text(chapter.title);
      if (/module introduction|module complete|key takeaways|introduction du module|module terminé|points clés/i.test(chapterTitle)) structuralTitles.push(chapterTitle);
      const strings = collectStrings(chapter);
      for (const value of strings) {
        if (directionalInstructionPattern.test(value)) directionReferences.push(value.slice(0, 180));
      }
      for (const block of chapter.blocks || []) {
        blockTypes.set(block.type || "unknown", (blockTypes.get(block.type || "unknown") || 0) + 1);
        if (/^(inline_|unit_)/.test(block.type || "")) legacyTypes.push(block.type);
      }
    }
  }
  records.push({
    courseId,
    certificationId: meta.certId || null,
    title: text(meta.title || course.sourceCourseTitle),
    chapters: (course.lessons || []).reduce((sum, lesson) => sum + (lesson.chapters || []).length, 0),
    blockTypes: Object.fromEntries([...blockTypes.entries()].sort(([a], [b]) => a.localeCompare(b))),
    structuralTitles: [...new Set(structuralTitles)],
    directionReferenceCount: directionReferences.length,
    directionReferences: [...new Set(directionReferences)].slice(0, 8),
    legacyTypes: [...new Set(legacyTypes)],
  });
}

const summary = {
  courses: records.length,
  chapters: records.reduce((sum, record) => sum + record.chapters, 0),
  legacyBlocks: records.reduce((sum, record) => sum + record.legacyTypes.length, 0),
  coursesWithDirectionalInstructions: records.filter((record) => record.directionReferenceCount > 0).length,
};
writeFileSync(outputJson, `${JSON.stringify({ generatedAt: new Date().toISOString(), summary, records }, null, 2)}\n`);
const rows = records.map((record) => `| \`${record.courseId}\` | ${record.chapters} | ${Object.keys(record.blockTypes).length} | ${record.legacyTypes.length || "—"} | ${record.directionReferenceCount} | ${record.structuralTitles.length} |`).join("\n");
writeFileSync(outputMd, `# Audit pédagogique Anthropic\n\n> Inventaire statique généré le ${new Date().toISOString()}. Les références directionnelles sont des signaux à examiner dans le contexte ; elles ne déclenchent aucune réécriture automatique.\n\n| Cours | Écrans | Familles de blocs | Types historiques | Références gauche/droite | Libellés structurels |\n|---|---:|---:|---:|---:|---:|\n${rows}\n\n## Synthèse\n\n- Cours audités : **${summary.courses}**.\n- Écrans audités : **${summary.chapters}**.\n- Cours contenant un signal directionnel : **${summary.coursesWithDirectionalInstructions}**.\n- Types de blocs historiques détectés : **${summary.legacyBlocks}**.\n`);
console.log(`Audit Anthropic généré : ${summary.courses} cours, ${summary.chapters} écrans, ${summary.coursesWithDirectionalInstructions} cours à revue directionnelle.`);
