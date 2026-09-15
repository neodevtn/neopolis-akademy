import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_associate_foundations__07.json');
const indexPath = path.join(root, 'client/src/data/trainingIndex.json');
const patchesPath = path.join(root, 'docs/anthropic-associate-course7-claude-patches.json');
const structuredSectionPath = path.join(root, 'docs/anthropic-associate-course7-claude-structured-section.json');

const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const patches = JSON.parse(fs.readFileSync(patchesPath, 'utf8'));
const structuredSection = JSON.parse(fs.readFileSync(structuredSectionPath, 'utf8'));
const lesson = course.lessons[0];

const findChapter = (id) => {
  const chapter = lesson.chapters.find((item) => item.id === id);
  if (!chapter) throw new Error(`Chapter ${id} not found.`);
  return chapter;
};

const findContent = (chapter) => {
  const block = chapter.blocks.find((item) => item.type === 'content');
  if (!block?.body) throw new Error(`Content block missing for ${chapter.id}.`);
  return block.body;
};

const findCards = (chapter) => {
  const block = chapter.blocks.find((item) => item.type === 'flip_cards');
  if (!block?.cards) throw new Error(`Flip cards missing for ${chapter.id}.`);
  return block.cards;
};

const quoteVariants = (value) => [...new Set([
  value,
  value.replaceAll('’', "'"),
  value.replaceAll("'", '’'),
])];

const replaceOnce = (value, from, to, label) => {
  if (quoteVariants(to).some((variant) => value.includes(variant))) return value;
  const source = quoteVariants(from).find((variant) => value.includes(variant));
  if (!source) throw new Error(`Patch source missing: ${label}`);
  return value.replace(source, to);
};

course.sourceCourseTitle = 'Claude Certified Associate - Foundations / Troubleshooting & Optimization';
lesson.title.en = 'Troubleshooting & Optimization';
lesson.title.fr = 'Dépannage et optimisation';
lesson.recommendedVideosManaged = false;
delete lesson.recommendedVideos;

const intro = findContent(findChapter('chapter_01_1'));
intro.en = intro.en.replace(/\*\*Estimated time:\*\*\s*15[-–]25 minutes/, '**Official duration:** 30 minutes');
intro.fr = intro.fr.replace(/\*\*Durée estimée\s*:\*\*\s*15[-–]25 minutes/, '**Durée officielle :** 30 minutes');

for (const patch of patches.text_replacements) {
  const chapter = findChapter(patch.chapter_id);
  const content = chapter.blocks.find((block) => typeof block.body?.[patch.language] === 'string');
  if (content?.body?.[patch.language]) {
    if (quoteVariants(patch.to).some((variant) => content.body[patch.language].includes(variant))) continue;
    if (quoteVariants(patch.from).some((variant) => content.body[patch.language].includes(variant))) {
      content.body[patch.language] = replaceOnce(content.body[patch.language], patch.from, patch.to, `${patch.chapter_id}/${patch.language}`);
      continue;
    }
  }
  const card = findCards(chapter).find((item) => typeof item.back?.[patch.language] === 'string' && [...quoteVariants(patch.from), ...quoteVariants(patch.to)].some((variant) => item.back[patch.language].includes(variant)));
  // A later course-wide terminology pass can change part of an already applied
  // replacement (for example workflow -> flux de travail). The contract below
  // validates the resulting teaching content, so a non-matching repeat is safe.
  if (!card) continue;
  card.back[patch.language] = replaceOnce(card.back[patch.language], patch.from, patch.to, `${patch.chapter_id}/${patch.language}`);
}

for (const patch of patches.card_replacements) {
  const card = findCards(findChapter(patch.chapter_id)).find((item) => item.front.en === patch.front_en);
  if (!card) throw new Error(`Card ${patch.front_en} missing in ${patch.chapter_id}.`);
  card.back.en = patch.back_en;
  card.back.fr = patch.back_fr;
}

for (const patch of patches.quiz_replacements) {
  const quizChapter = findChapter(patch.chapter_id);
  const question = quizChapter.blocks.find((item) => item.type === 'single_choice_exercise' && item.id === 'q3');
  if (!question?.options) throw new Error('Associate 7 quiz Q3 is missing.');
  const correctOption = question.options.find((item) => item.id === question.correctAnswer);
  if (!correctOption?.text) throw new Error('Associate 7 quiz Q3 correct option is missing.');
  question.question.fr = patch.question_stem_fr.replace('workflow de newsletter', 'flux de travail de newsletter');
  correctOption.text.fr = patch.corrected_option_fr;
  quizChapter.completionRule = { requires: ['contentViewed', 'requiredExercisesPassed'] };
}

const normalizeFrenchTerms = (value) => value
  .replaceAll(/\boutputs?\b/g, 'résultats')
  .replaceAll(/\bfeatures\b/g, 'fonctionnalités')
  .replaceAll(/\bfeature\b/g, 'fonctionnalité')
  .replaceAll(/\bworkflow\b/g, 'flux de travail')
  .replaceAll(/\bchecklist\b/g, 'liste de contrôle')
  .replaceAll('Module 5', 'module 5')
  .replaceAll('Instrumente le flux de travail, identifie les points de friction, intègre la correction dans la configuration et mesure le gain.', 'Analysez le flux de travail, identifiez les points de friction, intégrez la correction à la configuration et mesurez le gain.');

const normalizeFrenchFields = (node) => {
  if (Array.isArray(node)) return node.forEach(normalizeFrenchFields);
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    if (key === 'fr' && typeof value === 'string') node[key] = normalizeFrenchTerms(value);
    else normalizeFrenchFields(value);
  }
};

normalizeFrenchFields(lesson);

const optimizationContent = findContent(findChapter('chapter_03'));
if (optimizationContent.fr.includes('### Signaux à normaliser')) {
  optimizationContent.fr = optimizationContent.fr.replace('### Signaux à normaliser', '**Signaux à normaliser**');
} else if (!optimizationContent.fr.includes('**Signaux à normaliser**')) {
  const signalsStart = optimizationContent.fr.indexOf('Signal\n\nRépétition');
  const signalsEnd = optimizationContent.fr.indexOf('Consolider et promouvoir');
  if (signalsStart < 0 || signalsEnd < 0 || signalsEnd <= signalsStart) {
    throw new Error('Associate 7 signal pseudo-table is missing.');
  }
  const accordionSafeSignals = structuredSection.markdown.replace(/^### Signaux à normaliser/, '**Signaux à normaliser**');
  optimizationContent.fr = `${optimizationContent.fr.slice(0, signalsStart)}${accordionSafeSignals}\n\n${optimizationContent.fr.slice(signalsEnd)}`;
}

// The five integrated single-choice questions are the only required activities
// attached to the chapter flow. Legacy root payloads are detached free exercises.
course.exercises = [];

const catalogCourse = catalog.courses.find((item) => item.id === course.courseId);
if (!catalogCourse) throw new Error(`Catalog entry missing for ${course.courseId}.`);
catalogCourse.title.en = 'Troubleshooting & Optimization';
catalogCourse.title.fr = 'Dépannage et optimisation';
catalogCourse.officialDurationMinutes = 30;
catalogCourse.exerciseCount = 5;
catalogCourse.totalActivities = 5;
catalogCourse.chapterCount = 7;
catalogCourse.videoCount = 0;
catalogCourse.downloadCount = 0;
catalogCourse.videos = [];

fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
fs.writeFileSync(indexPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log('Associate course 7 normalized.');
