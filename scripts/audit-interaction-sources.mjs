import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "client", "public", "data");
const coursesDir = path.join(dataDir, "courses");
const quizzesPath = path.join(dataDir, "lessonQuizzes.json");
const outputPath = path.join(root, "docs", "interaction-source-audit.json");
const summaryPath = path.join(root, "docs", "interaction-source-audit.md");

const interactiveBlockTypes = new Set([
  "single_choice_exercise", "multi_choice_exercise", "bucket_sort", "fill_blank", "matching",
  "ordering", "code_repl", "cloud_exercise", "terminal_sim", "ai_evaluation", "exercise",
  "checkpoint", "flip_card", "checklist",
]);

const isI18n = (value) => value && typeof value === "object" && !Array.isArray(value) && ("fr" in value || "en" in value);
const asText = (value) => typeof value === "string" ? value : isI18n(value) ? value.fr || value.en || "" : "";
const getExerciseLessonMatch = (exercise, lesson, lessonIndex) =>
  exercise.lessonId === lesson?.id || exercise.lessonIndex === lessonIndex || exercise.lesson === lessonIndex || exercise.lesson === lesson?.id;
const getExerciseChapterMatch = (exercise, chapter, chapterIndex) =>
  exercise.chapterId === chapter?.id || exercise.chapterIndex === chapterIndex || exercise.chapter === chapterIndex || exercise.chapter === chapter?.id;

const quizEntriesForChapter = (courseQuizzes, lessonIndex, chapterIndex) => {
  if (!courseQuizzes) return [];
  const compoundKey = `${lessonIndex}_${chapterIndex}`;
  const raw = courseQuizzes[compoundKey] ?? courseQuizzes[String(chapterIndex)];
  if (!raw) return [];
  const questions = Array.isArray(raw) ? raw : raw.questions;
  return Array.isArray(questions) ? questions : [];
};

const files = (await fs.readdir(coursesDir)).filter((file) => file.endsWith(".json")).sort();
const allQuizzes = JSON.parse(await fs.readFile(quizzesPath, "utf-8"));
const audit = {
  generatedAt: new Date().toISOString(),
  totals: { courses: 0, lessons: 0, chapters: 0, interactiveBlocks: 0, chapterQuizQuestions: 0, legacyExercises: 0, checkpointReferencedExercises: 0, legacyExercisesNotRenderedByCheckpoint: 0, orphanLegacyExercises: 0, ambiguousQuizKeys: 0 },
  byType: {},
  courses: [],
};

for (const file of files) {
  const course = JSON.parse(await fs.readFile(path.join(coursesDir, file), "utf-8"));
  const courseId = course.courseId || file.replace(/\.json$/, "");
  const courseQuizzes = allQuizzes[courseId] || {};
  const legacyExercises = Array.isArray(course.exercises) ? course.exercises : [];
  const checkpointExerciseIds = new Set((course.lessons || []).flatMap((lesson) => (lesson.chapters || []).flatMap((chapter) => (chapter.blocks || []).filter((block) => block.type === "checkpoint" && block.exerciseId).map((block) => block.exerciseId))));
  const courseRecord = { courseId, filename: file, lessons: [], orphanLegacyExercises: [], checkpointReferencedExercises: [], legacyExercisesNotRenderedByCheckpoint: [] };
  audit.totals.courses += 1;

  legacyExercises.forEach((exercise, index) => {
    const hasLessonLink = exercise.lessonId !== undefined || exercise.lessonIndex !== undefined || exercise.lesson !== undefined;
    const hasChapterLink = exercise.chapterId !== undefined || exercise.chapterIndex !== undefined || exercise.chapter !== undefined;
    if (!hasLessonLink && !hasChapterLink) courseRecord.orphanLegacyExercises.push({ index, id: exercise.id || null, title: asText(exercise.title), reason: "Aucun rattachement de leçon ou chapitre" });
    if (checkpointExerciseIds.has(exercise.id)) courseRecord.checkpointReferencedExercises.push({ index, id: exercise.id || null, title: asText(exercise.title) });
    else courseRecord.legacyExercisesNotRenderedByCheckpoint.push({ index, id: exercise.id || null, title: asText(exercise.title) });
  });

  for (const [lessonIndex, lesson] of (course.lessons || []).entries()) {
    audit.totals.lessons += 1;
    const lessonRecord = { lessonIndex, lessonId: lesson.id || null, title: asText(lesson.title), chapters: [] };
    for (const [chapterIndex, chapter] of (lesson.chapters || []).entries()) {
      audit.totals.chapters += 1;
      const interactiveBlocks = (chapter.blocks || []).filter((block) => interactiveBlockTypes.has(block.type));
      const quizQuestions = quizEntriesForChapter(courseQuizzes, lessonIndex, chapterIndex);
      const chapterExercises = legacyExercises.filter((exercise) => getExerciseLessonMatch(exercise, lesson, lessonIndex) && getExerciseChapterMatch(exercise, chapter, chapterIndex));
      const chapterRecord = {
        chapterIndex,
        chapterId: chapter.id || null,
        title: asText(chapter.title),
        interactiveBlocks: interactiveBlocks.map((block, blockIndex) => ({ id: block.id || `block_${blockIndex}`, type: block.type, title: asText(block.title) || asText(block.question) || "" })),
        chapterQuizQuestions: quizQuestions.map((question, questionIndex) => ({ id: question.id || `question_${questionIndex}`, question: asText(question.question), choices: question.choices?.length || 0 })),
        legacyExercises: chapterExercises.map((exercise) => ({ id: exercise.id || null, type: exercise.interactionType || "free_text", title: asText(exercise.title) })),
      };
      audit.totals.interactiveBlocks += interactiveBlocks.length;
      audit.totals.chapterQuizQuestions += quizQuestions.length;
      audit.totals.legacyExercises += chapterExercises.length;
      for (const block of interactiveBlocks) audit.byType[block.type] = (audit.byType[block.type] || 0) + 1;
      lessonRecord.chapters.push(chapterRecord);
    }
    courseRecord.lessons.push(lessonRecord);
  }
  audit.totals.orphanLegacyExercises += courseRecord.orphanLegacyExercises.length;
  audit.totals.checkpointReferencedExercises += courseRecord.checkpointReferencedExercises.length;
  audit.totals.legacyExercisesNotRenderedByCheckpoint += courseRecord.legacyExercisesNotRenderedByCheckpoint.length;
  audit.courses.push(courseRecord);
}

const lines = [
  "# Audit des sources d’interaction", "",
  `Généré le ${audit.generatedAt}.`, "",
  "| Indicateur | Nombre |", "|---|---:|",
  ...Object.entries(audit.totals).map(([key, value]) => `| ${key} | ${value} |`), "",
  "## Blocs interactifs par type", "", "| Type | Nombre |", "|---|---:|",
  ...Object.entries(audit.byType).sort(([a], [b]) => a.localeCompare(b)).map(([type, count]) => `| ${type} | ${count} |`), "",
  "## Exercices historiques orphelins", "",
  ...audit.courses.filter((course) => course.orphanLegacyExercises.length).map((course) => `- **${course.courseId}** : ${course.orphanLegacyExercises.length}`),
];

await fs.writeFile(outputPath, JSON.stringify(audit, null, 2));
await fs.writeFile(summaryPath, `${lines.join("\n")}\n`);
console.log(`Audit généré : ${audit.totals.courses} cours, ${audit.totals.lessons} leçons, ${audit.totals.chapters} chapitres.`);
console.log(`Interactions : ${audit.totals.interactiveBlocks} blocs, ${audit.totals.chapterQuizQuestions} questions de quiz de chapitre, ${audit.totals.legacyExercises} exercices rattachés.`);
console.log(`Exercices historiques orphelins : ${audit.totals.orphanLegacyExercises}.`);
