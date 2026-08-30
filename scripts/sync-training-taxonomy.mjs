import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "client/src/data/trainingIndex.json");
const catalog = JSON.parse(fs.readFileSync(indexPath, "utf8"));

catalog.trainingFormats = [
  { id: "certification_preparation", title: { fr: "Préparation aux certifications", en: "Certification preparation" }, order: 1 },
  { id: "formation", title: { fr: "Formation", en: "Course" }, order: 2 },
  { id: "tutorial_tp", title: { fr: "Tutoriel / TP", en: "Tutorial / practical exercise" }, order: 3 },
];

for (const certification of catalog.certifications || []) {
  certification.trainingFormat = certification.isStandaloneTP === true
    ? "tutorial_tp"
    : certification.group === "anthropic_certification_preparation"
      ? "certification_preparation"
      : "formation";
}

catalog.catalogRevision = "2026-08-29-training-taxonomy";
fs.writeFileSync(indexPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Taxonomie synchronisée : ${(catalog.certifications || []).length} formations, ${(catalog.trainingFormats || []).length} sous-catégories de formation.`);
