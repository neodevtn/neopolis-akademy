import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const index = JSON.parse(await fs.readFile(indexPath, "utf8"));

const certification = {
  id: "datacamp_ai_for_finance",
  title: { en: "DataCamp · AI for Finance", fr: "DataCamp · L’IA pour la finance" },
  description: {
    en: "An authorized DataCamp partner course on using AI responsibly for financial analysis, research, reporting, and reusable workflows, with local Projector media and sequential interactive practice.",
    fr: "Un cours partenaire DataCamp autorisé sur l’usage responsable de l’IA pour l’analyse financière, la recherche, le reporting et les workflows réutilisables, avec médias Projector locaux et pratique interactive séquentielle.",
  },
  level: { en: "Beginner", fr: "Débutant" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 3,
  totalExercises: 20,
  totalVideos: 10,
  totalDownloads: 3,
  totalActivities: 30,
  courses: ["ai_for_finance__01"],
  group: "bi_data_analytics",
  breakdown: {
    en: "3 chapters · 30 activities · 10 Projector lessons · 11 autonomous finance exercises · 3 quizzes · 6 drag-and-drop exercises · 3 downloads",
    fr: "3 chapitres · 30 activités · 10 leçons Projector · 11 TP finance autonomes · 3 QCM · 6 tris interactifs · 3 téléchargements",
    chapters: 3,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "ai_for_finance__01",
  certId: certification.id,
  title: { en: "AI for Finance", fr: "L’IA pour la finance" },
  order: 1,
  lessonCount: 3,
  exerciseCount: 20,
  videoCount: 10,
  downloadCount: 3,
  exerciseLabel: certification.exerciseLabel,
  breakdown: certification.breakdown,
  chapterCount: 30,
  totalActivities: 30,
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
