#!/usr/bin/env node
/**
 * Applique les corrections confirmées par l’audit Anthropic du 19 août 2026.
 * Le script ne touche ni aux règles de complétion ni au verrouillage séquentiel.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const courseDir = join(root, "client/public/data/courses");

function load(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function save(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function migrateStorageReferences(value) {
  if (typeof value === "string") return value.replaceAll("/manus-storage/", "/api/assets/");
  if (Array.isArray(value)) return value.map(migrateStorageReferences);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, migrateStorageReferences(item)]));
  }
  return value;
}

const catalogPath = join(root, "client/src/data/trainingIndex.json");
const catalog = load(catalogPath);
const catalogTitles = {
  claude_certified_developer_foundations__02: "Production-Grade Prompting, Agents & Tool Use",
  claude_certified_developer_foundations__05: "Accelerators & IP Contribution",
  claude_certified_architect_professional__01: "Claude Platform & Solution Design",
  claude_certified_architect_professional__02: "Enterprise Integration & Production",
};
for (const certification of catalog.certifications || []) {
  for (const course of certification.courses || []) {
    if (catalogTitles[course.id]) course.title.en = catalogTitles[course.id];
  }
}
save(catalogPath, catalog);

const sourceTitles = {
  claude_certified_developer_foundations__01: "MSO Foundations",
  claude_certified_developer_foundations__02: "Production-Grade Prompting, Agents & Tool Use",
  claude_certified_developer_foundations__03: "Claude Code, MCP & Integration",
  claude_certified_developer_foundations__04: "Production Engineering, Evals, and Security",
  claude_certified_developer_foundations__05: "Accelerators & IP Contribution",
  claude_certified_architect_professional__01: "Claude Platform & Solution Design",
  claude_certified_architect_professional__02: "Enterprise Integration & Production",
  claude_certified_architect_professional__03: "Responsible AI, Safety & Risk for Architects",
  claude_certified_architect_professional__04: "Stakeholder Engagement, Lifecycle & GTM",
  claude_certified_architect_professional__05: "Team Enablement & Operational Productivity",
};
for (const [courseId, title] of Object.entries(sourceTitles)) {
  const path = join(courseDir, `${courseId}.json`);
  const course = migrateStorageReferences(load(path));
  const prefix = course.sourceCourseTitle.split(" / ")[0];
  course.sourceCourseTitle = `${prefix} / ${title}`;
  save(path, course);
}

const aiFluencyPath = join(courseDir, "claude_certified_architect_foundations__01.json");
const aiFluency = migrateStorageReferences(load(aiFluencyPath));
const lesson = aiFluency.lessons.find((item) => item.id === "lesson_10");
const exerciseChapter = lesson.chapters.find((item) => item.id === "chapter_02");
const tutorialsChapter = lesson.chapters.find((item) => item.id === "chapter_03");

const officialCallout = {
  type: "callout",
  variant: "info",
  title: { en: "Official Anthropic content", fr: "Contenu officiel Anthropic" },
  body: {
    en: "This reflection activity is part of the official **AI Fluency: Framework & Foundations** course. Complete it before continuing.",
    fr: "Cette activité de réflexion fait partie du cours officiel **AI Fluency: Framework & Foundations**. Réalisez-la avant de poursuivre.",
  },
};
const reflectionContent = {
  type: "content",
  body: {
    en: "## Exercise: Putting Things into Practice\n\n**Objective:** Reflect on your own experiences of collaborating with AI.\n\n**You will need:** Access to a language model, such as Claude at [claude.ai](https://claude.ai) (5–10 minutes). You may also use another language model if you prefer. No paid subscription is required.\n\n### Reflection\n\nBefore moving on, take a moment to consider your own experiences with AI. In the response field below, address all three questions:\n\n1. What challenges have you encountered when working with AI to achieve specific outcomes?\n2. What possibilities for AI collaboration excite you most?\n3. What do you hope to gain from this course?\n\nThere is no single correct response. Be specific and use examples from your work, studies, or daily life.",
    fr: "## Exercice : mettre les choses en pratique\n\n**Objectif :** Réfléchir à vos propres expériences de collaboration avec l’IA.\n\n**Vous aurez besoin :** D’un accès à un modèle de langage, tel que Claude sur [claude.ai](https://claude.ai) (5 à 10 minutes). Vous pouvez également utiliser un autre modèle de langage. Aucun abonnement payant n’est requis.\n\n### Réflexion\n\nAvant de poursuivre, prenez un moment pour considérer vos propres expériences avec l’IA. Dans le champ de réponse ci-dessous, répondez aux trois questions :\n\n1. Quels défis avez-vous rencontrés en travaillant avec l’IA pour atteindre des résultats précis ?\n2. Quelles possibilités de collaboration avec l’IA vous enthousiasment le plus ?\n3. Qu’espérez-vous retirer de ce cours ?\n\nIl n’y a pas une réponse unique correcte. Soyez précis et appuyez-vous sur des exemples issus de votre travail, de vos études ou de votre quotidien.",
  },
};

const download = exerciseChapter.blocks.find((block) => block.type === "download");
if (download) {
  download.download_url = "/api/assets/01_AI_Fluency_vocabulary_cheat_sheet_d44ea415.pdf";
  delete download.image;
}
const checkpoint = exerciseChapter.blocks.find((block) => block.type === "checkpoint");
// Écran canonique : un encadré officiel, une seule consigne de réflexion,
// le checkpoint existant et le téléchargement. La construction explicite
// rend les exécutions ultérieures du script sans effet de duplication.
exerciseChapter.blocks = [officialCallout, reflectionContent, checkpoint, download].filter(Boolean);

const neopolisCallout = {
  type: "callout",
  variant: "info",
  title: { en: "Neopolis supplement", fr: "Complément Neopolis" },
  body: {
    en: "These videos are supplementary resources selected by Neopolis. They are not official Anthropic course content and do not replace the official material above.",
    fr: "Ces vidéos sont des ressources complémentaires sélectionnées par Neopolis. Elles ne constituent pas du contenu officiel Anthropic et ne remplacent pas le matériel officiel présenté ci-dessus.",
  },
};
if (!tutorialsChapter.blocks.some((block) => block.type === "callout" && block.title?.fr === "Complément Neopolis")) {
  tutorialsChapter.blocks.unshift(neopolisCallout);
}

const reflectionExercise = aiFluency.exercises.find((item) => item.id === "ex_claude_certified_architect_foundations__01_010");
Object.assign(reflectionExercise, {
  chapterId: "chapter_02",
  interactionType: "free_text",
  prompt: {
    en: "Write your reflection",
    fr: "Rédigez votre réflexion",
  },
  instructions: {
    en: "Use the three questions in the official content above. Write a short, specific reflection and include an example where possible.",
    fr: "Utilisez les trois questions du contenu officiel ci-dessus. Rédigez une courte réflexion précise et ajoutez un exemple lorsque c’est possible.",
  },
  correction: {
    en: "This is a reflection activity, so there is no single correct answer. A complete response identifies a real challenge, describes a meaningful opportunity for collaboration with AI, and states a personal learning goal for the course.",
    fr: "Il s’agit d’une activité de réflexion : il n’existe pas de réponse unique correcte. Une réponse complète identifie un défi réel, décrit une possibilité de collaboration avec l’IA qui a du sens et formule un objectif personnel pour ce cours.",
  },
  rubric: "Address the three reflection questions with a specific example and a personal learning goal.",
  required: true,
  difficulty: "foundation",
  skillTags: ["AI Fluency", "Prompt Engineering"],
  title: { en: "Exercise: Putting Things into Practice", fr: "Exercice : mettre les choses en pratique" },
});
save(aiFluencyPath, aiFluency);

for (const courseId of [
  "claude_certified_architect_foundations__02",
  "claude_certified_architect_foundations__03",
  "claude_certified_architect_foundations__04",
  "claude_certified_architect_foundations__05",
  "claude_certified_architect_foundations__06",
  "claude_certified_architect_foundations__07",
]) {
  const path = join(courseDir, `${courseId}.json`);
  save(path, migrateStorageReferences(load(path)));
}

console.log("Anthropic audit corrections applied.");
