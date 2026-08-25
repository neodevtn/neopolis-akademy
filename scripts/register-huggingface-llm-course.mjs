import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const indexPath = path.join(root, "client/src/data/trainingIndex.json");
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));

const entry = {
  id: "huggingface_llm_course",
  title: { en: "Hugging Face Learn · LLM Course", fr: "Hugging Face Learn · Cours LLM" },
  description: {
    en: "Authorized Hugging Face Learn course on large language models, Transformers, tokenizers, datasets and training workflows.",
    fr: "Cours Hugging Face Learn autorisé sur les grands modèles de langage, Transformers, tokenizers, jeux de données et workflows d’entraînement.",
  },
  level: { en: "Intermediate", fr: "Intermédiaire" },
  icon: "◆",
  courseCount: 1,
  totalLessons: 14,
  totalExercises: 82,
  totalVideos: 98,
  totalDownloads: 11,
  totalActivities: 103,
  courses: ["huggingface_llm_course__01"],
  group: "fullstack_ai_engineering",
  provider: "huggingface_learn",
  breakdown: {
    en: "14 chapters · 103 activities · 98 source videos · 82 guided checkpoints · 11 downloads",
    fr: "14 chapitres · 103 activités · 98 vidéos source · 82 checkpoints guidés · 11 téléchargements",
    chapters: 14,
  },
  exerciseLabel: { en: "activities", fr: "activités" },
};

const course = {
  id: "huggingface_llm_course__01",
  certId: entry.id,
  title: entry.title,
  order: 1,
  lessonCount: 14,
  exerciseCount: 82,
  videos: [],
  downloadCount: 11,
  chapterCount: 14,
  videoCount: 98,
  totalActivities: 103,
};

const existing = index.certifications.findIndex((item) => item.id === entry.id);
if (existing >= 0) index.certifications[existing] = entry;
else index.certifications.push(entry);

const existingCourse = index.courses.findIndex((item) => item.id === course.id);
if (existingCourse >= 0) index.courses[existingCourse] = course;
else index.courses.push(course);

index.catalogRevision = "2026-08-25-huggingface-learn-r1";
fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(JSON.stringify({ id: entry.id, courses: entry.courses, activities: entry.totalActivities }, null, 2));
