import fs from "node:fs";
import path from "node:path";

const coursePath = path.resolve("client/public/data/courses/building_scalable_agentic_systems__01.json");
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const nonReproducibleVisualActivityIds = new Set([
  "dc_ch02_act06",
  "dc_ch02_act07",
  "dc_ch02_act09",
]);

let removedVisualActivities = 0;
for (const lesson of course.lessons) {
  const before = lesson.chapters.length;
  lesson.chapters = lesson.chapters.filter((activity) => !nonReproducibleVisualActivityIds.has(activity.id));
  removedVisualActivities += before - lesson.chapters.length;
}
if (removedVisualActivities !== nonReproducibleVisualActivityIds.size) {
  throw new Error(`Retrait visuel incomplet : ${removedVisualActivities}/${nonReproducibleVisualActivityIds.size}.`);
}

const finalVideo = course.lessons
  .flatMap((lesson) => lesson.chapters)
  .find((activity) => activity.id === "dc_ch03_act09")
  ?.blocks?.find((block) => block.type === "video" && block.projectorSlides?.length);

if (!finalVideo) throw new Error("La leçon Projector finale attendue est introuvable.");

const resourcesSlide = finalVideo.projectorSlides.find((slide) => slide.number === 9);
if (!resourcesSlide) throw new Error("La diapositive de recommandations externes est introuvable.");

resourcesSlide.script = "Les systèmes agentiques transforment en profondeur nos expériences en tant que consommateurs et notre manière de travailler.";
resourcesSlide.content = "";
resourcesSlide.contentLeft = "";
resourcesSlide.contentRight = "";

const cleanVisibleStrings = (value, technical = false) => {
  if (typeof value === "string") {
    return technical ? value : value.replaceAll("Official course slides provided in the local DataCamp package.", "Supports de cours locaux.");
  }
  if (Array.isArray(value)) return value.map((entry) => cleanVisibleStrings(entry, technical));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
    key,
    cleanVisibleStrings(entry, technical || key === "datacampImport"),
  ]));
};

fs.writeFileSync(coursePath, `${JSON.stringify(cleanVisibleStrings(course), null, 2)}\n`);
console.log("Cours Building Scalable Agentic Systems adapté : recommandations DataCamp externes et trois exercices visuels sans image locale retirés.");
