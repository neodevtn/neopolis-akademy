import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const courseDirectory = path.join(root, "client", "public", "data", "courses");
const registryPath = path.join(root, "server", "architectFoundationsCorrectionRegistry.ts");
const certificationId = "claude_certified_architect_foundations";
const courseIds = ["01", "02", "03", "04", "05", "06", "07"].map((suffix) => `${certificationId}__${suffix}`);

const registry = {};
for (const courseId of courseIds) {
  const coursePath = path.join(courseDirectory, `${courseId}.json`);
  const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
  const courseRegistry = {};

  for (const exercise of course.exercises || []) {
    const correction = exercise.correction;
    const rubric = exercise.rubric;
    const sampleAnswer = exercise.sampleAnswer;
    const correctOptionIds = Array.isArray(exercise.options)
      ? exercise.options.filter((option) => option?.correct === true).map((option) => option.id).filter(Boolean)
      : [];

    if (!correction && !rubric && !sampleAnswer && correctOptionIds.length === 0) {
      throw new Error(`${courseId}:${exercise.id}: correction material is missing and cannot be migrated safely`);
    }

    courseRegistry[exercise.id] = {
      ...(correction ? { correction } : {}),
      ...(rubric ? { rubric } : {}),
      ...(sampleAnswer ? { sampleAnswer } : {}),
      ...(correctOptionIds.length ? { correctOptionIds } : {}),
    };

    exercise.serverCorrectionRequired = true;
    delete exercise.correction;
    delete exercise.rubric;
    delete exercise.sampleAnswer;
    for (const option of exercise.options || []) delete option.correct;
  }

  registry[courseId] = courseRegistry;
  fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
}

const source = `/* Generated from the protected Architect Foundations exercise corrections.\n * This server-only registry must never be included in learner course payloads. */\n\nexport type ArchitectFoundationsCorrection = {\n  correction?: unknown;\n  rubric?: unknown;\n  sampleAnswer?: unknown;\n  correctOptionIds?: string[];\n};\n\nexport const ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS: Record<string, Record<string, ArchitectFoundationsCorrection>> = ${JSON.stringify(registry, null, 2)};\n`;
fs.writeFileSync(registryPath, source, "utf8");

const summary = Object.fromEntries(Object.entries(registry).map(([courseId, exercises]) => [courseId, Object.keys(exercises).length]));
console.log(JSON.stringify({ certificationId, securedExercises: summary, total: Object.values(summary).reduce((sum, count) => sum + count, 0) }, null, 2));
