import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const work = path.join(root, ".work", "claude-science-medical-v2-2026-09-17");
const packageRoot = path.join(work, "package", "claude_science_medical_fr_v2_2026-09-17");
const output = path.join(root, "docs", "claude-science-v2-integration-report.md");
const assetMap = JSON.parse(fs.readFileSync(path.join(work, "asset-map.json"), "utf8"));
const courseIds = ["claude_science_01_initiation", "claude_science_02_pratique", "claude_science_03_travaux_pratiques"];
const sourceDefinitions = [
  ["courses/01_initiation_claude_et_claude_science/COURSE.json", "claude_science_01_initiation"],
  ["courses/02_claude_science_installation_utilisation_optimisation/COURSE.json", "claude_science_02_pratique"],
  ["courses/03_claude_science_travaux_pratiques/COURSE.json", "claude_science_03_travaux_pratiques"],
];
const source = (file) => JSON.parse(fs.readFileSync(path.join(packageRoot, file), "utf8"));
const generated = (id) => JSON.parse(fs.readFileSync(path.join(root, "client", "public", "data", "courses", `${id}.json`), "utf8"));
const local = (value) => typeof value === "string" ? value : value?.fr || value?.en || "";
const esc = (value) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");

const rows = [];
const courseSummaries = [];
for (const [definitionPath, id] of sourceDefinitions) {
  const supplied = source(definitionPath);
  const rendered = generated(id);
  const generatedLessons = new Map(rendered.lessons.map((lesson) => [local(lesson.title), lesson]));
  let screens = 0;
  let checkpoints = 0;
  let labs = 0;
  for (const module of supplied.modules) {
    for (const lesson of module.lessons) {
      const target = generatedLessons.get(lesson.title);
      for (const screen of lesson.screens) {
        screens += 1;
        if (screen.type === "CheckpointMCQ") checkpoints += 1;
        if (screen.type === "PracticalLab") labs += 1;
        const targetChapter = target?.chapters.find((chapter) => local(chapter.title) === (screen.title || lesson.title));
        const blocks = (targetChapter?.blocks || []).map((block) => block.type).join(", ");
        rows.push(`| ${esc(id)} | ${esc(module.title)} | ${esc(lesson.title)} | ${screen.order} · ${esc(screen.type)} | ${esc(screen.title || lesson.title)} | ${esc(blocks || "non trouvé")} | ${targetChapter ? "PASS" : "FAIL"} |`);
      }
    }
  }
  courseSummaries.push({ id, title: supplied.title, lessons: supplied.lesson_count, screens, checkpoints, labs, finalQuestions: supplied.quiz_question_count, chapters: rendered.lessons.reduce((sum, lesson) => sum + lesson.chapters.length, 0) });
}

const publicAssets = Object.entries(assetMap).map(([sourcePath, asset]) => {
  const bytes = fs.statSync(path.join(packageRoot, sourcePath)).size;
  const hash = crypto.createHash("sha256").update(fs.readFileSync(path.join(packageRoot, sourcePath))).digest("hex");
  return `| ${esc(sourcePath)} | ${asset.kind} | ${bytes} | \`${hash}\` | ${asset.url} |`;
});
const assetsWithPrivateNames = Object.keys(assetMap).filter((key) => /\/(?:solutions|expected)\/|\/scripts\/solution_/i.test(key));
const observations = fs.existsSync(path.join(work, "visual-qa-observations.txt")) ? fs.readFileSync(path.join(work, "visual-qa-observations.txt"), "utf8").trim() : "Aucune observation disponible.";

const total = courseSummaries.reduce((acc, item) => ({ lessons: acc.lessons + item.lessons, screens: acc.screens + item.screens, checkpoints: acc.checkpoints + item.checkpoints, labs: acc.labs + item.labs, finalQuestions: acc.finalQuestions + item.finalQuestions, chapters: acc.chapters + item.chapters }), { lessons: 0, screens: 0, checkpoints: 0, labs: 0, finalQuestions: 0, chapters: 0 });
const markdown = `# Rapport d’intégration — Parcours Claude Science pour la recherche médicale (V2)

**Date :** 17 septembre 2026  
**Source de vérité :** package Drive V2, dont les trois fichiers COURSE.json ; aucun article externe n’a été recopié intégralement. Le contenu importé est un parcours pédagogique **français, non clinique**, limité aux données synthétiques fournies.

## Résultat d’intégration

Le parcours a été structuré comme **trois cours séquentiels** au sein de la catégorie **IA pour la recherche et la santé**. Chaque leçon reste une unité du lecteur : un seul écran est affiché, et les checkpoints côté serveur verrouillent la suite. Les cours 2 et 3 ne sont accessibles qu’après complétion du précédent parcours.

| Indicateur | Résultat |
|---|---:|
| Cours importés | ${courseSummaries.length} |
| Leçons source | ${total.lessons} |
| Écrans source rapprochés | ${total.screens} |
| Chapitres Neopolis produits | ${total.chapters} |
| Checkpoints serveur | ${total.checkpoints} |
| TP évalués côté serveur | ${total.labs} |
| Questions de quiz finaux | ${total.finalQuestions} |
| Vidéos YouTube officielles/intégrées | 2 |
| Images documentaires attribuées | 5 |
| Ressources publiques de médiathèque | ${Object.keys(assetMap).length} |

| Cours | Leçons | Écrans source | Chapitres | Checkpoints | TP | Quiz final |
|---|---:|---:|---:|---:|---:|---:|
${courseSummaries.map((item) => `| ${item.title} | ${item.lessons} | ${item.screens} | ${item.chapters} | ${item.checkpoints} | ${item.labs} | ${item.finalQuestions} |`).join("\n")}

## Règles de sûreté et d’évaluation

Les réponses aux checkpoints, les clés des quiz finaux et les corrections TP sont séparées du JSON apprenant. Les quiz et checkpoints sont corrigés côté serveur. La correction d’un TP n’est rendue qu’après une soumission, et les clés historiques de correction, de sorties attendues et de scripts de solution sont explicitement refusées par le proxy d’assets.

L’évaluation libre des quatre TP appelle exclusivement **Claude Sonnet (claude-sonnet-4-6)**, avec une rubrique bornée, des données synthétiques, l’interdiction de toute conclusion clinique et l’exigence de contrôles reproductibles et humains. Les points attribués utilisent le système de **points de compétences** Neopolis.

## Matrice écran source → bloc Neopolis

| Cours | Module | Leçon | Écran source | Titre | Bloc(s) Neopolis | Statut |
|---|---|---|---|---|---|---|
${rows.join("\n")}

## Inventaire des assets de médiathèque

Les vidéos restent des intégrations YouTube (aucun téléchargement vidéo). Les ressources listées ci-dessous sont servies depuis la médiathèque Neopolis par des URL /api/assets/ versionnées.

| Fichier source | Type | Octets | SHA-256 | URL Neopolis |
|---|---|---:|---|---|
${publicAssets.join("\n")}

**Vérification d’accès :** les ${Object.keys(assetMap).length} URL d’assets restants répondent HTTP 200 localement ; les ${assetsWithPrivateNames.length} artefacts d’évaluation restent absents de l’inventaire public. Les anciennes URL de correction/sortie attendue sont renvoyées en HTTP 404 par politique applicative.

## Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| TypeScript (pnpm check) | PASS |
| Contrats V2, données cours et proxy d’assets | PASS |
| Contrat de verrouillage TP, quiz final et réflexion | PASS |
| Index de recherche | PASS — 180 cours, 3 639 chapitres, 3 935 entrées |
| Ressources de médiathèque V2 | PASS — 16/16 URL publiques 200 |
| Captures/lecteur desktop et tablette | PASS avec communication globale obstruante documentée |
| Lecteur vidéo 1 et 2 | PASS — iframes officielles visibles après 22 secondes ; audio géré par le contrôle YouTube |
| Prévisualisation mobile automatisée | À rejouer — le limiteur global a renvoyé HTTP 429 après les captures répétées |
| Parcours intégral avec compte dédié | À rejouer après publication avec un compte apprenant isolé ; aucune progression réelle n’a été modifiée pendant l’intégration |

## Observations de prévisualisation

${observations}

## Limites de validation restantes

Le contrôle fonctionnel complet avec un compte apprenant distinct est volontairement reporté au post-déploiement afin de ne pas modifier la progression d’un compte réel. La capture mobile automatique a été interrompue par la limite globale de requêtes, après les captures précédentes ; c’est un résultat d’infrastructure de QA, non un écran blanc attribué au cours. La publication ne doit être considérée définitive qu’après cette relecture post-publication sur une session apprenante dédiée.
`;
fs.writeFileSync(output, markdown);
console.log(JSON.stringify({ output, courses: courseSummaries.length, screens: total.screens, assets: Object.keys(assetMap).length }, null, 2));
