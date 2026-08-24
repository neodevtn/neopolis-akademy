import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const raw = await fs.readFile(indexPath, "utf8");
const index = JSON.parse(raw);

const certification = {
  id: "datacamp_advanced_ai_assisted_coding_for_developers",
  title: {
    en: "DataCamp · Advanced AI-Assisted Coding for Developers",
    fr: "DataCamp · Programmation assistée par IA avancée pour les développeurs",
  },
  description: {
    en: "An authorized DataCamp partner course on evidence-based AI-assisted software engineering: production-code analysis, performance, testing, security, architecture, databases, and human–AI collaboration, with local Projector media and sequential interactive activities.",
    fr: "Un cours partenaire DataCamp autorisé sur l’ingénierie logicielle assistée par IA fondée sur les preuves : analyse de code de production, performances, tests, sécurité, architecture, bases de données et collaboration humain‑IA, avec médias Projector locaux et activités interactives séquentielles.",
  },
  level: { en: "Advanced", fr: "Avancé" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 3,
  totalExercises: 22,
  totalVideos: 10,
  totalDownloads: 3,
  totalActivities: 32,
  courses: ["advanced_ai_assisted_coding_for_developers__01"],
  group: "fullstack_ai_engineering",
  breakdown: {
    en: "3 chapters · 32 activities · 10 Projector lessons · 22 interactive exercises · 9 visual exercises · 8 drag-and-drop exercises · 5 quizzes · 3 downloads",
    fr: "3 chapitres · 32 activités · 10 leçons Projector · 22 exercices interactifs · 9 expériences visuelles · 8 tris interactifs · 5 QCM · 3 téléchargements",
    chapters: 3,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "advanced_ai_assisted_coding_for_developers__01",
  certId: certification.id,
  title: { en: "Advanced AI-Assisted Coding for Developers", fr: "Programmation assistée par IA avancée pour les développeurs" },
  order: 1,
  lessonCount: 3,
  exerciseCount: 22,
  videoCount: 10,
  downloadCount: 3,
  exerciseLabel: certification.exerciseLabel,
  breakdown: certification.breakdown,
  chapterCount: 32,
  totalActivities: 32,
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
