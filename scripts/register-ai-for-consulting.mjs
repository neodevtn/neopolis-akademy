import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const index = JSON.parse(await fs.readFile(indexPath, "utf8"));

const certification = {
  id: "datacamp_ai_for_consulting",
  title: { en: "DataCamp · AI for Consulting", fr: "DataCamp · L’IA pour le conseil" },
  description: {
    en: "An authorized DataCamp partner course on applying AI responsibly across research, analysis, storytelling, visualization, and decision support in consulting engagements, with local Projector media.",
    fr: "Un cours partenaire DataCamp autorisé sur l’usage responsable de l’IA dans la recherche, l’analyse, la narration, la visualisation et l’aide à la décision en conseil, avec médias Projector locaux.",
  },
  level: { en: "Beginner", fr: "Débutant" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 3,
  totalExercises: 20,
  totalVideos: 11,
  totalDownloads: 3,
  totalActivities: 31,
  courses: ["ai_for_consulting__01"],
  group: "workplace_ai_productivity",
  breakdown: {
    en: "3 chapters · 31 activities · 11 Projector lessons · 17 hands-on practices · 1 drag-and-drop exercise · 2 quizzes · 3 downloads",
    fr: "3 chapitres · 31 activités · 11 leçons Projector · 17 TP autonomes · 1 tri interactif · 2 QCM · 3 téléchargements",
    chapters: 3,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "ai_for_consulting__01",
  certId: certification.id,
  title: { en: "AI for Consulting", fr: "L’IA pour le conseil" },
  order: 1,
  lessonCount: 3,
  exerciseCount: 20,
  videoCount: 11,
  downloadCount: 3,
  totalActivities: 31,
  chapterCount: 31,
  exerciseLabel: certification.exerciseLabel,
  breakdown: certification.breakdown,
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
