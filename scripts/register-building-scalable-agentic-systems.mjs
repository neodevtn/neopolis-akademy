import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const raw = await fs.readFile(indexPath, "utf8");
const index = JSON.parse(raw);

const certification = {
  id: "datacamp_building_scalable_agentic_systems",
  title: {
    en: "DataCamp · Building Scalable Agentic Systems",
    fr: "DataCamp · Concevoir des systèmes agentiques évolutifs",
  },
  description: {
    en: "An authorized DataCamp partner course on scalable agent architecture, MCP and A2A interoperability, production testing, monitoring, and resilient deployment, using local Projector media and sequential interactive activities.",
    fr: "Un cours partenaire DataCamp autorisé sur l’architecture d’agents évolutifs, l’interopérabilité MCP et A2A, les tests de production, l’observabilité et les déploiements résilients, avec médias Projector locaux et activités interactives séquentielles.",
  },
  level: { en: "Intermediate", fr: "Intermédiaire" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 3,
  totalExercises: 19,
  totalVideos: 10,
  totalDownloads: 3,
  totalActivities: 29,
  courses: ["building_scalable_agentic_systems__01"],
  group: "claude_ai_agents",
  breakdown: {
    en: "3 chapters · 29 activities · 10 Projector lessons · 9 quizzes · 6 drag-and-drop exercises · 3 visual exercises · 1 chat scenario · 3 downloads",
    fr: "3 chapitres · 29 activités · 10 leçons Projector · 9 QCM · 6 tris interactifs · 3 exercices visuels · 1 scénario de chat · 3 téléchargements",
    chapters: 3,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "building_scalable_agentic_systems__01",
  certId: certification.id,
  title: { en: "Building Scalable Agentic Systems", fr: "Concevoir des systèmes agentiques évolutifs" },
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
  const foundIndex = items.findIndex((item) => item.id === entry.id);
  if (foundIndex >= 0) items[foundIndex] = entry;
  else items.push(entry);
}

upsert(index.certifications, certification);
upsert(index.courses, course);
await fs.writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ certification: certification.id, course: course.id }, null, 2));
