import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const coursePath = path.join(root, "client", "public", "data", "courses", "building_agentic_workflows_with_llamaindex__01.json");
const indexPath = path.join(root, "client", "src", "data", "trainingIndex.json");
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));

const discoveryDescription = {
  fr: "Ce parcours de découverte présente les concepts essentiels de LlamaIndex, des agents avec état et des systèmes multi-agents. La version Neopolis disponible comprend cinq leçons vidéo séquentielles et deux supports téléchargeables ; elle ne comprend pas de TP exécutable ni d’environnement de code intégré.",
  en: "This discovery pathway introduces LlamaIndex fundamentals, stateful agents, and multi-agent systems. The available Neopolis version contains five sequential video lessons and two downloadable supports; it does not include an executable practical exercise or integrated coding environment.",
};
const welcomeContent = {
  fr: "## Avant de commencer\n\nCe parcours est une **découverte vidéo** : vous suivrez cinq leçons séquentielles et pourrez télécharger deux supports de chapitre depuis Neopolis. Aucun compte externe, environnement Python, clé API ou fichier de configuration n’est requis pour le terminer.\n\nLes activités pratiques qui nécessitaient un environnement externe ne sont pas incluses, car aucun critère de réussite vérifiable n’était fourni pour les adapter sans inventer une évaluation. Avancez en visionnant chaque leçon et en utilisant les supports pour consolider les concepts.",
  en: "## Before you start\n\nThis is a **video discovery pathway**: you will complete five sequential lessons and may download two chapter supports from Neopolis. No external account, Python environment, API key, or configuration file is required to finish it.\n\nPractical activities that required an external environment are not included because no verifiable success criteria were supplied to adapt them without inventing an assessment. Progress by watching each lesson and using the supports to consolidate the concepts.",
};

course.datacampImport = {
  ...course.datacampImport,
  delivered: {
    chapters: 2,
    activities: 5,
    videos: 5,
    downloads: 2,
    interactiveExercises: 0,
    excludedSourcePracticalActivities: 10,
    exclusionReason: "No source-supplied, verifiable rubric was available for adapting external-environment practical activities without inventing evaluation criteria.",
  },
};
for (const lesson of course.lessons ?? []) {
  lesson.description = discoveryDescription;
  for (const chapter of lesson.chapters ?? []) {
    chapter.description = discoveryDescription;
    for (const block of chapter.blocks ?? []) {
      if (block.id === "neopolis_building_agentic_workflows_with_llamaindex__01_environment_preparation") block.body = welcomeContent;
      if (block.id === "dc_ch01_slides") block.title = { fr: "Support du chapitre 1", en: "Chapter 1 support" };
      if (block.id === "dc_ch02_slides") block.title = { fr: "Support du chapitre 2", en: "Chapter 2 support" };
    }
  }
}
fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);

const training = index.certifications?.find((entry) => entry.id === "datacamp_building_agentic_workflows_with_llamaindex");
if (!training) throw new Error("LlamaIndex training index entry missing.");
training.description = {
  fr: "Parcours intermédiaire de découverte des agents IA avec état et des workflows coordonnés avec LlamaIndex.",
  en: "Intermediate discovery pathway covering stateful AI agents and coordinated workflows with LlamaIndex.",
};
training.totalLessons = 2;
training.totalActivities = 5;
training.totalExercises = 0;
training.totalVideos = 5;
training.totalDownloads = 2;
training.breakdown = {
  fr: "2 chapitres · 5 leçons vidéo · 2 téléchargements",
  en: "2 chapters · 5 video lessons · 2 downloads",
  chapters: 2,
};
fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(JSON.stringify({ courseId: course.courseId, delivered: course.datacampImport.delivered, breakdown: training.breakdown }, null, 2));
