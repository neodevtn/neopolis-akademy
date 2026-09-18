import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const courseIds = ["01", "02", "03", "04", "05"].map((suffix) => `claude_certified_developer_foundations__${suffix}`);
const registryPath = path.join(root, "server/developerFoundationsCorrectionRegistry.ts");
const backupDirectory = path.join(root, ".work/developer-foundations-remediation-2026-09-18");

function readPreviousRegistry() {
  if (!fs.existsSync(registryPath)) return {};
  const source = fs.readFileSync(registryPath, "utf8");
  const match = source.match(/=\s*(\{[\s\S]*\})\s+as const;/);
  return match ? JSON.parse(match[1]) : {};
}

function readBackupExerciseMap(courseId) {
  const backup = path.join(backupDirectory, `${courseId}.json`);
  if (!fs.existsSync(backup)) return new Map();
  const course = JSON.parse(fs.readFileSync(backup, "utf8"));
  return new Map((course.exercises || []).map((exercise) => [exercise.id, exercise]));
}

const previousRegistry = readPreviousRegistry();
const registry = {};
for (const courseId of courseIds) {
  const file = path.join(root, "client/public/data/courses", `${courseId}.json`);
  const course = JSON.parse(fs.readFileSync(file, "utf8"));
  const backupExercises = readBackupExerciseMap(courseId);
  const referenced = new Set((course.lessons || []).flatMap((lesson) => (lesson.chapters || []).flatMap((chapter) => (chapter.blocks || [])
    .filter((block) => block.type === "checkpoint" && typeof block.exerciseId === "string")
    .map((block) => block.exerciseId))));
  const secured = {};
  for (const exercise of course.exercises || []) {
    if (!referenced.has(exercise.id)) continue;
    const previous = previousRegistry[courseId]?.[exercise.id] || {};
    const backup = backupExercises.get(exercise.id) || {};
    const extractedOptionIds = (exercise.options || []).filter((option) => option.correct === true || option.isCorrect === true).map((option) => option.id);
    const backupOptionIds = (backup.options || []).filter((option) => option.correct === true || option.isCorrect === true).map((option) => option.id);
    const correctOptionIds = extractedOptionIds.length ? extractedOptionIds : (previous.correctOptionIds?.length ? previous.correctOptionIds : backupOptionIds);
    secured[exercise.id] = {
      correction: exercise.correction ?? previous.correction ?? backup.correction,
      rubric: exercise.rubric ?? previous.rubric ?? backup.rubric,
      sampleAnswer: exercise.sampleAnswer ?? previous.sampleAnswer ?? backup.sampleAnswer,
      correctOptionIds,
    };
    exercise.serverCorrectionRequired = true;
    delete exercise.correction;
    delete exercise.rubric;
    delete exercise.sampleAnswer;
    for (const option of exercise.options || []) {
      delete option.correct;
      delete option.isCorrect;
    }
  }
  if (Object.keys(secured).length) registry[courseId] = secured;
  fs.writeFileSync(file, `${JSON.stringify(course, null, 2)}\n`);
}
const ts = `// Generated from the audited Developer Foundations course payloads.\n// Never expose this registry through learner course data.\nexport const DEVELOPER_FOUNDATIONS_SECURE_CORRECTIONS = ${JSON.stringify(registry, null, 2)} as const;\n`;
fs.writeFileSync(registryPath, ts);
console.log(JSON.stringify({ courses: Object.fromEntries(Object.entries(registry).map(([courseId, exercises]) => [courseId, Object.keys(exercises).length])) }, null, 2));
