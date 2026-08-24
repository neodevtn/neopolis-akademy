import fs from "node:fs/promises";
const file = new URL("../client/src/data/trainingIndex.json", import.meta.url);
const index = JSON.parse(await fs.readFile(file, "utf8"));
const certification = {
  id: "datacamp_ai_for_sales",
  title: { en: "DataCamp · AI for Sales", fr: "DataCamp · L’IA pour les ventes" },
  description: { en: "Authorized DataCamp partner course on using AI for prospecting, personalization, objections, and sales coaching.", fr: "Cours partenaire DataCamp autorisé sur l’usage de l’IA pour la prospection, la personnalisation, les objections et le coaching commercial." },
  level: { en: "Beginner", fr: "Débutant" }, icon: "◆", courseCount: 1, totalLessons: 3, totalExercises: 17, totalVideos: 9, totalDownloads: 0, totalActivities: 26,
  courses: ["ai_for_sales__01"], group: "fullstack_ai_engineering", provider: "datacamp",
  breakdown: { en: "3 chapters · 26 activities · 9 Projector lessons · 17 interactive exercises · 13 guided practical exercises · 2 quizzes · 2 sorting exercises", fr: "3 chapitres · 26 activités · 9 leçons Projector · 17 exercices interactifs · 13 TP guidés · 2 QCM · 2 tris interactifs", chapters: 3 },
  exerciseLabel: { en: "activities", fr: "activités" },
};
const course = { id: "ai_for_sales__01", certId: certification.id, title: { en: "AI for Sales", fr: "L’IA pour les ventes" }, order: 1, lessonCount: 3, exerciseCount: 17, videoCount: 9, downloadCount: 0, chapterCount: 26, totalActivities: 26, exerciseLabel: certification.exerciseLabel, breakdown: certification.breakdown, videos: [] };
for (const [items, entry] of [[index.certifications, certification], [index.courses, course]]) { const i = items.findIndex((item) => item.id === entry.id); if (i < 0) items.push(entry); else items[i] = entry; }
await fs.writeFile(file, `${JSON.stringify(index, null, 2)}\n`);
