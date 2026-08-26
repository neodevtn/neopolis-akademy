import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const coursesDir = resolve("client/public/data/courses");
const indexPath = resolve("client/src/data/trainingIndex.json");
const outputJson = resolve("docs/ai_evaluation_readiness_2026-08-26.json");
const outputMd = resolve("docs/ai_evaluation_readiness_2026-08-26.md");
const index = JSON.parse(readFileSync(indexPath, "utf8"));
const courseMetaById = new Map((index.courses || []).map((course) => [course.id, course]));
const certificationMetaById = new Map((index.certifications || []).map((certification) => [certification.id, certification]));

const deterministicTypes = new Set([
  "knowledge_check", "single_choice_exercise", "multi_choice_exercise", "bucket_sort", "flip_cards",
  "matching", "checkpoint", "resource_review", "sequence_visual", "comparison", "comparison_panel",
]);
const sourceFreeResponseTypes = new Set(["ai_evaluation", "cloud_exercise", "exercise", "code_repl"]);

function text(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return String(value.fr || value.en || "");
  return "";
}

function hasExplicitRubric(block) {
  const rubric = Array.isArray(block.rubric) ? block.rubric : [];
  const hasCriteria = rubric.length > 0 && rubric.every((criterion) => text(criterion.label || criterion.name).trim());
  return hasCriteria && Number.isFinite(Number(block.passingScore)) && Number(block.passingScore) >= 0;
}

const records = [];
for (const filename of readdirSync(coursesDir).filter((name) => name.endsWith(".json")).sort()) {
  let course;
  try {
    course = JSON.parse(readFileSync(join(coursesDir, filename), "utf8"));
  } catch {
    continue;
  }
  const courseId = course.courseId || course.id || filename.replace(/\.json$/, "");
  const meta = courseMetaById.get(courseId) || {};
  const certification = certificationMetaById.get(meta.certId) || {};
  const rawProvider = String(course.sourceProvider || course.provider || meta.provider || "").toLowerCase();
  const certificationGroup = String(certification.group || "").toLowerCase();
  const isAnthropic = /anthropic|skilljar/.test(rawProvider) || /anthropic/.test(certificationGroup) || /^claude_certified_/.test(courseId);
  const isDataCamp = !isAnthropic && (/datacamp/.test(rawProvider) || (!rawProvider && Boolean(course.sourceCourseTitle)));
  const providerGroup = isAnthropic ? "Anthropic" : isDataCamp ? "DataCamp" : "Autres";
  let deterministic = 0;
  let freeCandidates = 0;
  let rubricReady = 0;
  const evidence = [];
  for (const [lessonIndex, lesson] of (course.lessons || []).entries()) {
    for (const [chapterIndex, chapter] of (lesson.chapters || []).entries()) {
      for (const block of chapter.blocks || []) {
        if (deterministicTypes.has(block?.type)) deterministic += 1;
        if (!sourceFreeResponseTypes.has(block?.type)) continue;
        freeCandidates += 1;
        const ready = block.type === "ai_evaluation" && hasExplicitRubric(block);
        if (ready) rubricReady += 1;
        evidence.push({
          lessonIndex,
          chapterIndex,
          blockId: block.id || null,
          type: block.type,
          title: text(block.title || block.prompt || chapter.title).slice(0, 160),
          explicitRubric: ready,
        });
      }
    }
  }
  records.push({
    courseId,
    title: text(course.title || meta.title),
    provider: providerGroup,
    deterministicInteractions: deterministic,
    freeResponseCandidates: freeCandidates,
    rubricReady,
    decision: rubricReady > 0 ? "Évaluation IA autorisable après revue pédagogique" : freeCandidates > 0 ? "Revue source manuelle requise — aucune activation automatique" : "Interactions déterministes uniquement",
    evidence,
  });
}

const providerOrder = ["Anthropic", "DataCamp"];
const byProvider = Object.fromEntries(providerOrder.map((provider) => [provider, records.filter((record) => record.provider === provider)]));
const summary = Object.fromEntries(providerOrder.map((provider) => {
  const providerRecords = byProvider[provider];
  return [provider, {
    courses: providerRecords.length,
    deterministicInteractions: providerRecords.reduce((sum, record) => sum + record.deterministicInteractions, 0),
    freeResponseCandidates: providerRecords.reduce((sum, record) => sum + record.freeResponseCandidates, 0),
    rubricReady: providerRecords.reduce((sum, record) => sum + record.rubricReady, 0),
  }];
}));

const payload = { generatedAt: new Date().toISOString(), summary, providers: byProvider };
writeFileSync(outputJson, `${JSON.stringify(payload, null, 2)}\n`);
const sections = providerOrder.map((provider) => {
  const rows = byProvider[provider].map((record) => `| \`${record.courseId}\` | ${record.title.replaceAll("|", "\\|")} | ${record.deterministicInteractions} | ${record.freeResponseCandidates} | ${record.rubricReady} | ${record.decision} |`).join("\n") || "| — | Aucun cours indexé | 0 | 0 | 0 | — |";
  return `## ${provider}\n\n| Cours | Titre | Interactions déterministes | Candidats réponse libre | Rubriques explicites | Décision |\n|---|---|---:|---:|---:|---|\n${rows}`;
});
writeFileSync(outputMd, `# Audit de préparation des évaluations IA\n\n> Généré le ${payload.generatedAt}. Cet inventaire ne crée aucune évaluation. Une activation est permise exclusivement lorsque la source fournit une rubrique explicite, un seuil et des éléments attendus ; les interactions déterministes restent locales.\n\n${sections.join("\n\n")}\n`);
console.log(`Audit IA généré : Anthropic ${summary.Anthropic.courses} cours, DataCamp ${summary.DataCamp.courses} cours.`);
