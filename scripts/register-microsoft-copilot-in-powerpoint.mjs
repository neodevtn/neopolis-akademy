import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const index = JSON.parse(await fs.readFile(indexPath, "utf8"));

const certification = {
  id: "datacamp_microsoft_copilot_in_powerpoint",
  title: { en: "DataCamp · Microsoft Copilot in PowerPoint", fr: "DataCamp · Microsoft Copilot dans PowerPoint" },
  description: {
    en: "An authorized DataCamp partner course on building, refining, and analyzing PowerPoint presentations with Microsoft Copilot, using local Projector media and sequential interactive practice.",
    fr: "Un cours partenaire DataCamp autorisé sur la création, l’amélioration et l’analyse de présentations PowerPoint avec Microsoft Copilot, avec médias Projector locaux et pratique interactive séquentielle.",
  },
  level: { en: "Beginner", fr: "Débutant" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 3,
  totalExercises: 13,
  totalVideos: 7,
  totalDownloads: 3,
  totalActivities: 20,
  courses: ["microsoft_copilot_in_powerpoint__01"],
  group: "workplace_ai_productivity",
  breakdown: {
    en: "3 chapters · 20 activities · 7 Projector lessons · 11 autonomous practice exercises · 2 quizzes · 3 downloads",
    fr: "3 chapitres · 20 activités · 7 leçons Projector · 11 TP autonomes · 2 QCM · 3 téléchargements",
    chapters: 3,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "microsoft_copilot_in_powerpoint__01",
  certId: certification.id,
  title: { en: "Microsoft Copilot in PowerPoint", fr: "Microsoft Copilot dans PowerPoint" },
  order: 1,
  lessonCount: 3,
  exerciseCount: 13,
  videoCount: 7,
  downloadCount: 3,
  exerciseLabel: certification.exerciseLabel,
  breakdown: certification.breakdown,
  chapterCount: 20,
  totalActivities: 20,
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
