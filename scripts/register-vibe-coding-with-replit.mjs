import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const raw = await fs.readFile(indexPath, "utf8");
const index = JSON.parse(raw);

const certification = {
  id: "datacamp_vibe_coding_with_replit",
  title: { en: "DataCamp · Vibe Coding with Replit", fr: "DataCamp · Coder en mode Vibe avec Replit" },
  description: {
    en: "An authorized DataCamp partner course on responsible vibe coding with Replit: prompt and context engineering, iterative app development, quality control, security, and deployment, with local Projector media and sequential interactive activities.",
    fr: "Un cours partenaire DataCamp autorisé sur le vibe coding responsable avec Replit : ingénierie du prompt et du contexte, développement itératif d’applications, contrôle qualité, sécurité et déploiement, avec médias Projector locaux et activités interactives séquentielles.",
  },
  level: { en: "Beginner", fr: "Débutant" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 4,
  totalExercises: 19,
  totalVideos: 14,
  totalDownloads: 4,
  totalActivities: 33,
  courses: ["vibe_coding_with_replit__01"],
  group: "fullstack_ai_engineering",
  breakdown: {
    en: "4 chapters · 33 activities · 14 Projector lessons · 6 quizzes · 6 drag-and-drop exercises · 7 visual interactive exercises · 4 downloads",
    fr: "4 chapitres · 33 activités · 14 leçons Projector · 6 QCM · 6 tris interactifs · 7 exercices visuels interactifs · 4 téléchargements",
    chapters: 4,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "vibe_coding_with_replit__01",
  certId: certification.id,
  title: { en: "Vibe Coding with Replit", fr: "Coder en mode Vibe avec Replit" },
  order: 1,
  lessonCount: 4,
  exerciseCount: 19,
  videoCount: 14,
  downloadCount: 4,
  exerciseLabel: certification.exerciseLabel,
  breakdown: certification.breakdown,
  chapterCount: 33,
  totalActivities: 33,
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
