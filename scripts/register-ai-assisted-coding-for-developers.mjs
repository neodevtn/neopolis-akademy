import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const raw = await fs.readFile(indexPath, "utf8");
const index = JSON.parse(raw);

const certification = {
  id: "datacamp_ai_assisted_coding_for_developers",
  title: {
    en: "DataCamp · AI-Assisted Coding for Developers",
    fr: "DataCamp · Coder avec l’aide de l’IA pour les développeurs",
  },
  description: {
    en: "An authorized DataCamp partner course on using AI coding assistants responsibly for prompting, debugging, documentation, testing, secure workflows, and model selection, with local Projector media and sequential interactive activities.",
    fr: "Un cours partenaire DataCamp autorisé sur l’usage responsable des assistants de codage IA : prompting, débogage, documentation, tests, workflows sécurisés et choix de modèles, avec médias Projector locaux et activités interactives séquentielles.",
  },
  level: { en: "Intermediate", fr: "Intermédiaire" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 3,
  totalExercises: 18,
  totalVideos: 10,
  totalDownloads: 3,
  totalActivities: 28,
  courses: ["ai_assisted_coding_for_developers__01"],
  group: "fullstack_ai_engineering",
  breakdown: {
    en: "3 chapters · 28 activities · 10 Projector lessons · 9 quizzes · 4 drag-and-drop exercises · 5 practical prompting exercises · 3 downloads",
    fr: "3 chapitres · 28 activités · 10 leçons Projector · 9 QCM · 4 tris interactifs · 5 exercices pratiques de prompting · 3 téléchargements",
    chapters: 3,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "ai_assisted_coding_for_developers__01",
  certId: certification.id,
  title: { en: "AI-Assisted Coding for Developers", fr: "Coder avec l’aide de l’IA pour les développeurs" },
  order: 1,
  lessonCount: 3,
  exerciseCount: 18,
  videoCount: 10,
  downloadCount: 3,
  exerciseLabel: certification.exerciseLabel,
  breakdown: certification.breakdown,
  chapterCount: 28,
  totalActivities: 28,
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
