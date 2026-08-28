import fs from "node:fs";

const courseId = process.env.CLOUD_EXERCISE_COURSE_ID;
const expectedCount = Number(process.env.CLOUD_EXERCISE_EXPECTED_COUNT);
const outputPath = process.env.CLOUD_EXERCISE_OUTPUT;

if (!courseId || !Number.isInteger(expectedCount) || expectedCount < 0 || !outputPath) {
  throw new Error("CLOUD_EXERCISE_COURSE_ID, CLOUD_EXERCISE_EXPECTED_COUNT et CLOUD_EXERCISE_OUTPUT sont requis.");
}

const course = JSON.parse(fs.readFileSync(`client/public/data/courses/${courseId}.json`, "utf8"));
const forbidden = /DataCamp\s*(VM|Lab|Campus|Workspace)|cloud\s+lab|https?:\/\/|\b\d+\s*XP\b|<\/?(?:strong|em|p|br|li|ul|span|div|details|summary)\b/i;
const asText = (value) => typeof value === "string" ? value : JSON.stringify(value ?? "");

const exercises = course.lessons.flatMap((lesson) => (lesson.chapters ?? [])
  .flatMap((chapter) => (chapter.blocks ?? []).map((block) => ({ lessonId: lesson.id, chapterId: chapter.id, chapterTitle: chapter.title, block }))))
  .filter(({ block }) => block.type === "cloud_exercise");

const checks = exercises.map(({ lessonId, chapterId, chapterTitle, block }) => {
  const criteria = block.rubricCriteria;
  const visibleText = [block.title, block.assignment, block.instructions, block.evaluationPrompt, block.solution, block.hint, criteria]
    .map(asText)
    .join("\n");
  return {
    lessonId,
    chapterId,
    title: chapterTitle?.fr ?? chapterTitle?.en ?? chapterTitle ?? "",
    blockId: block.id,
    criteriaCount: Array.isArray(criteria) ? criteria.length : 0,
    maxScore: block.maxScore ?? null,
    passingScore: block.passingScore ?? null,
    rubricVersion: block.rubricVersion ?? null,
    requiredBeforeAdvance: Boolean(block.requiredBeforeAdvance ?? true),
    noForbiddenVisibleDependency: !forbidden.test(visibleText),
  };
});

const invalid = checks.filter((check) =>
  check.criteriaCount < 1 ||
  !Number.isFinite(check.maxScore) ||
  !Number.isFinite(check.passingScore) ||
  check.passingScore <= 0 ||
  check.passingScore > check.maxScore ||
  !check.rubricVersion ||
  !check.requiredBeforeAdvance ||
  !check.noForbiddenVisibleDependency,
);

const report = {
  generatedAt: new Date().toISOString(),
  courseId,
  expectedLocalRubricExercises: expectedCount,
  localRubricExercises: checks.length,
  valid: checks.length === expectedCount && invalid.length === 0,
  checks,
  invalid,
};

fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.table(checks.map(({ blockId, criteriaCount, maxScore, passingScore, noForbiddenVisibleDependency }) => ({ blockId, criteriaCount, maxScore, passingScore, noForbiddenVisibleDependency })));
if (!report.valid) process.exit(1);
