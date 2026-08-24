import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const index = JSON.parse(await fs.readFile(indexPath, "utf8"));

const certification = {
  id: "datacamp_microsoft_copilot_in_word",
  title: { en: "DataCamp · Microsoft Copilot in Word", fr: "DataCamp · Microsoft Copilot dans Word" },
  description: {
    en: "An authorized DataCamp partner course on creating, understanding, and refining documents with Microsoft Copilot in Word, using local Projector media and sequential interactive practice.",
    fr: "Un cours partenaire DataCamp autorisé sur la création, la compréhension et l’amélioration de documents avec Microsoft Copilot dans Word, avec médias Projector locaux et pratique interactive séquentielle.",
  },
  level: { en: "Beginner", fr: "Débutant" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 3,
  totalExercises: 19,
  totalVideos: 10,
  totalDownloads: 3,
  totalActivities: 29,
  courses: ["microsoft_copilot_in_word__01"],
  group: "workplace_ai_productivity",
  breakdown: {
    en: "3 chapters · 29 activities · 10 Projector lessons · 14 autonomous practice exercises · 2 drag-and-drop exercises · 3 visual or multiple-choice exercises · 3 downloads",
    fr: "3 chapitres · 29 activités · 10 leçons Projector · 14 TP autonomes · 2 tris interactifs · 3 exercices visuels ou QCM · 3 téléchargements",
    chapters: 3,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "microsoft_copilot_in_word__01",
  certId: certification.id,
  title: { en: "Microsoft Copilot in Word", fr: "Microsoft Copilot dans Word" },
  order: 1,
  lessonCount: 3,
  exerciseCount: 19,
  videoCount: 10,
  downloadCount: 3,
  exerciseLabel: certification.exerciseLabel,
  breakdown: certification.breakdown,
  chapterCount: 29,
  totalActivities: 29,
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
