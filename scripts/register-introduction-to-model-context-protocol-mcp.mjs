import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const index = JSON.parse(await fs.readFile(indexPath, "utf8"));

const certification = {
  id: "datacamp_introduction_to_model_context_protocol_mcp",
  title: { en: "DataCamp · Introduction to Model Context Protocol (MCP)", fr: "DataCamp · Introduction au Model Context Protocol (MCP)" },
  description: {
    en: "An authorized DataCamp partner course on designing, connecting, securing, and evaluating Model Context Protocol servers and clients using local Projector media and sequential interactive practice.",
    fr: "Un cours partenaire DataCamp autorisé sur la conception, la connexion, la sécurisation et l’évaluation de serveurs et clients Model Context Protocol, avec médias Projector locaux et pratique interactive séquentielle.",
  },
  level: { en: "Intermediate", fr: "Intermédiaire" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 3,
  totalExercises: 23,
  totalVideos: 11,
  totalDownloads: 3,
  totalActivities: 34,
  courses: ["introduction_to_model_context_protocol_mcp__01"],
  group: "fullstack_ai_engineering",
  breakdown: {
    en: "3 chapters · 34 activities · 11 Projector lessons · 18 autonomous MCP exercises · 3 drag-and-drop exercises · 3 downloads",
    fr: "3 chapitres · 34 activités · 11 leçons Projector · 18 TP MCP autonomes · 3 tris interactifs · 3 téléchargements",
    chapters: 3,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
  provider: "datacamp",
};

const course = {
  id: "introduction_to_model_context_protocol_mcp__01",
  certId: certification.id,
  title: { en: "Introduction to Model Context Protocol (MCP)", fr: "Introduction au Model Context Protocol (MCP)" },
  order: 1,
  lessonCount: 3,
  exerciseCount: 23,
  videoCount: 11,
  downloadCount: 3,
  exerciseLabel: certification.exerciseLabel,
  breakdown: certification.breakdown,
  chapterCount: 34,
  totalActivities: 34,
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
