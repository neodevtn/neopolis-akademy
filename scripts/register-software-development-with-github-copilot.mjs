import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const raw = await fs.readFile(indexPath, "utf8");
const index = JSON.parse(raw);

const certification = {
  id: "datacamp_software_development_with_github_copilot",
  title: { en: "DataCamp · Software Development with GitHub Copilot", fr: "DataCamp · Développement logiciel avec GitHub Copilot" },
  description: {
    en: "An authorized DataCamp partner course on responsible GitHub Copilot use, context engineering, customization, testing, security, and performance, with local Projector media and sequential interactive activities.",
    fr: "Un cours partenaire DataCamp autorisé sur l’usage responsable de GitHub Copilot, l’ingénierie du contexte, la personnalisation, les tests, la sécurité et les performances, avec médias Projector locaux et activités interactives séquentielles.",
  },
  level: { en: "Intermediate", fr: "Intermédiaire" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 4,
  totalExercises: 27,
  totalVideos: 13,
  totalDownloads: 4,
  totalActivities: 40,
  courses: ["software_development_with_github_copilot__01"],
  group: "fullstack_ai_engineering",
  breakdown: {
    en: "4 chapters · 40 activities · 13 Projector lessons · 8 quizzes · 13 drag-and-drop exercises · 6 visual interactive exercises · 4 downloads",
    fr: "4 chapitres · 40 activités · 13 leçons Projector · 8 QCM · 13 tris interactifs · 6 exercices visuels interactifs · 4 téléchargements",
    chapters: 4,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "software_development_with_github_copilot__01",
  certId: certification.id,
  title: { en: "Software Development with GitHub Copilot", fr: "Développement logiciel avec GitHub Copilot" },
  order: 1,
  lessonCount: 4,
  exerciseCount: 27,
  videoCount: 13,
  downloadCount: 4,
  exerciseLabel: certification.exerciseLabel,
  breakdown: certification.breakdown,
  chapterCount: 40,
  totalActivities: 40,
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
