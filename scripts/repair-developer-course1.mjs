import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__01.json');
const indexPath = path.join(root, 'client/src/data/trainingIndex.json');
const activitiesPath = path.join(root, 'docs/anthropic-developer-course1-claude-activities.json');

const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const generatedActivities = JSON.parse(fs.readFileSync(activitiesPath, 'utf8'));
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

course.sourceCourseTitle = 'Claude Certified Developer - Foundations / MSO Foundations';
lesson.title.en = 'MSO Foundations: Developer Module 1';
lesson.title.fr = 'Fondations MSO : Module Développeur 1';
lesson.officialDurationMinutes = 57;
lesson.recommendedVideosManaged = false;
delete lesson.recommendedVideos;

const introduction = content('chapter_01_1');
introduction.en = `## Welcome to Module 01: MSO Foundations

**MSO** means **Model Selection and Optimization**. It is the foundation for choosing and operating Claude deliberately: understand how a model behaves, select the right model and reasoning mode, choose a prompting pattern, and use the technical interface that fits the workload.

### What you'll learn

- How LLMs behave
- Models and reasoning
- Prompting modes
- Technical substrate

### How this module works

Each section builds on the previous one. You will encounter teaching content, interactive checkpoints, and a module quiz. Complete any required activity before moving forward.

**Official duration:** 57 minutes`;
introduction.fr = `## Bienvenue au module 01 : Fondations MSO

**MSO** signifie **Model Selection and Optimization** (sélection et optimisation des modèles). C’est la base pour choisir et utiliser Claude avec discernement : comprendre le comportement d’un modèle, sélectionner le modèle et le mode de raisonnement adaptés, choisir un mode de prompting et utiliser l’interface technique adaptée à la charge de travail.

### Ce que vous allez apprendre

- Comment les LLMs se comportent
- Modèles et raisonnement
- Modes de prompting
- Socle technique

### Comment fonctionne ce module

Chaque section s’appuie sur la précédente. Vous rencontrerez du contenu pédagogique, des points de contrôle interactifs et un quiz de module. Terminez chaque activité obligatoire avant de poursuivre.

**Durée officielle :** 57 minutes`;

const llmBehavior = content('chapter_01');
llmBehavior.fr = llmBehavior.fr
  .replace('Comment se comportent les LLMs : Tokens, Context Window, Sampling, Non-déterminisme\n\nTokens\nContext Window\nSampling\nNon-déterminisme', 'Comment se comportent les LLMs : tokens, fenêtre de contexte, échantillonnage et non-déterminisme\n\n## Tokens\n\n## Fenêtre de contexte\n\n## Échantillonnage\n\n## Non-déterminisme')
  .replace(/Comment se comportent les LLMs : tokens, fenêtre de contexte, échantillonnage et non-déterminisme\n\n(?:## )?Tokens\n\n(?:## )?Fenêtre de contexte\n\n(?:## )?Échantillonnage\n\n(?:## )?Non-déterminisme\n*/g, 'Comment se comportent les LLMs : tokens, fenêtre de contexte, échantillonnage et non-déterminisme\n')
  .replace(/The (?:context window|fenêtre de contexte): a fixed budget/g, '## La fenêtre de contexte : un budget fixe')
  .replaceAll('Les Tokens', 'Les tokens')
  .replaceAll('context window', 'fenêtre de contexte')
  .replaceAll('Context Window', 'Fenêtre de contexte')
  .replaceAll('The fenêtre de contexte: a fixed budget', '## La fenêtre de contexte : un budget fixe')
  .replaceAll('The fenêtre de contexte est', 'La fenêtre de contexte est')
  .replaceAll('Sampling:', 'Échantillonnage :')
  .replaceAll('Sampling', 'Échantillonnage')
  .replaceAll('system prompt', 'prompt système')
  .replaceAll('la window', 'la fenêtre')
  .replaceAll('Une requête dont l’entrée est déjà supérieure à la requête est rejetée', 'Une requête dont l’entrée dépasse déjà la fenêtre de contexte est rejetée')
  .replaceAll('la window se remplit', 'la fenêtre se remplit')
  .replaceAll('Un langage modèle', 'Un modèle de langage')
  .replaceAll('au moment de la build', 'au moment du développement')
  .replaceAll('au moment de la construction', 'au moment du développement')
  .replaceAll('dans la API reference', 'dans la documentation de l’API')
  .replace('Non-déterminisme: ce que cela signifie pour les tests et les evals', 'Non-déterminisme : ce que cela implique pour les tests et les évaluations')
  .replaceAll('un eval avec un juge noté par le modèle', 'une évaluation avec un juge fondé sur un modèle')
  .replaceAll('les evals comme la référence standard', 'les évaluations comme référence standard');

const models = content('chapter_02');
models.fr = models.fr
  .replaceAll('au moment de la construction', 'au moment du développement')
  .replace('Demandez l’affichage résumé sur demande lorsque vous en avez besoin.', 'Demandez un affichage résumé lorsque vous en avez besoin.')
  .replaceAll('thinking blocks', 'blocs de réflexion');

const prompting = content('chapter_03');
prompting.fr = prompting.fr
  .replace('Prompting modes: zero-shot, one-shot, multi-shot\n\nLes Trois Modes\nLe compromis coût-qualité\nMode et choix du modèle', 'Modes de prompting : zero-shot (sans exemple), one-shot (un exemple), multi-shot (plusieurs exemples)\n\n## Les trois modes\n\n## Compromis entre coût et qualité\n\n## Interaction avec le choix du modèle')
  .replaceAll('edge case', 'cas limite')
  .replaceAll('un ou deux exemples corrects permettent', 'un ou deux exemples pertinents permettent');

const quiz = chapter('chapter_05');
const q1 = quiz.blocks.find((block) => block.id === 'q1');
if (!q1) throw new Error('Module quiz question q1 is missing.');
const q1OptionB = q1.options.find((option) => option.id === 'b');
if (!q1OptionB) throw new Error('Module quiz option b is missing.');
q1OptionB.text.en = 'Count the tokens in the input rather than the words, since tokens are the actual unit of measurement, and confirm tokenizer behavior for the specific model at build time.';
q1OptionB.text.fr = 'Compter les tokens dans l’entrée plutôt que les mots, puisque les tokens sont la véritable unité de mesure, et confirmer le comportement du tokenizer pour le modèle spécifique au moment du développement.';

const behavior = chapter('chapter_06');
const flipCards = behavior.blocks.find((block) => block.type === 'flip_cards');
if (!flipCards?.cards) throw new Error('Predict the Behavior cards are missing.');
flipCards.cards = flipCards.cards.filter((card) => card.front?.en !== 'Sources');
const predictCard = flipCards.cards.find((card) => card.front?.en === 'Exercise: predict the behavior');
if (!predictCard) throw new Error('Predict the Behavior card is missing.');
predictCard.back.en = 'Use the five foundations in this module to predict behavior: context capacity, sampling, model choice, prompting pattern, and integration mode. Identify the operating condition that supports your prediction.';
predictCard.back.fr = 'Utilisez les cinq fondations de ce module pour prédire le comportement : capacité de contexte, échantillonnage, choix du modèle, mode de prompting et mode d’intégration. Identifiez la condition de fonctionnement qui soutient votre prédiction.';

const takeaways = content('chapter_08');
takeaways.fr = takeaways.fr
  .replaceAll('How LLMs Behave', 'Comment les LLMs se comportent')
  .replaceAll('Models & Reasoning', 'Modèles et raisonnement')
  .replaceAll('Prompting Modes', 'Modes de prompting')
  .replaceAll('Technical Substrate', 'Socle technique')
  .replaceAll('Predict the Behavior', 'Prédire le comportement')
  .replaceAll('Module 1', 'Module 1');

const resources = chapter('chapter_09');
resources.title = { en: 'Reference resources', fr: 'Ressources de référence' };
resources.type = 'teaching';
resources.blocks = [{
  type: 'content',
  body: {
    en: `## Reference resources\n\nUse the official Claude documentation to verify model availability, API parameters, tokenizer behavior, SDK releases, and current platform limits before building or shipping a feature.\n\n- **Models and API:** platform.claude.com/docs\n- **Implementation practice:** return to the relevant module checkpoint when an operational decision depends on context, prompting, model selection, or integration mode.`,
    fr: `## Ressources de référence\n\nUtilisez la documentation officielle de Claude pour vérifier la disponibilité des modèles, les paramètres d’API, le comportement du tokenizer, les versions des SDK et les limites actuelles de la plateforme avant de développer ou de publier une fonctionnalité.\n\n- **Modèles et API :** platform.claude.com/docs\n- **Mise en pratique :** revenez au point de contrôle du module concerné lorsqu’une décision opérationnelle dépend du contexte, du prompting, du choix de modèle ou du mode d’intégration.`,
  },
}];

const expectedChapters = ['chapter_01', 'chapter_02', 'chapter_03', 'chapter_04', 'chapter_06'];
if (generatedActivities.exercises.length !== expectedChapters.length) throw new Error('Expected five generated checkpoints.');
const generatedByChapter = new Map(generatedActivities.exercises.map((item) => [item.chapterId, item]));
if (expectedChapters.some((chapterId) => !generatedByChapter.has(chapterId))) throw new Error('Generated checkpoints do not cover all required chapters.');

const checkpoints = expectedChapters.map((chapterId, index) => {
  const generated = generatedByChapter.get(chapterId);
  const correctCount = generated.options.filter((option) => option.correct).length;
  if (correctCount !== 1) throw new Error(`Checkpoint ${chapterId} must have exactly one correct option.`);
  return {
    id: `ex_claude_certified_developer_foundations__01_checkpoint_${String(index + 1).padStart(3, '0')}`,
    chapterId,
    position: 'after_content',
    interactionType: 'single_choice',
    completionRequiresCorrectAnswer: true,
    required: true,
    difficulty: 'foundation',
    title: generated.title,
    prompt: generated.prompt,
    instructions: generated.instructions,
    options: generated.options.map((option) => ({ id: option.id, text: { en: option.en, fr: option.fr }, correct: option.correct })),
    correction: generated.correction,
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
if (!catalogCourse) throw new Error(`Catalog entry missing for ${course.courseId}.`);
catalogCourse.title.en = 'MSO Foundations';
catalogCourse.title.fr = 'Fondations MSO';
catalogCourse.officialDurationMinutes = 57;
catalogCourse.chapterCount = 10;
catalogCourse.exerciseCount = 6;
catalogCourse.totalActivities = 6;
catalogCourse.videoCount = 0;
catalogCourse.downloadCount = 0;
catalogCourse.videos = [];

const developerCertification = catalog.certifications.find((item) => item.id === 'claude_certified_developer_foundations');
if (!developerCertification) throw new Error('Developer Foundations certification entry is missing.');
const developerCourses = catalog.courses.filter((item) => item.certId === developerCertification.id);
developerCertification.totalLessons = developerCourses.reduce((sum, item) => sum + (item.lessonCount || 0), 0);
developerCertification.totalExercises = developerCourses.reduce((sum, item) => sum + (item.exerciseCount || 0), 0);
developerCertification.totalVideos = developerCourses.reduce((sum, item) => sum + (item.videoCount || 0), 0);
developerCertification.totalDownloads = developerCourses.reduce((sum, item) => sum + (item.downloadCount || 0), 0);

fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
fs.writeFileSync(indexPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log('Developer course 1 normalized.');
