import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const manifestPath = path.join(root, "docs", "training-visual-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const training = {
  id: "claude_science_recherche_medicale",
  slug: "claude-science-pour-la-recherche-medicale",
  title: "Claude Science pour la recherche médicale",
  description: "Parcours français, non clinique et progressif pour organiser une recherche reproductible : méthodes, conformité, données synthétiques et travaux pratiques encadrés.",
  status: "Formation Neopolis Akademy",
  level: "Débutant à avancé",
  languages: ["FR"],
  courseCount: 3,
  activities: 111,
  exercises: 33,
  videos: 2,
  subjectHint: "Recherche médicale non clinique",
  socialFile: "claude_science_recherche_medicale-social.png",
  cardFile: "claude_science_recherche_medicale-card.png",
};

const index = manifest.trainings.findIndex((entry) => entry.id === training.id);
if (index >= 0) manifest.trainings[index] = training;
else manifest.trainings.push(training);
manifest.totalTrainings = manifest.trainings.length;
manifest.generatedAt = new Date().toISOString();
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ updated: training.id, totalTrainings: manifest.totalTrainings }, null, 2));
