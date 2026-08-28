import fs from "node:fs";
import path from "node:path";

const [sourcePath, coursePath, outputPath, ...options] = process.argv.slice(2);
const intentionallyOmitted = new Set(
  options.filter((option) => option.startsWith("--omit=")).flatMap((option) => option.slice("--omit=".length).split(",")).filter(Boolean),
);

if (!sourcePath || !coursePath || !outputPath) {
  console.error("Usage: node scripts/audit-datacamp-course-alignment.mjs <source-manifest> <neopolis-course> <output-json>");
  process.exit(1);
}

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));

const serialise = (value) => (typeof value === "string" ? value : JSON.stringify(value ?? ""));
const walkStrings = (value, strings = []) => {
  if (typeof value === "string") strings.push(value);
  else if (Array.isArray(value)) value.forEach((item) => walkStrings(item, strings));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => walkStrings(item, strings));
  return strings;
};

const titleOf = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.fr ?? value.en ?? "";
  return "";
};

const currentActivities = course.lessons.flatMap((lesson) => lesson.chapters ?? []);
const currentByActivityId = new Map(
  currentActivities.map((chapter) => [chapter.id, chapter]),
);

const sourceActivities = Array.isArray(source.exercises)
  ? source.exercises.map((activity) => ({ chapterNumber: activity.chapter_number, ...activity }))
  : source.chapters.flatMap((chapter) =>
      (chapter.activities ?? []).map((activity) => ({ chapterNumber: chapter.number, ...activity })),
    );

const forbiddenVisiblePatterns = {
  xp: /\b\d+\s*XP\b|XP\s*(quotidiens|DataCamp)|Indice\s*\(-?\d+\s*XP\)/i,
  externalLab: /DataCamp\s*(Lab|Workspace|Campus)|cloud\s+lab|VM\s+DataCamp/i,
  rawHtml: /<\/?(strong|em|p|br|li|ul|span|div|details|summary)\b/i,
  externalMedia: /https?:\/\/(?!akademy\.neodev\.click|[^/]+\.manus\.space|localhost|127\.0\.0\.1)/i,
};

const findings = sourceActivities.map((sourceActivity) => {
  const chapterId = `dc_ch${String(sourceActivity.chapter_number).padStart(2, "0")}_act${String(sourceActivity.exercise_number).padStart(2, "0")}`;
  const current = currentByActivityId.get(chapterId) ?? null;
  const strings = current ? walkStrings(current) : [];
  const visible = strings.filter((entry) => !entry.includes("datacampImport"));
  const flags = Object.fromEntries(
    Object.entries(forbiddenVisiblePatterns).map(([name, pattern]) => [name, visible.some((entry) => pattern.test(entry))]),
  );
  const prompt = serialise(sourceActivity.content?.question?.prompt);
  const hasExplicitRubric = /<exercise_objective>|<required_elements>|<grading_rules>/i.test(prompt);
  const hasLocalAssets = Boolean(
    sourceActivity.file_assets?.length || sourceActivity.referenced_files?.length || sourceActivity.attachments,
  );
  const requiresLocalRuntime = ["CloudExercise", "DatalabExercise", "IDEExercise"].includes(sourceActivity.type);

  const key = `${sourceActivity.chapter_number}.${sourceActivity.exercise_number}`;
  const intentionallyRemoved = intentionallyOmitted.has(key) && !current;
  return {
    key,
    sourceType: sourceActivity.type,
    sourceTitle: sourceActivity.title,
    neopolisChapterId: chapterId,
    presentInNeopolis: Boolean(current),
    neopolisTitle: titleOf(current?.title),
    neopolisType: current?.type ?? null,
    blockTypes: (current?.blocks ?? []).map((block) => block.type),
    explicitRubric: hasExplicitRubric,
    sourceLocalAssets: hasLocalAssets,
    flags,
    provisionalDecision:
      intentionallyRemoved
        ? "removed_non_reproducible"
        : requiresLocalRuntime && !hasExplicitRubric && !hasLocalAssets
        ? "remove_candidate"
        : requiresLocalRuntime && hasExplicitRubric
          ? "local_rubric_candidate"
          : "preserve_or_verify",
  };
});

const missing = findings.filter((finding) => !finding.presentInNeopolis && finding.provisionalDecision !== "removed_non_reproducible");
const flagCounts = Object.fromEntries(
  Object.keys(forbiddenVisiblePatterns).map((flag) => [flag, findings.filter((finding) => finding.flags[flag]).length]),
);
const output = {
  generatedAt: new Date().toISOString(),
  source: {
    title: source.course?.title,
    slug: source.course?.slug,
    manifest: path.resolve(sourcePath),
  },
  neopolis: {
    courseId: course.courseId,
    path: path.resolve(coursePath),
  },
  totals: {
    sourceActivities: sourceActivities.length,
    neopolisActivities: currentActivities.length,
    missingActivities: missing.length,
    intentionallyRemovedActivities: findings.filter((finding) => finding.provisionalDecision === "removed_non_reproducible").length,
    cloudExercises: findings.filter((finding) => finding.sourceType === "CloudExercise").length,
    runtimeExercises: findings.filter((finding) => ["CloudExercise", "DatalabExercise", "IDEExercise"].includes(finding.sourceType)).length,
    localRubricCandidates: findings.filter((finding) => finding.provisionalDecision === "local_rubric_candidate").length,
    removalCandidates: findings.filter((finding) => finding.provisionalDecision === "remove_candidate").length,
    ...flagCounts,
  },
  findings,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.totals, null, 2));
