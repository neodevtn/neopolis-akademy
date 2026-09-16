import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__03.json');
const indexPath = path.join(root, 'client/src/data/trainingIndex.json');
const patchesPath = path.join(root, 'docs/anthropic-developer-course3-critical-patches.json');
const selectionPath = path.join(root, 'docs/anthropic-developer-course3-checkpoint-selection.json');
const checkpoint4PatchPath = path.join(root, 'docs/anthropic-developer-course3-checkpoint4-patch.json');
const skilljarCheckpointPatchesPath = path.join(root, 'docs/skilljar-developer3-checkpoint-patches.json');
const skilljarChapterPatchesPath = path.join(root, 'docs/skilljar-developer3-chapter-patches.json');
const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const trainingIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const patches = JSON.parse(fs.readFileSync(patchesPath, 'utf8'));
const selection = JSON.parse(fs.readFileSync(selectionPath, 'utf8'));
const checkpoint4Patch = JSON.parse(fs.readFileSync(checkpoint4PatchPath, 'utf8'));
const skilljarCheckpointPatches = JSON.parse(fs.readFileSync(skilljarCheckpointPatchesPath, 'utf8'));
const skilljarChapterPatches = JSON.parse(fs.readFileSync(skilljarChapterPatchesPath, 'utf8'));
const lesson = course.lessons[0];

course.officialDurationMinutes = 142;
course.durationMinutes = 142;
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
const replaceExact = (value, oldText, newText, label) => {
  if (value.includes(newText) && !value.includes(oldText)) return value;
  const occurrences = value.split(oldText).length - 1;
  if (occurrences !== 1) throw new Error(`Expected one Developer 3 replacement target ${label}; found ${occurrences}`);
  return value.replace(oldText, newText);
};

const introduction = content('chapter_01_1');
introduction.en = replaceExact(introduction.en, '**Estimated time:** 15-25 minutes', '**Official course duration:** 142 minutes', 'introduction:en');
introduction.fr = replaceExact(introduction.fr, '**Durée estimée :** 15-25 minutes', '**Durée officielle du cours :** 142 minutes', 'introduction:fr');

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

const cardFrontPatches = [
  { chapterId: 'chapter_03', en: ['Watch OutDurable Project Context·4 min', 'Watch Out · Durable Project Context · 4 min'], fr: ['Attention — Contexte du projet Durable·4 min', 'À surveiller · Contexte de projet durable · 4 min'] },
  { chapterId: 'chapter_05', en: ['Watch OutPackaging Workflows·3 min', 'Watch Out · Packaging Workflows · 3 min'], fr: ['Attention — Packaging flux de travail · 3 min', 'À surveiller · Flux de travail d’empaquetage · 3 min'] },
];
for (const patch of cardFrontPatches) {
  const card = chapter(patch.chapterId).blocks
    .filter((block) => block.type === 'flip_cards')
    .flatMap((block) => block.cards || [])
    .find((item) => item.front?.en === patch.en[0] || item.front?.en === patch.en[1]);
  if (!card?.front) throw new Error(`Missing Developer 3 card front ${patch.chapterId}.`);
  card.front.en = replaceExact(card.front.en, patch.en[0], patch.en[1], `${patch.chapterId}:front:en`);
  card.front.fr = replaceExact(card.front.fr, patch.fr[0], patch.fr[1], `${patch.chapterId}:front:fr`);
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

const updateCatalogEntry = (node) => {
  if (Array.isArray(node)) return node.some(updateCatalogEntry);
  if (!node || typeof node !== 'object') return false;
  if (node.id === course.id) {
    node.officialDurationMinutes = 142;
    node.videos = [];
    node.videoCount = 0;
    return true;
  }
  return Object.values(node).some(updateCatalogEntry);
};
if (!updateCatalogEntry(trainingIndex)) throw new Error(`Missing catalog entry ${course.id}.`);

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

const checkpoint4Chapter = chapter('chapter_05');
const checkpoint4ContentIndex = checkpoint4Chapter.blocks.findIndex((block) => block.type === 'content' && typeof block.body?.en === 'string' && block.body.en.includes('name: deploy-validate'));
if (checkpoint4ContentIndex < 0) throw new Error('Missing Developer 3 checkpoint 4 content block.');
checkpoint4Chapter.blocks[checkpoint4ContentIndex].body = checkpoint4Patch.body;
const { correctAnswer: _correctAnswer, explanation: _explanation, ...checkpoint4PublicExercise } = checkpoint4Patch.exercise;
const checkpoint4Exercise = { ...checkpoint4PublicExercise, serverValidated: true };
const existingCheckpoint4Index = checkpoint4Chapter.blocks.findIndex((block) => block.id === checkpoint4Exercise.id);
if (existingCheckpoint4Index >= 0) {
  checkpoint4Chapter.blocks[existingCheckpoint4Index] = checkpoint4Exercise;
} else {
  checkpoint4Chapter.blocks.splice(checkpoint4ContentIndex + 1, 0, checkpoint4Exercise);
}
checkpoint4Chapter.completionRule = { requires: ['contentViewed', 'requiredExercisesPassed'] };

const chapterPatchById = new Map(skilljarChapterPatches.chapters.map((item) => [item.id, item]));
const checkpointPatchByScreen = new Map(skilljarCheckpointPatches.proposals.map((item) => [item.sourceScreenId, item]));
const upsertBlock = (target, block) => {
  const existingIndex = target.blocks.findIndex((item) => item.id === block.id);
  if (existingIndex >= 0) target.blocks[existingIndex] = block;
  else target.blocks.push(block);
};
const asTeachingBlocks = (patch) => {
  const blocks = [{ type: 'content', id: `${patch.id}_content`, body: patch.body }];
  if (patch.flipCards.length > 0) blocks.push({ type: 'flip_cards', id: `${patch.id}_cards`, cards: patch.flipCards });
  return blocks;
};
const upsertTeachingChapter = (patch, fallbackIndex) => {
  const updated = {
    id: patch.id,
    title: patch.title,
    type: 'teaching',
    durationMinutes: patch.durationMinutes,
    blocks: asTeachingBlocks(patch),
  };
  const index = lesson.chapters.findIndex((item) => item.id === patch.id);
  if (index >= 0) lesson.chapters[index] = updated;
  else lesson.chapters.splice(fallbackIndex, 0, updated);
  return updated;
};

const mcpChapterPatch = chapterPatchById.get('chapter_skilljar_mcp_servers');
const enterpriseChapterPatch = chapterPatchById.get('chapter_skilljar_enterprise_integration');
const takeawaysPatch = chapterPatchById.get('chapter_06');
if (!mcpChapterPatch || !enterpriseChapterPatch || !takeawaysPatch) throw new Error('Missing Skilljar Developer 3 chapter proposal.');
const takeawaysIndex = lesson.chapters.findIndex((item) => item.id === 'chapter_06');
if (takeawaysIndex < 0) throw new Error('Missing Developer 3 Key Takeaways chapter.');
upsertTeachingChapter(mcpChapterPatch, takeawaysIndex);
upsertTeachingChapter(enterpriseChapterPatch, lesson.chapters.findIndex((item) => item.id === 'chapter_06'));
upsertTeachingChapter(takeawaysPatch, lesson.chapters.findIndex((item) => item.id === 'chapter_06'));

const checkpointContent = (proposal) => ({
  type: 'content',
  id: `${proposal.id}_context`,
  body: {
    en: `## ${proposal.title.en}\n\n${proposal.instructions.en}${proposal.referenceCode.en ? `\n\n\`\`\`\n${proposal.referenceCode.en}\n\`\`\`` : ''}`,
    fr: `## ${proposal.title.fr}\n\n${proposal.instructions.fr}${proposal.referenceCode.fr ? `\n\n\`\`\`\n${proposal.referenceCode.fr}\n\`\`\`` : ''}`,
  },
});
const installMatchingCheckpoint = (proposal, target) => {
  upsertBlock(target, checkpointContent(proposal));
  upsertBlock(target, {
    type: 'matching',
    id: proposal.id,
    title: proposal.title,
    instructions: proposal.question,
    pairs: proposal.pairs,
    feedback: proposal.feedback,
  });
  target.completionRule = { requires: ['contentViewed', 'requiredExercisesPassed'] };
};
const installSensitiveSingleChoiceCheckpoint = (proposal, target) => {
  upsertBlock(target, checkpointContent(proposal));
  upsertBlock(target, {
    type: 'single_choice_exercise',
    id: proposal.id,
    question: proposal.question,
    options: proposal.options,
    serverValidated: true,
  });
  target.completionRule = { requires: ['contentViewed', 'requiredExercisesPassed'] };
};

const durableCheckpoint = checkpointPatchByScreen.get('S07');
const mcpCheckpoint = checkpointPatchByScreen.get('S14');
const enterpriseCheckpoint = checkpointPatchByScreen.get('S17');
if (!durableCheckpoint || !mcpCheckpoint || !enterpriseCheckpoint) throw new Error('Missing Skilljar Developer 3 checkpoint proposal.');
installMatchingCheckpoint(durableCheckpoint, chapter('chapter_03'));
installMatchingCheckpoint(mcpCheckpoint, chapter('chapter_skilljar_mcp_servers'));
installSensitiveSingleChoiceCheckpoint(enterpriseCheckpoint, chapter('chapter_skilljar_enterprise_integration'));

fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
fs.writeFileSync(indexPath, `${JSON.stringify(trainingIndex, null, 2)}\n`);
console.log('Developer course 3 critical corrections applied.');
