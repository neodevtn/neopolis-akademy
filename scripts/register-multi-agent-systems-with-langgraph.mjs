import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const index = JSON.parse(await fs.readFile(indexPath, "utf8"));

const certification = {
  id: "datacamp_multi_agent_systems_with_langgraph",
  title: { en: "DataCamp · Multi-Agent Systems with LangGraph", fr: "DataCamp · Systèmes multi-agents avec LangGraph" },
  description: {
    en: "An authorized DataCamp partner course on building graph-based, swarm, and supervisor multi-agent systems with LangGraph, using local Projector media and sequential hands-on practice.",
    fr: "Un cours partenaire DataCamp autorisé sur la conception de systèmes multi-agents à graphes, en essaim et supervisés avec LangGraph, avec médias Projector locaux et pratique séquentielle.",
  },
  level: { en: "Intermediate", fr: "Intermédiaire" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 2,
  totalExercises: 9,
  totalVideos: 4,
  totalDownloads: 2,
  totalActivities: 13,
  courses: ["multi_agent_systems_with_langgraph__01"],
  group: "fullstack_ai_engineering",
  breakdown: {
    en: "2 chapters · 13 activities · 4 Projector lessons · 9 autonomous LangGraph exercises · 2 downloads",
    fr: "2 chapitres · 13 activités · 4 leçons Projector · 9 TP LangGraph autonomes · 2 téléchargements",
    chapters: 2,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "multi_agent_systems_with_langgraph__01",
  certId: certification.id,
  title: { en: "Multi-Agent Systems with LangGraph", fr: "Systèmes multi-agents avec LangGraph" },
  order: 1,
  lessonCount: 2,
  exerciseCount: 9,
  videoCount: 4,
  downloadCount: 2,
  exerciseLabel: certification.exerciseLabel,
  breakdown: certification.breakdown,
  chapterCount: 13,
  totalActivities: 13,
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
