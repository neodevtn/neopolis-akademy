import fs from "node:fs";

const coursePath = "client/public/data/courses/ai_for_finance__01.json";
const outputPath = "docs/ai_for_finance_tp_readiness_2026-08-28.json";
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const forbidden = /DataCamp\s*(VM|Lab|Campus|Workspace)|cloud\s+lab|https?:\/\/|\b\d+\s*XP\b|<\/?(?:strong|em|p|br|li|ul|span|div|details|summary)\b/i;
const textOf = (value) => typeof value === "string" ? value : JSON.stringify(value ?? "");

const tps = course.lessons.flatMap((lesson) => (lesson.chapters ?? [])
  .flatMap((chapter) => (chapter.blocks ?? []).map((block) => ({ lessonId: lesson.id, chapterId: chapter.id, chapterTitle: chapter.title, block }))))
  .filter(({ block }) => block.type === "cloud_exercise");

const checks = tps.map(({ lessonId, chapterId, chapterTitle, block }) => {
  const rubric = {
    criteria: block.rubricCriteria,
    maxScore: block.maxScore,
    passingScore: block.passingScore,
    rubricVersion: block.rubricVersion,
  };
  const strings = [block.title, block.assignment, block.instructions, block.evaluationPrompt, block.solution, block.hint, rubric]
    .map(textOf)
    .join("\n");
  return {
    lessonId,
    chapterId,
    title: chapterTitle?.fr ?? chapterTitle?.en ?? chapterTitle ?? "",
    blockId: block.id,
    criteriaCount: Array.isArray(rubric?.criteria) ? rubric.criteria.length : 0,
    maxScore: rubric?.maxScore ?? null,
    passingScore: rubric?.passingScore ?? null,
    rubricVersion: rubric?.rubricVersion ?? null,
    requiredBeforeAdvance: true,
    noForbiddenVisibleDependency: !forbidden.test(strings),
    decision: "local_rubric_without_declared_source_assets",
  };
});

const invalid = checks.filter((check) =>
  check.criteriaCount < 1 ||
  !Number.isFinite(check.maxScore) ||
  !Number.isFinite(check.passingScore) ||
  check.passingScore <= 0 ||
  check.passingScore > check.maxScore ||
  check.rubricVersion !== "datacamp-source-2026-08-28" ||
  !check.noForbiddenVisibleDependency,
);

const report = {
  generatedAt: new Date().toISOString(),
  courseId: course.id,
  expectedLocalRubricTps: 9,
  localRubricTps: checks.length,
  valid: checks.length === 9 && invalid.length === 0,
  note: "Les TP sont conservés grâce à une rubrique source explicite. Aucun asset local n’est déclaré pour ces activités ; leur autonomie repose sur les consignes locales et l’outil IA choisi par l’apprenant, sans dépendance à un environnement DataCamp.",
  checks,
  invalid,
};

fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.table(checks.map(({ blockId, criteriaCount, maxScore, passingScore, noForbiddenVisibleDependency }) => ({ blockId, criteriaCount, maxScore, passingScore, noForbiddenVisibleDependency })));
if (!report.valid) process.exit(1);
