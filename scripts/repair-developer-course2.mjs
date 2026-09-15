import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__02.json');
const indexPath = path.join(root, 'client/src/data/trainingIndex.json');
const activitiesPath = path.join(root, 'docs/anthropic-developer-course2-claude-activities.json');
const patchesPath = path.join(root, 'docs/anthropic-developer-course2-claude-patches.json');
const cardsPath = path.join(root, 'docs/anthropic-developer-course2-claude-cards.json');
const promptingStructurePath = path.join(root, 'docs/anthropic-developer-course2-claude-prompting-structure.json');

const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const generatedActivities = JSON.parse(fs.readFileSync(activitiesPath, 'utf8'));
const generatedPatches = JSON.parse(fs.readFileSync(patchesPath, 'utf8'));
const generatedCards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
const promptingStructure = JSON.parse(fs.readFileSync(promptingStructurePath, 'utf8'));
const lesson = course.lessons[0];

const chapter = (id) => {
  const value = lesson.chapters.find((item) => item.id === id);
  if (!value) throw new Error(`Chapter ${id} is missing.`);
  return value;
};
const content = (id) => {
  const block = chapter(id).blocks.find((item) => item.type === 'content');
  if (!block?.body) throw new Error(`Content block for ${id} is missing.`);
  return block.body;
};

course.sourceCourseTitle = 'Claude Certified Developer - Foundations / Production-Grade Prompting, Agents & Tool Use';
lesson.title.en = 'Production-Grade Prompting, Agents & Tool Use';
lesson.title.fr = 'Prompting prêt pour la production, agents et utilisation d’outils';
lesson.officialDurationMinutes = 209;

const introduction = content('chapter_01_1');
introduction.en = `## Welcome to Module 02: Production-Grade Prompting, Agents & Tool Use

This module develops the production practices that make Claude integrations reliable: prompt diagnosis, Extended Thinking, tools and schemas, streaming, context engineering, agent construction, memory, and multimodal ingestion.

### How this module works

Each screen builds on the prior one. Complete the required checkpoint after the relevant content before continuing. The practical resources screen only links you back to documented concepts and checkpoints; it does not claim access to an external lab.

**Official duration:** 209 minutes`;
introduction.fr = `## Bienvenue au module 02 : Prompting prêt pour la production, agents et utilisation d’outils

Ce module développe les pratiques de production qui rendent les intégrations Claude fiables : diagnostic de prompt, Extended Thinking, outils et schémas, streaming, ingénierie du contexte, construction d’agents, mémoire et ingestion multimodale.

### Comment fonctionne ce module

Chaque écran s’appuie sur le précédent. Terminez le point de contrôle obligatoire après le contenu concerné avant de poursuivre. L’écran de ressources pratiques vous renvoie vers les notions documentées et les points de contrôle ; il ne prétend pas donner accès à un laboratoire externe.

**Durée officielle :** 209 minutes`;

const safePatchSources = new Set([
  'L’art du prompting',
  'System prompts, XML, few-shot, and output constraints',
  'du prose',
  'd’un run à l’autre',
  'le router',
  'Pass — What was added — Output behavior',
  'La Pass 4',
  'La Pass 5',
  'matcher l’entrée',
  'Forme de la tâche Extended thinking appel Raison',
  'Extended thinking n’améliorera pas',
  'Forward pointer',
  'Définir le schema',
  'un Developer ait',
  'un Developer',
  'Le Senior Developer',
  'Senior Developer :',
  'Developer :',
  'Réponses en streaming et gestion de sorties partielles sans corrompre l\'état',
  'What streaming changes about the response',
  'The event sequence, and what your handler does with each',
  'EventWhat it signalsWhat your handler does',
  'What to Watch Out for',
  'au moment du build',
  'StrategyWhat it doesWhen to applyWhat continuity you lose',
  'Postmortem',
  'fixtures de test',
  'Développement Production',
  'le humain dans la boucle',
  'Les Agents',
  'server-sent events',
  'checkpoint humain',
  'Memory scope',
  'patterns de conception d’agent',
  'tool schemas',
  'subagents',
  'Ingestion multimodale et ingestion par lots',
  'Le travail par batch qui n’était en réalité pas un batch',
  'Chunker une liste',
]);

for (const patch of generatedPatches.replacements) {
  if (!safePatchSources.has(patch.from)) continue;
  const target = chapter(patch.chapterId);
  if (target.title?.fr?.includes(patch.from)) target.title.fr = target.title.fr.replaceAll(patch.from, patch.to);
  const body = target.blocks.find((block) => block.type === 'content')?.body;
  if (body?.fr?.includes(patch.from)) body.fr = body.fr.replaceAll(patch.from, patch.to);
}

const replacePromptingSection = (source, startMarker, endMarker, replacement) => {
  if (source.includes(replacement)) return source;
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  if (start < 0 || end < 0 || end <= start) throw new Error(`Prompting Craft section is missing: ${startMarker}`);
  return `${source.slice(0, start)}${replacement}\n\n${source.slice(end)}`;
};

const promptingCraft = content('chapter_01');
promptingCraft.fr = replacePromptingSection(
  promptingCraft.fr,
  'Ce que vous avez observé — Ce que le prompt manque — Pourquoi cette technique corrige',
  'Diagnostiquer un prompt de classification',
  promptingStructure.first_section_fr,
);
promptingCraft.fr = replacePromptingSection(
  promptingCraft.fr,
  'Stack all four techniques',
  'Quand utiliser chaque technique',
  promptingStructure.second_section_fr,
);
promptingCraft.fr = replacePromptingSection(
  promptingCraft.fr,
  'System Prompts',
  'La boucle d’itération',
  promptingStructure.third_section_fr,
);

const manualFrenchNormalization = [
  ['chapter_01', 'une output constraint', 'une contrainte de sortie'],
  ['chapter_01', 'Un system prompt', 'Un prompt système'],
  ['chapter_01', 'un system prompt', 'un prompt système'],
  ['chapter_01', 'le system prompt', 'le prompt système'],
  ['chapter_01', 'Le system prompt', 'Le prompt système'],
  ['chapter_01', 'Le router', 'Le routeur'],
  ['chapter_01', 'Les few‑shot pairs', 'Les paires few-shot'],
  ['chapter_01', 'des few‑shot examples', 'des exemples few-shot'],
  ['chapter_01', 'deux few‑shot examples', 'deux exemples few-shot'],
  ['chapter_01', 'des structured outputs', 'des sorties structurées'],
  ['chapter_01', 'les structured outputs', 'les sorties structurées'],
  ['chapter_01', 'Les structured outputs', 'Les sorties structurées'],
  ['chapter_01', 'structured outputs', 'sorties structurées'],
  ['chapter_01', 'Déplacer le contrôle de sortie du prompt vers l’API avec des structured outputs', 'Déplacer le contrôle de sortie du prompt vers l’API avec des sorties structurées'],
  ['chapter_01', 'un JSON schema', 'un schéma JSON'],
  ['chapter_01', 'du constrained decoding', 'du décodage contraint'],
  ['chapter_01', 'le system prompt corrigé', 'le prompt système corrigé'],
  ['chapter_01', 'Les few-shot examples', 'Les exemples few-shot'],
  ['chapter_01', 'les few-shot pairs', 'les paires few-shot'],
  ['chapter_01', 'la output constraint', 'la contrainte de sortie'],
  ['chapter_01', 'les few‑shot examples', 'les exemples few-shot'],
  ['chapter_01', 'un few‑shot example', 'un exemple few-shot'],
  ['chapter_03', 'carry-back', 'renvoi intégral'],
  ['chapter_05', "S'amarche bien", 'Cela fonctionne bien'],
  ['chapter_05', "L'mcp_toolset", 'Le jeu d’outils MCP'],
  ['chapter_09', 'Bien gère', 'Bien gérer'],
  ['chapter_11', 'Cet stockage', 'Ce stockage'],
  ['chapter_11', 'La non-déterminisme', 'Le non-déterminisme'],
  ['chapter_11', 'la surface des outils', 'la surface d’outils'],
  ['chapter_11', 'plansIncorrects', 'plans incorrects'],
  ['chapter_15', 'repeint la question', 'répète la question'],
  ['chapter_15', "SDK pour l'agent Claude", 'Claude Agent SDK'],
  ['chapter_15', 'skills', 'Skills'],
];
for (const [id, from, to] of manualFrenchNormalization) {
  const body = content(id);
  body.fr = body.fr.replaceAll(from, to);
}

for (const restored of generatedCards.cards) {
  const target = chapter(restored.chapterId);
  const card = target.blocks
    .filter((block) => block.type === 'flip_cards')
    .flatMap((block) => block.cards || [])
    .find((item) => item.front?.en === restored.front_en);
  if (!card?.back) throw new Error(`Card ${restored.chapterId}:${restored.front_en} is missing.`);
  card.back.en = restored.back_en;
  card.back.fr = restored.back_fr;
}

const tutorialResources = chapter('chapter_11_1');
tutorialResources.title = generatedPatches.unsourced_videos_replacement.title_en === 'No unsourced videos'
  ? { en: 'Practice resources', fr: 'Ressources pratiques' }
  : tutorialResources.title;
tutorialResources.type = 'teaching';
tutorialResources.blocks = [{
  type: 'content',
  body: {
    en: `## ${generatedPatches.unsourced_videos_replacement.title_en}

${generatedPatches.unsourced_videos_replacement.body_en}

- Return to the checkpoints when you need to practise a production decision.
- Verify current API details in the official Claude documentation before implementing an integration.`,
    fr: `## ${generatedPatches.unsourced_videos_replacement.title_fr}

${generatedPatches.unsourced_videos_replacement.body_fr}

- Revenez aux points de contrôle pour vous entraîner à une décision de production.
- Vérifiez les détails actuels de l’API dans la documentation officielle de Claude avant d’implémenter une intégration.`,
  },
}];

const expectedChapters = ['chapter_01', 'chapter_03', 'chapter_05', 'chapter_07', 'chapter_09', 'chapter_11', 'chapter_13', 'chapter_15'];
if (generatedActivities.exercises.length !== expectedChapters.length) throw new Error('Expected eight generated checkpoints.');
const generatedByChapter = new Map(generatedActivities.exercises.map((item) => [item.chapterId, item]));
if (expectedChapters.some((id) => !generatedByChapter.has(id))) throw new Error('Generated checkpoints do not cover each required chapter.');

const checkpoints = expectedChapters.map((chapterId, index) => {
  const generated = generatedByChapter.get(chapterId);
  if (generated.options.filter((option) => option.correct).length !== 1) throw new Error(`Checkpoint ${chapterId} needs one correct answer.`);
  const correction = ['en', 'fr'].reduce((result, language) => {
    result[language] = generated.options.map((option) => `${option.correct ? 'Correct' : 'Incorrect'} — ${option.rationale[language]}`).join('\n\n');
    return result;
  }, {});
  return {
    id: `ex_claude_certified_developer_foundations__02_checkpoint_${String(index + 1).padStart(3, '0')}`,
    chapterId,
    position: 'after_content',
    interactionType: 'single_choice',
    completionRequiresCorrectAnswer: true,
    required: true,
    difficulty: 'developer_foundation',
    title: generated.title,
    prompt: generated.prompt,
    instructions: generated.instructions,
    options: generated.options.map((option) => ({ id: option.id, text: { en: option.en, fr: option.fr }, correct: option.correct })),
    correction,
    skillTags: generated.skillTags,
  };
});
course.exercises = checkpoints;
for (const checkpoint of checkpoints) {
  const target = chapter(checkpoint.chapterId);
  target.blocks = target.blocks.filter((block) => block.type !== 'checkpoint');
  target.blocks.push({ type: 'checkpoint', exerciseId: checkpoint.id });
  target.completionRule = { requires: ['contentViewed', 'requiredExercisesPassed'] };
}

const catalogCourse = catalog.courses.find((item) => item.id === course.courseId);
if (!catalogCourse) throw new Error('Developer course 2 catalog entry is missing.');
catalogCourse.title.en = 'Production-Grade Prompting, Agents & Tool Use';
catalogCourse.title.fr = 'Prompting prêt pour la production, agents et utilisation d’outils';
catalogCourse.officialDurationMinutes = 209;
catalogCourse.chapterCount = 12;
catalogCourse.exerciseCount = 8;
catalogCourse.totalActivities = 8;

const certification = catalog.certifications.find((item) => item.id === 'claude_certified_developer_foundations');
if (!certification) throw new Error('Developer Foundations certification entry is missing.');
const certificationCourses = catalog.courses.filter((item) => item.certId === certification.id);
certification.totalExercises = certificationCourses.reduce((sum, item) => sum + (item.exerciseCount || 0), 0);
certification.totalVideos = certificationCourses.reduce((sum, item) => sum + (item.videoCount || 0), 0);
certification.totalDownloads = certificationCourses.reduce((sum, item) => sum + (item.downloadCount || 0), 0);
const normalizeFrenchTerminology = (value) => {
  if (Array.isArray(value)) return value.forEach(normalizeFrenchTerminology);
  if (!value || typeof value !== 'object') return;
  if (typeof value.fr === 'string') {
    value.fr = value.fr
      .replaceAll('system prompt', 'prompt système')
      .replaceAll('System prompt', 'Prompt système');
  }
  Object.values(value).forEach(normalizeFrenchTerminology);
};
normalizeFrenchTerminology(course);
fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
fs.writeFileSync(indexPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log('Developer course 2 normalized.');
