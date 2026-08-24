import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const index = JSON.parse(await fs.readFile(indexPath, "utf8"));

const certification = {
  id: "datacamp_software_development_with_windsurf",
  title: { en: "DataCamp · Software Development with Windsurf", fr: "DataCamp · Développement logiciel avec Windsurf" },
  description: {
    en: "An authorized DataCamp partner course on Windsurf, Cascade, context-aware development, AI-assisted debugging, secure deployment, and production monitoring with local Projector media and sequential interactive activities.",
    fr: "Un cours partenaire DataCamp autorisé sur Windsurf, Cascade, le développement contextuel, le débogage assisté par IA, le déploiement sécurisé et le suivi de production, avec médias Projector locaux et activités interactives séquentielles.",
  },
  level: { en: "Intermediate", fr: "Intermédiaire" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 3,
  totalExercises: 20,
  totalVideos: 11,
  totalDownloads: 3,
  totalActivities: 31,
  courses: ["software_development_with_windsurf__01"],
  group: "fullstack_ai_engineering",
  breakdown: {
    en: "3 chapters · 31 activities · 11 Projector lessons · 6 quizzes · 5 drag-and-drop exercises · 9 visual interactive exercises · 3 downloads",
    fr: "3 chapitres · 31 activités · 11 leçons Projector · 6 QCM · 5 tris interactifs · 9 exercices visuels interactifs · 3 téléchargements",
    chapters: 3,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "software_development_with_windsurf__01",
  certId: certification.id,
  title: { en: "Software Development with Windsurf", fr: "Développement logiciel avec Windsurf" },
  order: 1,
  lessonCount: 3,
  exerciseCount: 20,
  videoCount: 11,
  downloadCount: 3,
  exerciseLabel: certification.exerciseLabel,
  breakdown: certification.breakdown,
  chapterCount: 31,
  totalActivities: 31,
  videos: [],
};

function upsert(items, entry) {
  const position = items.findIndex((item) => item.id === entry.id);
  if (position >= 0) items[position] = entry;
  else items.push(entry);
}

upsert(index.certifications, certification);
upsert(index.courses, course);
await fs.writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ certification: certification.id, course: course.id }, null, 2));
