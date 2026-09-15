import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_associate_foundations__06.json');
const indexPath = path.join(root, 'client/src/data/trainingIndex.json');
const patchesPath = path.join(root, 'docs/anthropic-associate-course6-claude-patches.json');
const polishPath = path.join(root, 'docs/anthropic-associate-course6-claude-polish.json');

const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const patches = JSON.parse(fs.readFileSync(patchesPath, 'utf8'));
const polish = JSON.parse(fs.readFileSync(polishPath, 'utf8'));
const lesson = course.lessons[0];

const findChapter = (id) => {
  const chapter = lesson.chapters.find((item) => item.id === id);
  if (!chapter) throw new Error(`Chapter ${id} not found.`);
  return chapter;
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

const applyPolish = (value) => polish.exactReplace.reduce((current, patch) => {
  if (quoteVariants(patch.to).some((variant) => current.includes(variant))) return current;
  const source = quoteVariants(patch.from).find((variant) => current.includes(variant));
  return source ? current.replace(source, patch.to) : current;
}, value);

const contentPatches = patches.contentReplacements.map((patch) => ({
  ...patch,
  to: applyPolish(patch.to),
}));

course.sourceCourseTitle = 'Claude Certified Associate - Foundations / Governance, Risk & Responsible Use';
lesson.title.en = 'Governance, Risk & Responsible Use';
lesson.title.fr = 'Gouvernance, risques et utilisation responsable';

const intro = findChapter('chapter_01_1').blocks[0].body;
intro.en = intro.en.replace('**Estimated time:** 15-25 minutes', '**Official duration:** 55 minutes');
intro.fr = intro.fr.replace(/\*\*Durée estimée\s*:\*\*\s*15[-–]25 minutes/, '**Durée officielle :** 55 minutes');
intro.fr = intro.fr.replaceAll('Confiance dans les compétences et risque des fonctionnalités', 'Confiance dans les Skills et risques liés aux fonctionnalités');

for (const patch of contentPatches) {
  const chapter = findChapter(patch.chapterId);
  const content = chapter.blocks.find((block) => block.type === 'content');
  if (!content?.body?.fr) throw new Error(`French content missing for ${patch.chapterId}.`);
  content.body.fr = replaceOnce(content.body.fr, patch.from, patch.to, `${patch.chapterId} content`);
}

const dataControls = findChapter('chapter_03').blocks.find((block) => block.type === 'content');
dataControls.body.fr = applyPolish(dataControls.body.fr);
dataControls.body.fr = dataControls.body.fr
  .replaceAll('Rédiger les noms, les numéros de compte ou les identifiants avant le téléversement', 'Caviarder les noms, les numéros de compte ou les identifiants avant le téléversement')
  .replaceAll('La rédaction fonctionne lorsque', 'Le caviardage fonctionne lorsque')
  .replaceAll('Deux modes d’échec de la rédaction', 'Deux modes d’échec du caviardage')
  .replaceAll('Rédaction partielle.', 'Caviardage partiel.')
  .replaceAll('Rédaction qui casse la tâche.', 'Caviardage qui empêche la tâche.')
  .replaceAll("la rédaction n'est pas la solution", "le caviardage n'est pas la solution")
  .replaceAll('La rédaction est un outil', 'Le caviardage est un outil');

const governancePolicies = findChapter('chapter_04').blocks.find((block) => block.type === 'content');
governancePolicies.body.fr = governancePolicies.body.fr.replaceAll('drift', 'dérive');

for (const patch of patches.cardReplacements) {
  const chapter = findChapter(patch.chapterId);
  const card = findCards(chapter).find((item) => item.front.en === patch.frontEn);
  if (!card) throw new Error(`Card ${patch.frontEn} missing in ${patch.chapterId}.`);
  card.front.fr = patch.frontFr;
  card.back.fr = patch.backFr;
}

for (const patch of patches.chapterTitleReplacements) {
  findChapter(patch.chapterId).title.fr = patch.fr;
}

const useCases = findChapter('chapter_01');
useCases.completionRule = { requires: ['contentViewed', 'requiredExercisesPassed'] };
const bucketSort = useCases.blocks.find((block) => block.type === 'bucket_sort');
bucketSort.title.fr = 'Catégorisez les cas d’utilisation par niveau de risque';
bucketSort.instructions.fr = 'Pour chaque cas d’utilisation, déterminez s’il est approprié, nécessite des garde-fous ou est inapproprié pour Claude.';

const quiz = findChapter('chapter_06');
quiz.completionRule = { requires: ['contentViewed', 'requiredExercisesPassed'] };

// The integrated bucket-sort and five deterministic quiz questions are the
// pedagogical activities in this course. Imported root payloads duplicate or
// misroute activities, bypass the chapter flow and remain optional.
course.exercises = [];

// The inherited n8n recommendation has no governance provenance, transcript,
// checksum or playback verification. Keep the standard media policy explicit.
delete lesson.recommendedVideos;
lesson.recommendedVideosManaged = false;

const catalogCourse = catalog.courses.find((item) => item.id === course.courseId);
if (!catalogCourse) throw new Error(`Catalog entry missing for ${course.courseId}.`);
catalogCourse.title.en = 'Governance, Risk & Responsible Use';
catalogCourse.title.fr = 'Gouvernance, risques et utilisation responsable';
catalogCourse.officialDurationMinutes = 55;
catalogCourse.exerciseCount = 6;
catalogCourse.totalActivities = 6;
catalogCourse.chapterCount = 9;
catalogCourse.videoCount = 0;
catalogCourse.downloadCount = 0;
catalogCourse.videos = [];

fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
fs.writeFileSync(indexPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log('Associate course 6 normalized.');
