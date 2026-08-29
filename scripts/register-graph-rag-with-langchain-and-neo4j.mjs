import fs from "node:fs/promises";

const indexPath = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const coursePath = new URL("../client/public/data/courses/graph_rag_with_langchain_and_neo4j__01.json", import.meta.url);
const [index, courseData] = await Promise.all([indexPath, coursePath].map(async (file) => JSON.parse(await fs.readFile(file, "utf8"))));

const interactive = new Set(["exercise", "single_choice_exercise", "multi_choice_exercise", "multi_choice", "matching", "bucket_sort", "fill_blank", "code_repl", "terminal_sim", "ai_evaluation", "ordering", "cloud_exercise", "resource_review"]);
const activities = courseData.lessons.flatMap((lesson) => lesson.chapters || []);
const blocks = activities.flatMap((activity) => activity.blocks || []);
const downloads = new Set(blocks.flatMap((block) => [block.url, block.downloadUrl, block.fileUrl, block.slidesPdf, ...(block.resources || []).map((resource) => resource?.url), ...(block.downloads || []).map((download) => download?.url || download)]).filter((url) => typeof url === "string" && url.trim()));
const metric = {
  lessonCount: courseData.lessons.length,
  chapterCount: activities.length,
  exerciseCount: blocks.filter((block) => interactive.has(block.type)).length,
  videoCount: blocks.filter((block) => block.type === "video").length,
  downloadCount: downloads.size + blocks.filter((block) => (block.type === "download" || block.type === "file_download") && !block.url && !block.downloadUrl && !block.fileUrl && !block.slidesPdf).length,
  totalActivities: activities.length,
};

const certification = {
  id: "datacamp_graph_rag_with_langchain_and_neo4j",
  title: { en: "DataCamp · Graph RAG with LangChain and Neo4j", fr: "DataCamp · Graph RAG avec LangChain et Neo4j" },
  description: { en: "Authorized DataCamp partner course on Graph RAG, hybrid retrieval and long-term graph memory.", fr: "Cours partenaire DataCamp autorisé sur le Graph RAG, la récupération hybride et la mémoire graphe." },
  level: { en: "Advanced", fr: "Avancé" },
  icon: "◆",
  courseCount: 1,
  totalLessons: metric.lessonCount,
  totalExercises: metric.exerciseCount,
  totalVideos: metric.videoCount,
  totalDownloads: metric.downloadCount,
  totalActivities: metric.totalActivities,
  courses: ["graph_rag_with_langchain_and_neo4j__01"],
  group: "fullstack_ai_engineering",
  provider: "datacamp",
};
const course = {
  id: "graph_rag_with_langchain_and_neo4j__01",
  certId: certification.id,
  title: { en: "Graph RAG with LangChain and Neo4j", fr: "Graph RAG avec LangChain et Neo4j" },
  order: 1,
  ...metric,
  videos: [],
};
for (const [items, entry] of [[index.certifications, certification], [index.courses, course]]) {
  const position = items.findIndex((item) => item.id === entry.id);
  if (position < 0) items.push(entry);
  else items[position] = entry;
}
await fs.writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);
