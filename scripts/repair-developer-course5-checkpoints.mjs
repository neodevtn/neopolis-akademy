import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__05.json');
const contentPatchPath = path.join(root, 'docs/anthropic-developer-course5-critical-patches.json');
const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const lesson = course.lessons?.[0];
const getChapter = (id) => lesson.chapters.find((chapter) => chapter.id === id);
const getExercise = (id) => course.exercises.find((exercise) => exercise.id === id);

const packaging = getChapter('chapter_02');
const packagingExercise = getExercise('ex_claude_certified_developer_foundations__05_002');
if (!packaging || !packagingExercise || packagingExercise.chapterId !== packaging.id) throw new Error('Developer 5 Packaging checkpoint cannot be repaired safely.');
const packagingCheckpoint = packaging.blocks.find((block) => block.type === 'checkpoint');
if (!packagingCheckpoint) throw new Error('Developer 5 Packaging checkpoint block is missing.');
packagingCheckpoint.exerciseId = packagingExercise.id;
packagingExercise.required = true;
packagingExercise.completionRequiresCorrectAnswer = false;
packagingExercise.inputSchema = { ...(packagingExercise.inputSchema || {}), minWords: Math.max(15, packagingExercise.inputSchema?.minWords || 0) };
packaging.completionRule = { requires: ['contentViewed', 'requiredExercisesPassed'] };

const trustBoundary = getChapter('chapter_13');
if (!trustBoundary) throw new Error('Developer 5 trust-boundary chapter is missing.');
trustBoundary.blocks = trustBoundary.blocks.filter((block) => !(block.type === 'checkpoint' && block.exerciseId === 'ex_claude_certified_developer_foundations__05_007'));
trustBoundary.completionRule = { requires: ['contentViewed'] };

const lifecycle = getChapter('chapter_05');
for (const block of lifecycle?.blocks || []) {
  if (block.type !== 'content' || !block.body?.fr) continue;
  block.body.fr = block.body.fr
    .replaceAll('1Requirements', '1 — Exigences')
    .replaceAll('2Design', '2 — Conception')
    .replaceAll('3Build', '3 — Construction')
    .replaceAll('4Test', '4 — Test')
    .replaceAll('5Deploy', '5 — Déploiement')
    .replaceAll('6Operate', '6 — Exploitation')
    .replaceAll('7Iterate', '7 — Itération')
    .replaceAll('requirements', 'exigences')
    .replaceAll('Gating', 'Jalons')
    .replaceAll('gating', 'jalons')
    .replaceAll(' gate', ' jalon')
    .replaceAll('baseline', 'référence épinglée');
}

if (fs.existsSync(contentPatchPath)) {
  const patchSet = JSON.parse(fs.readFileSync(contentPatchPath, 'utf8'));
  for (const patch of patchSet.cards || []) {
    const chapter = getChapter(patch.chapterId);
    const cards = chapter?.blocks?.filter((block) => block.type === 'flip_cards').flatMap((block) => block.cards || []) || [];
    const card = cards.find((item) => item.front === patch.front || item.front?.en === patch.front);
    if (!card) throw new Error(`Missing Developer 5 card ${patch.chapterId}:${patch.front}`);
    card.back = patch.back;
  }
}

fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
console.log('Developer course 5 checkpoint references repaired.');
