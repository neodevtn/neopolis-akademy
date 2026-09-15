import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__03.json');
const patchesPath = path.join(root, 'docs/anthropic-developer-course3-critical-patches.json');
const selectionPath = path.join(root, 'docs/anthropic-developer-course3-checkpoint-selection.json');
const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const patches = JSON.parse(fs.readFileSync(patchesPath, 'utf8'));
const selection = JSON.parse(fs.readFileSync(selectionPath, 'utf8'));
const lesson = course.lessons[0];
const chapter = (id) => {
  const target = lesson.chapters.find((item) => item.id === id);
  if (!target) throw new Error(`Missing chapter ${id}.`);
  return target;
};
const content = (id) => {
  const target = chapter(id).blocks.find((block) => block.type === 'content');
  if (!target?.body) throw new Error(`Missing content for ${id}.`);
  return target.body;
};

for (const section of patches.sections) {
  const body = content(section.chapterId);
  body.en = section.body.en;
  body.fr = section.body.fr;
}

for (const restored of patches.cards) {
  const card = chapter(restored.chapterId).blocks
    .filter((block) => block.type === 'flip_cards')
    .flatMap((block) => block.cards || [])
    .find((item) => item.front?.en === restored.title);
  if (!card?.back) throw new Error(`Missing card ${restored.chapterId}:${restored.title}.`);
  card.back.en = restored.back.en;
  card.back.fr = restored.back.fr;
}

const frenchTerms = [
  ['working directory', 'répertoire de travail'],
  ['managed settings', 'paramètres gérés'],
  ['marketplaces', 'places de marché'],
  ['marketplace', 'place de marché'],
  ['bundle versionné', 'ensemble versionné'],
  ['un bypass complet', 'un contournement complet'],
  ['sans bypass complet', 'sans contournement complet'],
];
for (const id of ['chapter_01', 'chapter_03', 'chapter_05']) {
  const body = content(id);
  for (const [from, to] of frenchTerms) body.fr = body.fr.replaceAll(from, to);
}

const tutorials = chapter('chapter_06');
tutorials.title = { en: 'Reference resources', fr: 'Ressources de référence' };
tutorials.type = 'teaching';
tutorials.blocks = [{
  type: 'content',
  body: {
    en: '## Reference resources\n\nUse the relevant checkpoint again when practising permission modes, durable context, or packaging. Confirm current Claude Code details in the official Anthropic documentation before applying a configuration to a production repository.',
    fr: '## Ressources de référence\n\nReprenez le point de contrôle pertinent pour vous entraîner aux modes d’autorisation, au contexte durable ou à l’empaquetage. Vérifiez les détails actuels de Claude Code dans la documentation officielle d’Anthropic avant d’appliquer une configuration à un dépôt de production.',
  },
}];
course.videoRecommendationStatus = 'none';

for (const chosen of selection.selected) {
  const exercise = course.exercises.find((item) => item.id === chosen.exerciseId);
  if (!exercise || exercise.chapterId !== chosen.chapterId) throw new Error(`Missing selected checkpoint ${chosen.exerciseId}.`);
  exercise.required = true;
  exercise.completionRequiresCorrectAnswer = false;
  exercise.inputSchema = { ...(exercise.inputSchema || {}), minWords: Math.max(15, exercise.inputSchema?.minWords || 0), maxWords: exercise.inputSchema?.maxWords || 500, language: 'en' };
  const target = chapter(chosen.chapterId);
  target.blocks = target.blocks.filter((block) => !(block.type === 'checkpoint' && block.exerciseId === chosen.exerciseId));
  target.blocks.push({ type: 'checkpoint', exerciseId: chosen.exerciseId });
  target.completionRule = { requires: ['contentViewed', 'requiredExercisesPassed'] };
}

fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
console.log('Developer course 3 critical corrections applied.');
