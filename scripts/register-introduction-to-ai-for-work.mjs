import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const raw = await fs.readFile(indexPath, "utf8");
const index = JSON.parse(raw);

const certification = {
  id: "datacamp_introduction_to_ai_for_work",
  title: {
    en: "DataCamp · Introduction to AI for Work",
    fr: "DataCamp · Introduction à l’IA pour le travail",
  },
  description: {
    en: "An authorized DataCamp partner course introducing artificial intelligence, AI productivity, prompt engineering, and responsible use through local Projector media and sequential interactive activities.",
    fr: "Un cours partenaire DataCamp autorisé pour découvrir l’intelligence artificielle, la productivité assistée par IA, l’ingénierie des prompts et les usages responsables, avec médias Projector locaux et activités interactives séquentielles.",
  },
  level: { en: "Beginner", fr: "Débutant" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 4,
  totalExercises: 22,
  totalVideos: 11,
  totalDownloads: 4,
  totalActivities: 33,
  courses: ["introduction_to_ai_for_work__01"],
  group: "workplace_ai_productivity",
  breakdown: {
    en: "4 chapters · 33 activities · 11 Projector lessons · 5 quizzes · 9 drag-and-drop exercises · 8 visual exercises · 4 downloads",
    fr: "4 chapitres · 33 activités · 11 leçons Projector · 5 QCM · 9 tris interactifs · 8 exercices visuels · 4 téléchargements",
    chapters: 4,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "introduction_to_ai_for_work__01",
  certId: certification.id,
  title: { en: "Introduction to AI for Work", fr: "Introduction à l’IA pour le travail" },
  order: 1,
  lessonCount: 4,
  exerciseCount: 22,
  videoCount: 11,
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
