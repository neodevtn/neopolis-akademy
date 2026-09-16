import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__05.json');
const contentPatchPath = path.join(root, 'docs/anthropic-developer-course5-critical-patches.json');
const followupPatchPath = path.join(root, 'docs/anthropic-developer-course5-followup-patches.json');
const localizationPatchPath = path.join(root, 'docs/anthropic-developer-course5-localization-patches.json');
const requirementsCheckpointPatchPath = path.join(root, 'docs/skilljar-developer5-requirements-checkpoints.json');
const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const lesson = course.lessons?.[0];
const getChapter = (id) => lesson.chapters.find((chapter) => chapter.id === id);
const getExercise = (id) => course.exercises.find((exercise) => exercise.id === id);
const applyExactReplacement = (value, oldText, newText, label) => {
  if (value.includes(newText) && !value.includes(oldText)) return value;
  const occurrences = value.split(oldText).length - 1;
  if (occurrences !== 1) throw new Error(`Expected one Developer 5 replacement target ${label}; found ${occurrences}`);
  return value.replace(oldText, newText);
};

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
if (!lifecycle) throw new Error('Developer 5 Requirements & Lifecycle chapter is missing.');
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

if (!fs.existsSync(requirementsCheckpointPatchPath)) throw new Error('Missing Skilljar Developer 5 requirements checkpoint proposal.');
const requirementsPatch = JSON.parse(fs.readFileSync(requirementsCheckpointPatchPath, 'utf8'));
const singleChoiceById = new Map(requirementsPatch.singleChoiceExercises.map((item) => [item.id, item]));
const s07bQuestionOne = singleChoiceById.get('skilljar_s07b_q1');
const s07bQuestionTwo = singleChoiceById.get('skilljar_s07b_q2');
const s07d = requirementsPatch.matching;
if (!s07bQuestionOne || !s07bQuestionTwo || s07d?.id !== 'skilljar_s07d') throw new Error('Invalid Skilljar Developer 5 S07 proposal.');

const asSensitiveSingleChoice = (proposal) => ({
  type: 'single_choice_exercise',
  id: proposal.id,
  sourceScreenId: proposal.sourceScreenId,
  title: proposal.title,
  question: proposal.question,
  options: proposal.options,
  serverValidated: true,
});
const s07bQuestionOneBlock = asSensitiveSingleChoice(s07bQuestionOne);
const s07bQuestionTwoBlock = asSensitiveSingleChoice(s07bQuestionTwo);
const s07bQuestionOneIndex = lifecycle.blocks.findIndex((block) => block.id === s07bQuestionOneBlock.id);
if (s07bQuestionOneIndex >= 0) {
  lifecycle.blocks[s07bQuestionOneIndex] = s07bQuestionOneBlock;
  const q2Index = lifecycle.blocks.findIndex((block) => block.id === s07bQuestionTwoBlock.id);
  if (q2Index >= 0) lifecycle.blocks[q2Index] = s07bQuestionTwoBlock;
  else lifecycle.blocks.splice(s07bQuestionOneIndex + 1, 0, s07bQuestionTwoBlock);
} else {
  const legacyRequirementsCheckpoint = lifecycle.blocks.findIndex((block) => block.type === 'bucket_sort' && block.title?.en === 'Checkpoint 3: extract requirements — Try now');
  if (legacyRequirementsCheckpoint < 0) throw new Error('Missing legacy Developer 5 requirements checkpoint.');
  lifecycle.blocks.splice(legacyRequirementsCheckpoint, 1, s07bQuestionOneBlock, s07bQuestionTwoBlock);
}

const s07dBlock = {
  type: 'matching',
  id: s07d.id,
  sourceScreenId: s07d.sourceScreenId,
  title: s07d.title,
  instructions: s07d.instructions,
  pairs: s07d.pairs,
  feedback: s07d.feedback,
};
const s07dIndex = lifecycle.blocks.findIndex((block) => block.id === s07dBlock.id);
if (s07dIndex >= 0) {
  lifecycle.blocks[s07dIndex] = s07dBlock;
} else {
  const legacyLifecycleCheckpoint = lifecycle.blocks.findIndex((block) => block.type === 'bucket_sort' && block.title?.en === 'Checkpoint 4: place work in the correct phase — Try now');
  if (legacyLifecycleCheckpoint < 0) throw new Error('Missing legacy Developer 5 lifecycle checkpoint.');
  lifecycle.blocks.splice(legacyLifecycleCheckpoint, 1, s07dBlock);
}
lifecycle.completionRule = { requires: ['contentViewed', 'requiredExercisesPassed'] };
course.exercises = (course.exercises || []).filter((exercise) => exercise.id !== 'ex_claude_certified_developer_foundations__05_012');

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

if (fs.existsSync(followupPatchPath)) {
  const patchSet = JSON.parse(fs.readFileSync(followupPatchPath, 'utf8'));
  for (const patch of patchSet.tables || []) {
    const chapter = getChapter(patch.chapterId);
    const content = chapter?.blocks?.find((block) => block.type === 'content');
    if (!content?.body) throw new Error(`Missing Developer 5 table target ${patch.chapterId}`);
    const tableAlreadyRestored = (content.body.en || '').includes(patch.newEn) && !(content.body.en || '').includes(patch.oldEn);
    content.body.en = tableAlreadyRestored
      ? content.body.en
      : applyExactReplacement(content.body.en || '', patch.oldEn, patch.newEn, `${patch.chapterId}:en`);
    content.body.fr = tableAlreadyRestored && !(content.body.fr || '').includes(patch.oldFr)
      ? content.body.fr
      : applyExactReplacement(content.body.fr || '', patch.oldFr, patch.newFr, `${patch.chapterId}:fr`);
  }
  for (const patch of patchSet.cards || []) {
    const chapter = getChapter(patch.chapterId);
    const cards = chapter?.blocks?.filter((block) => block.type === 'flip_cards').flatMap((block) => block.cards || []) || [];
    const card = cards.find((item) => item.front === patch.front || item.front?.en === patch.front);
    if (!card) throw new Error(`Missing Developer 5 follow-up card ${patch.chapterId}:${patch.front}`);
    card.back = patch.back;
  }
}

if (fs.existsSync(localizationPatchPath)) {
  const patchSet = JSON.parse(fs.readFileSync(localizationPatchPath, 'utf8'));
  for (const patch of patchSet.patches || []) {
    const chapter = getChapter(patch.chapterId);
    const content = chapter?.blocks?.find((block) => block.type === 'content');
    if (!content?.body?.fr) throw new Error(`Missing Developer 5 localization target ${patch.chapterId}`);
    content.body.fr = applyExactReplacement(content.body.fr, patch.oldText, patch.newText, `${patch.chapterId}:${patch.oldText}`);
  }
}

fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
console.log('Developer course 5 checkpoint references repaired.');
