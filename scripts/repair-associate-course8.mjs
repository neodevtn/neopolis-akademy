import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_associate_foundations__08.json');
const indexPath = path.join(root, 'client/src/data/trainingIndex.json');
const patchesPath = path.join(root, 'docs/anthropic-associate-course8-claude-patches.json');
const readinessPath = path.join(root, 'docs/anthropic-associate-course8-claude-readiness.json');

const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const patches = JSON.parse(fs.readFileSync(patchesPath, 'utf8'));
const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));
const lesson = course.lessons[0];

const chapter = (id) => {
  const item = lesson.chapters.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Chapter ${id} not found.`);
  return item;
};
const content = (id) => {
  const block = chapter(id).blocks.find((candidate) => candidate.type === 'content');
  if (!block?.body) throw new Error(`Content block missing in ${id}.`);
  return block.body;
};
const cards = () => {
  const block = chapter('chapter_01').blocks.find((candidate) => candidate.type === 'flip_cards');
  if (!block?.cards) throw new Error('Summary cards missing.');
  return block.cards;
};
const card = (front) => {
  const item = cards().find((candidate) => candidate.front?.en === front);
  if (!item) throw new Error(`Card ${front} not found.`);
  return item;
};

course.sourceCourseTitle = 'Claude Certified Associate - Foundations / Course Summary & Next Steps';
lesson.title.en = 'Course Summary & Next Steps';
lesson.title.fr = 'Résumé du cours et prochaines étapes';
lesson.recommendedVideosManaged = false;
delete lesson.recommendedVideos;

chapter('chapter_01').title.fr = 'Module 8 · Résumé du cours et prochaines étapes · Associé';
chapter('chapter_02').title.fr = 'Exercice : Module 8 · Résumé du cours et prochaines étapes · Associé';

const introduction = content('chapter_01_1');
introduction.en = patches.intro_en.replace('**Estimated time:** 8 minutes', '**Official duration:** 8 minutes');
introduction.fr = patches.intro_fr.replace('**Durée estimée :** 8 minutes', '**Durée officielle :** 8 minutes');

const summary = content('chapter_01');
summary.en = patches.summary_body_en;
summary.fr = patches.summary_body_fr
  .replaceAll('workflows', 'flux de travail')
  .replaceAll('workflow', 'flux de travail');

const examCard = card('Preparing for the exam');
examCard.back.en = patches.card_exam_en;
examCard.back.fr = patches.card_exam_fr;
const boundaryCard = card('Knowing your boundary');
boundaryCard.back.en = patches.card_boundary_en;

for (const reviewCard of cards()) {
  if (typeof reviewCard.back?.fr !== 'string') continue;
  reviewCard.back.fr = reviewCard.back.fr
    .replaceAll('workflows', 'flux de travail')
    .replaceAll('workflow', 'flux de travail')
    .replaceAll('Delegation', 'Délégation');
}
card('Configuration').back.fr = 'Configurer et maintenir Projects, les instructions et les connaissances.';

const checkpointContent = content('chapter_02');
checkpointContent.en = patches.exercise_intro_en;
checkpointContent.fr = patches.exercise_intro_fr;

const readinessExercise = course.exercises.find((item) => item.id === 'ex_claude_certified_associate_foundations__08_001');
if (!readinessExercise) throw new Error('Associate 8 readiness exercise missing.');
readinessExercise.chapterId = 'chapter_02';
readinessExercise.position = 'after_content';
readinessExercise.interactionType = 'single_choice';
readinessExercise.completionRequiresCorrectAnswer = true;
readinessExercise.required = true;
readinessExercise.title = { en: 'Readiness checkpoint', fr: 'Point de contrôle de préparation' };
readinessExercise.prompt = { en: readiness.question_en, fr: readiness.question_fr };
readinessExercise.instructions = { en: 'Select the best next step.', fr: 'Sélectionnez la meilleure prochaine étape.' };
readinessExercise.prompt.fr = readinessExercise.prompt.fr.replaceAll('Governance', 'Gouvernance');
readinessExercise.options = readiness.options.map((option) => ({
  id: option.id,
  text: { en: option.en, fr: option.fr },
  correct: option.correct,
}));
readinessExercise.correction = { en: readiness.correction_en, fr: readiness.correction_fr };
delete readinessExercise.inputSchema;
delete readinessExercise.rubric;
course.exercises = [readinessExercise];
chapter('chapter_02').completionRule = { requires: ['contentViewed', 'requiredExercisesPassed'] };

const takeaways = content('chapter_04');
takeaways.en = patches.key_takeaways_en;
takeaways.fr = patches.key_takeaways_fr
  .replaceAll('workflows', 'flux de travail')
  .replaceAll('workflow', 'flux de travail');

const completion = content('chapter_05');
completion.en = patches.completion_en;
completion.fr = patches.completion_fr;

const catalogCourse = catalog.courses.find((item) => item.id === course.courseId);
if (!catalogCourse) throw new Error(`Catalog entry missing for ${course.courseId}.`);
catalogCourse.title.en = 'Course Summary & Next Steps';
catalogCourse.title.fr = 'Résumé du cours et prochaines étapes';
catalogCourse.officialDurationMinutes = 8;
catalogCourse.chapterCount = 5;
catalogCourse.exerciseCount = 1;
catalogCourse.totalActivities = 1;
catalogCourse.videoCount = 0;
catalogCourse.downloadCount = 0;
catalogCourse.videos = [];

fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
fs.writeFileSync(indexPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log('Associate course 8 normalized.');
