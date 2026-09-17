import fs from "node:fs";
import path from "node:path";
import { storagePut } from "../server/storage";

const root = path.resolve(import.meta.dirname, "..");
const sourceDir = path.join(root, ".work", "datacamp-audit-2026-09-17", "ai-finance-synthetic-resources");
const mapPath = path.join(root, ".work", "datacamp-audit-2026-09-17", "ai-finance-synthetic-resource-map.json");
const resources = {
  harborview_earnings_excerpt: {
    filename: "harborview_earnings_excerpt_neopolis_synthetique.txt",
    contentType: "text/plain; charset=utf-8",
    title: "Extrait de conférence synthétique — Orion Technologies",
    description: "Contenu fictif Neopolis pour les exercices de synthèse ; aucune donnée financière réelle.",
  },
  finwise_brand_guidelines: {
    filename: "finwise_brand_guidelines_neopolis_synthetique.txt",
    contentType: "text/plain; charset=utf-8",
    title: "Lignes directrices synthétiques — FinWise",
    description: "Brief fictif Neopolis pour un assistant de recherche pédagogique ; il ne reproduit aucun document de marque.",
  },
  q3_forecast_data: {
    filename: "q3_forecast_data_neopolis_synthetique.xlsx",
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    title: "Données de prévision synthétiques — Q3",
    description: "Jeu de données fictif Neopolis pour explorer des écarts et scénarios ; il ne soutient aucune décision financière.",
  },
} as const;

const map: Record<string, { title: string; description: string; url: string; fileKey: string }> = {};
for (const [id, resource] of Object.entries(resources)) {
  const content = fs.readFileSync(path.join(sourceDir, resource.filename));
  const upload = await storagePut(`courses/datacamp/ai-finance/synthetic-resources/${resource.filename}`, content, resource.contentType);
  map[id] = { title: resource.title, description: resource.description, url: upload.url, fileKey: upload.key };
}
fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
console.log(JSON.stringify({ mapPath, resourceCount: Object.keys(map).length, map }, null, 2));
