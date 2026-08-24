import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const index = JSON.parse(await fs.readFile(indexPath, "utf8"));

const certification = {
  id: "datacamp_deploying_ai_into_production_with_fastapi",
  title: { en: "DataCamp · Deploying AI into Production with FastAPI", fr: "DataCamp · Déployer l’IA en production avec FastAPI" },
  description: {
    en: "An authorized DataCamp partner course on deploying, securing, optimizing, versioning, and monitoring production AI APIs with FastAPI and Pydantic, using local Projector media and sequential interactive activities.",
    fr: "Un cours partenaire DataCamp autorisé sur le déploiement, la sécurisation, l’optimisation, le versionnement et la supervision d’API d’IA en production avec FastAPI et Pydantic, avec médias Projector locaux et activités interactives séquentielles.",
  },
  level: { en: "Intermediate", fr: "Intermédiaire" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 4,
  totalExercises: 32,
  totalVideos: 14,
  totalDownloads: 4,
  totalActivities: 46,
  courses: ["deploying_ai_into_production_with_fastapi__01"],
  group: "fullstack_ai_engineering",
  breakdown: {
    en: "4 chapters · 46 activities · 14 Projector lessons · 32 interactive coding exercises · 22 guided practical exercises · 9 code editors · 1 drag-and-drop exercise · 4 downloads",
    fr: "4 chapitres · 46 activités · 14 leçons Projector · 32 exercices de code interactifs · 22 TP guidés · 9 éditeurs de code · 1 tri interactif · 4 téléchargements",
    chapters: 4,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "deploying_ai_into_production_with_fastapi__01",
  certId: certification.id,
  title: { en: "Deploying AI into Production with FastAPI", fr: "Déployer l’IA en production avec FastAPI" },
  order: 1,
  lessonCount: 4,
  exerciseCount: 32,
  videoCount: 14,
  downloadCount: 4,
  exerciseLabel: certification.exerciseLabel,
  breakdown: certification.breakdown,
  chapterCount: 46,
  totalActivities: 46,
  videos: [],
};

function upsert(items, entry) {
  const foundIndex = items.findIndex((item) => item.id === entry.id);
  if (foundIndex >= 0) items[foundIndex] = entry;
  else items.push(entry);
}

upsert(index.certifications, certification);
upsert(index.courses, course);
await fs.writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ certification: certification.id, course: course.id }, null, 2));
