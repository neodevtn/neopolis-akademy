import fs from "node:fs";
import path from "node:path";
import { storagePut } from "../server/storage";

const root = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(root, ".work", "datacamp-audit-2026-09-17", "ai-marketing-synthetic-resources");
const mapPath = path.join(root, ".work", "datacamp-audit-2026-09-17", "ai-marketing-synthetic-resource-map.json");
fs.mkdirSync(outputDir, { recursive: true });

const resources = {
  customer_pain_points: {
    filename: "customer_pain_points_neopolis_synthetique.txt",
    contentType: "text/plain; charset=utf-8",
    title: "Points de douleur synthétiques — équipes à distance",
    description: "Jeu de besoins fictifs Neopolis à utiliser uniquement pour ce TP ; il ne reproduit aucun fichier source DataCamp.",
    content: `DONNÉES SYNTHÉTIQUES NEOPOLIS — EXERCICE UNIQUEMENT\n\n- Les responsables de projet perdent du temps à rechercher le statut des tâches entre plusieurs outils.\n- Les décisions prises en réunion ne sont pas toujours accessibles aux membres absents.\n- Les messages urgents interrompent fréquemment le travail concentré.\n- Les équipes distantes ont besoin d’un lieu clair pour les priorités, les échéances et les responsabilités.\n- Les comptes rendus doivent être courts, actionnables et faciles à retrouver.\n`,
  },
  article_outline: {
    filename: "article_outline_neopolis_synthetique.txt",
    contentType: "text/plain; charset=utf-8",
    title: "Plan d’article synthétique — équipes à distance",
    description: "Plan fictif Neopolis pour exercer la rédaction ; il ne reprend aucun fichier source DataCamp.",
    content: `PLAN SYNTHÉTIQUE NEOPOLIS — EXERCICE UNIQUEMENT\n\nTitre : How to Eliminate Context Switching and Keep Remote Teams in Sync\n\nTL;DR : Les équipes à distance réduisent les changements de contexte en centralisant les priorités, les décisions et les rituels de suivi.\n\n1. Le coût caché du changement de contexte\n2. Identifier les informations qui se dispersent\n3. Mettre en place une source de vérité partagée\n4. Structurer les mises à jour asynchrones\n5. Mesurer l’amélioration sans surveiller les personnes\n`,
  },
  zenleaf_logo: {
    filename: "zenleaf_logo_neopolis_synthetique.svg",
    contentType: "image/svg+xml",
    title: "Repère visuel synthétique — ZenLeaf",
    description: "Logo fictif Neopolis pour exercer la composition visuelle ; il ne reproduit aucun logo source.",
    content: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="ZenLeaf synthetic practice mark"><rect width="800" height="800" rx="96" fill="#EBDCC4"/><path d="M400 610C215 485 206 262 400 158c194 104 185 327 0 452Z" fill="#8B9D83"/><path d="M400 584V248" stroke="#A67C52" stroke-width="24" stroke-linecap="round"/><text x="400" y="710" text-anchor="middle" font-family="Georgia,serif" font-size="72" fill="#5C6857">ZenLeaf</text><text x="400" y="762" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="#5C6857">SYNTHETIC PRACTICE MARK</text></svg>`,
  },
  onyx_paid_media_guidelines: {
    filename: "onyx_paid_media_guidelines_neopolis_synthetique.txt",
    contentType: "text/plain; charset=utf-8",
    title: "Lignes directrices synthétiques — Onyx",
    description: "Brief fictif Neopolis pour configurer un assistant de rédaction ; il ne reproduit aucun fichier source DataCamp.",
    content: `LIGNES DIRECTRICES SYNTHÉTIQUES NEOPOLIS — EXERCICE UNIQUEMENT\n\nMarque : Onyx, mode dynamique, optimiste et inclusive.\nAudience : génération Z et millennials.\nVoix : directe, énergique, jamais agressive.\nLivrable : trois variantes, une pour LinkedIn, une pour X et une pour Facebook.\nRègles : annoncer clairement la proposition de valeur ; éviter les promesses non vérifiables ; conserver un appel à l’action mesuré ; adapter longueur et ton à chaque plateforme.\n`,
  },
} as const;

const map: Record<string, { title: string; description: string; url: string; fileKey: string }> = {};
for (const [id, resource] of Object.entries(resources)) {
  const localPath = path.join(outputDir, resource.filename);
  fs.writeFileSync(localPath, resource.content);
  const upload = await storagePut(`courses/datacamp/ai-marketing/synthetic-resources/${resource.filename}`, resource.content, resource.contentType);
  map[id] = { title: resource.title, description: resource.description, url: upload.url, fileKey: upload.key };
}
fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
console.log(JSON.stringify({ mapPath, resourceCount: Object.keys(map).length, map }, null, 2));
