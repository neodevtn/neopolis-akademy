import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const index = JSON.parse(await fs.readFile(indexPath, "utf8"));

const certification = {
  id: "datacamp_ai_for_data_analysts",
  title: { en: "DataCamp · AI for Data Analysts", fr: "DataCamp · L’IA pour les data analysts" },
  description: {
    en: "An authorized DataCamp partner course on AI-augmented data analysis: defensible prompting, data-quality review, insight validation, dashboard prototyping, and responsible decision support with local Projector media.",
    fr: "Un cours partenaire DataCamp autorisé sur l’analyse de données augmentée par l’IA : prompts défendables, audit de qualité, validation d’insights, prototypage de tableaux de bord et aide responsable à la décision avec médias Projector locaux.",
  },
  level: { en: "Beginner", fr: "Débutant" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 4,
  totalExercises: 28,
  totalVideos: 11,
  totalDownloads: 4,
  totalActivities: 39,
  courses: ["ai_for_data_analysts__01"],
  group: "bi_data_analytics",
  breakdown: {
    en: "4 chapters · 39 activities · 11 Projector lessons · 21 visual interactive exercises · 4 drag-and-drop exercises · 3 quizzes · 4 downloads",
    fr: "4 chapitres · 39 activités · 11 leçons Projector · 21 exercices visuels interactifs · 4 tris interactifs · 3 QCM · 4 téléchargements",
    chapters: 4,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "ai_for_data_analysts__01",
  certId: certification.id,
  title: { en: "AI for Data Analysts", fr: "L’IA pour les data analysts" },
  order: 1,
  lessonCount: 4,
  exerciseCount: 28,
  videoCount: 11,
  downloadCount: 4,
  exerciseLabel: certification.exerciseLabel,
  breakdown: certification.breakdown,
  chapterCount: 39,
  totalActivities: 39,
  videos: [],
};

function upsert(items, entry) {
  const index = items.findIndex((item) => item.id === entry.id);
  if (index >= 0) items[index] = entry;
  else items.push(entry);
}

upsert(index.certifications, certification);
upsert(index.courses, course);
await fs.writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ certification: certification.id, course: course.id }, null, 2));
