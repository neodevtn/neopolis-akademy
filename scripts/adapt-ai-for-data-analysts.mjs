import fs from "node:fs";
import path from "node:path";

const coursePath = path.resolve("client/public/data/courses/ai_for_data_analysts__01.json");
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const removedActivityIds = new Set(["dc_ch01_act02", "dc_ch04_act02"]);

const localized = (fr) => ({ fr, en: fr });
const replacements = [
  [/Assistant de données IA de DataCamp/gi, "assistant de données IA"],
  [/outil d’analytique I-A de DataCamp/gi, "activité d’analyse guidée"],
  [/outil d'analytique I-A de DataCamp/gi, "activité d’analyse guidée"],
  [/outil d’analytique IA de DataCamp/gi, "activité d’analyse guidée"],
  [/outil d'analytique IA de DataCamp/gi, "activité d’analyse guidée"],
  [/Official course slides provided in the local DataCamp package\./gi, "Supports de cours locaux."],
  [/AI Engineering Curriculum Manager, DataCamp/gi, "Responsable pédagogique IA"],
];

const cleanVisibleStrings = (value, technical = false) => {
  if (typeof value === "string") {
    if (technical) return value;
    return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
  }
  if (Array.isArray(value)) return value.map((entry) => cleanVisibleStrings(entry, technical));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
    key,
    cleanVisibleStrings(entry, technical || key === "datacampImport"),
  ]));
};

for (const lesson of course.lessons) {
  lesson.chapters = lesson.chapters.filter((activity) => !removedActivityIds.has(activity.id));
}

const chapterOneQuestion = course.lessons
  .flatMap((lesson) => lesson.chapters)
  .find((activity) => activity.id === "dc_ch01_act03")
  ?.blocks?.find((block) => block.id === "dc_1_act_03_qcm_multiple");

if (!chapterOneQuestion) throw new Error("Le QCM 1.3 attendu est introuvable.");
chapterOneQuestion.question = localized(
  "Dans le scénario The Daily Grind, la même question neutre posée deux fois sur les ventes a conduit à deux réponses légèrement différentes, alors que la recommandation de fond est restée la même. Quel risque lié à l’IA cela illustre-t-il le plus clairement ?",
);

const adapted = cleanVisibleStrings(course);
fs.writeFileSync(coursePath, `${JSON.stringify(adapted, null, 2)}\n`);
console.log("Cours AI for Data Analysts adapté : 2 activités EmbeddedApp sans actif local ni réponse déterministe retirées.");
