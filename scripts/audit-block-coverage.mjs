import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve("client/public/data/courses");
const outputJson = resolve("docs/block_qa_coverage_2026-08-25.json");
const outputMd = resolve("docs/block_qa_coverage_2026-08-25.md");
const records = new Map();

function stableRank(value) {
  return [...value].reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 7);
}

for (const filename of readdirSync(root).filter((name) => name.endsWith(".json")).sort()) {
  let course;
  try {
    course = JSON.parse(readFileSync(join(root, filename), "utf8"));
  } catch {
    continue;
  }
  for (const [lessonIndex, lesson] of (course.lessons || []).entries()) {
    for (const [chapterIndex, chapter] of (lesson.chapters || []).entries()) {
      for (const block of chapter.blocks || []) {
        if (!block?.type) continue;
        const sample = {
          courseId: course.id || filename.replace(/\.json$/, ""),
          filename,
          sourceProvider: course.sourceProvider || course.provider || "Neopolis",
          sourceCourseUrl: course.sourceCourseUrl || course.sourceUrl || null,
          lessonIndex,
          chapterIndex,
          blockId: block.id || null,
          title: typeof chapter.title === "string" ? chapter.title : chapter.title?.fr || chapter.title?.en || "",
          required: Boolean(chapter.requiredBeforeAdvance || block.required),
        };
        const bucket = records.get(block.type) || [];
        bucket.push(sample);
        records.set(block.type, bucket);
      }
    }
  }
}

const inventory = [...records.entries()]
  .map(([type, occurrences]) => ({
    type,
    occurrences: occurrences.length,
    courses: new Set(occurrences.map((item) => item.courseId)).size,
    samples: (() => {
      const selected = [];
      const seenScreens = new Set();
      for (const sample of [...occurrences].sort((a, b) => stableRank(`${a.courseId}:${a.lessonIndex}:${a.chapterIndex}:${type}`) - stableRank(`${b.courseId}:${b.lessonIndex}:${b.chapterIndex}:${type}`))) {
        const screenKey = `${sample.courseId}:${sample.lessonIndex}:${sample.chapterIndex}`;
        if (seenScreens.has(screenKey)) continue;
        seenScreens.add(screenKey);
        selected.push(sample);
        if (selected.length === 3) break;
      }
      return selected;
    })(),
  }))
  .sort((a, b) => b.occurrences - a.occurrences || a.type.localeCompare(b.type));

writeFileSync(outputJson, `${JSON.stringify({ generatedAt: new Date().toISOString(), blockTypes: inventory }, null, 2)}\n`);
const rows = inventory.map((entry) => {
  const samples = entry.samples.map((sample) => `\`${sample.courseId}\` L${sample.lessonIndex + 1}/E${sample.chapterIndex + 1}${sample.required ? " · requis" : ""}<br><small>${sample.sourceProvider}${sample.sourceCourseUrl ? " · source disponible" : " · cohérence interne"}</small>`).join("<br>");
  return `| \`${entry.type}\` | ${entry.occurrences} | ${entry.courses} | ${samples} |`;
});
writeFileSync(outputMd, `# Couverture QA des blocs pédagogiques\n\nCette matrice est générée à partir des JSON publiés. Chaque ligne propose jusqu’à trois écrans sélectionnés par un rang déterministe, pour produire une couverture stable et reproductible des types de blocs.\n\n| Type de bloc | Occurrences | Cours | Écrans de contrôle représentatifs |\n|---|---:|---:|---|\n${rows.join("\n")}\n`);
console.log(`Audit generated: ${inventory.length} block types in ${outputJson}`);
