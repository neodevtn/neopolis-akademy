import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const index = JSON.parse(await fs.readFile(indexPath, "utf8"));

const certification = {
  id: "datacamp_ai_for_human_resources",
  title: { en: "DataCamp · AI for Human Resources", fr: "DataCamp · L’IA pour les ressources humaines" },
  description: {
    en: "An authorized DataCamp partner course on responsible AI for fairer recruiting, people operations, HR agents, privacy, and workforce decision support, with local Projector media.",
    fr: "Un cours partenaire DataCamp autorisé sur l’IA responsable appliquée au recrutement équitable, aux opérations RH, aux agents RH, à la confidentialité et à l’aide à la décision, avec médias Projector locaux.",
  },
  level: { en: "Beginner", fr: "Débutant" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 3,
  totalExercises: 21,
  totalVideos: 11,
  totalDownloads: 3,
  totalActivities: 32,
  courses: ["ai_for_human_resources__01"],
  group: "workplace_ai_productivity",
  breakdown: {
    en: "3 chapters · 32 activities · 11 Projector lessons · 16 hands-on practices · 5 drag-and-drop exercises · 3 downloads",
    fr: "3 chapitres · 32 activités · 11 leçons Projector · 16 TP autonomes · 5 tris interactifs · 3 téléchargements",
    chapters: 3,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "ai_for_human_resources__01",
  certId: certification.id,
  title: { en: "AI for Human Resources", fr: "L’IA pour les ressources humaines" },
  order: 1,
  lessonCount: 3,
  exerciseCount: 21,
  videoCount: 11,
  downloadCount: 3,
  totalActivities: 32,
  chapterCount: 32,
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
