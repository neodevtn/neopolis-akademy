import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const coursePath = path.join(root, "client/public/data/courses/initiation_automatisation_workflows_n8n__01.json");
const indexPath = path.join(root, "client/src/data/trainingIndex.json");
const registryPath = path.join(root, "server/n8nFoundationsWorkflowRegistry.ts");
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const registryText = fs.readFileSync(registryPath, "utf8");
const match = registryText.match(/export const N8N_FOUNDATIONS_WORKFLOW_RESOURCES = (\{[\s\S]*?\}) as const;/);
if (!match) throw new Error("Unable to read N8n workflow resource registry.");
const resources = JSON.parse(match[1]);

const actionResourceDescriptions = {
  ch01_ex02_tp: "Workflow de départ à importer pour explorer un premier scénario de devises.",
  ch01_ex04_tp: "Workflow de départ à compléter pour enchaîner le déclenchement, l’appel et le formatage.",
  ch01_ex05_tp: "Workflow de départ à compléter pour capturer les informations d’une inscription.",
  ch01_ex08_tp: "Workflow de départ à compléter pour ne conserver que les informations utiles d’un contact.",
  ch02_ex08_tp: "Workflow de départ à compléter pour aplatir une structure de données imbriquée.",
  ch02_ex10_tp: "Workflow de départ à compléter pour réunir deux jeux de données autour de userId.",
  ch03_ex04_tp: "Workflow de départ à compléter pour réutiliser une sortie d’Agent dans un rapport.",
  ch03_ex06_tp: "Workflow de départ à compléter pour classifier et aiguiller un retour client.",
  ch03_ex07_tp: "Workflow de départ à compléter pour rédiger une réponse adaptée après le routage.",
  ch03_ex11_tp: "Workflow de départ à compléter pour finaliser un scénario d’onboarding personnalisé.",
};

const learnerCriteria = {
  ch01_ex02_tp: [
    { fr: "Un nœud Form Trigger.", en: "A Form Trigger node." },
    { fr: "Un nœud HTTP Request relié au formulaire.", en: "An HTTP Request node connected to the form." },
    { fr: "Un nœud Edit Fields / Set atteignable après l’appel.", en: "An Edit Fields / Set node reachable after the request." },
  ],
  ch01_ex04_tp: [
    { fr: "Un déclencheur manuel.", en: "A manual trigger." },
    { fr: "Un HTTP Request connecté depuis le déclencheur.", en: "An HTTP Request connected from the trigger." },
    { fr: "Un Edit Fields / Set atteignable après l’appel.", en: "An Edit Fields / Set node reachable after the request." },
  ],
  ch01_ex05_tp: [
    { fr: "Un Form Trigger.", en: "A Form Trigger node." },
    { fr: "Les champs prénom, nom et e-mail.", en: "First name, last name, and email fields." },
    { fr: "Un Edit Fields / Set connecté au formulaire.", en: "An Edit Fields / Set node connected to the form." },
  ],
  ch01_ex08_tp: [
    { fr: "Un déclencheur manuel connecté.", en: "A connected manual trigger." },
    { fr: "Un nœud Edit Fields / Set final.", en: "A final Edit Fields / Set node." },
    { fr: "Les seuls champs de sortie contact_name et email.", en: "Only contact_name and email as output fields." },
  ],
  ch02_ex08_tp: [
    { fr: "Un déclencheur manuel.", en: "A manual trigger." },
    { fr: "Un nœud Edit Fields / Set de transformation.", en: "An Edit Fields / Set transformation node." },
    { fr: "Les champs name et email exposés au premier niveau.", en: "The name and email fields exposed at the top level." },
  ],
  ch02_ex10_tp: [
    { fr: "Deux jeux de données préparés.", en: "Two prepared data sets." },
    { fr: "Un nœud Merge.", en: "A Merge node." },
    { fr: "Une fusion basée sur userId.", en: "A merge based on userId." },
  ],
  ch03_ex04_tp: [
    { fr: "Un Agent relié au flux.", en: "An Agent connected to the flow." },
    { fr: "Un modèle de chat connecté à l’Agent.", en: "A chat model connected to the Agent." },
    { fr: "Un Edit Fields / Set de rapport après l’Agent.", en: "An Edit Fields / Set report node after the Agent." },
  ],
  ch03_ex06_tp: [
    { fr: "Un Agent de classification.", en: "A classification Agent." },
    { fr: "Un modèle de chat attaché.", en: "An attached chat model." },
    { fr: "Un Switch connecté à la sortie de l’Agent.", en: "A Switch connected to the Agent output." },
  ],
  ch03_ex07_tp: [
    { fr: "Un Switch de routage.", en: "A routing Switch." },
    { fr: "Un Agent de réponse sur une branche.", en: "A response Agent on one branch." },
    { fr: "Un modèle de chat relié à l’Agent de réponse.", en: "A chat model connected to the response Agent." },
  ],
  ch03_ex11_tp: [
    { fr: "Un Form Trigger et un classifieur.", en: "A Form Trigger and a classifier." },
    { fr: "Un Switch de routage par niveau.", en: "A level-based routing Switch." },
    { fr: "Une branche d’accueil personnalisée avec Agent et modèle.", en: "A personalized welcome branch with an Agent and model." },
  ],
};

const personalEnvironmentGuide = {
  fr: "Préparez votre propre espace n8n : utilisez un espace n8n Cloud personnel ou votre installation n8n locale. Importez le fichier de départ directement depuis la carte Ressources de ce TP via **Import from File**. Les identifiants éventuels (API ou IA) restent les vôtres : ne les incluez jamais dans le JSON que vous remettez. Testez avec les données synthétiques indiquées, exportez votre copie modifiée, puis déposez-la dans Neopolis pour obtenir une correction.",
  en: "Prepare your own n8n workspace: use a personal n8n Cloud workspace or your local n8n installation. Import the starter file from this activity’s Resources card using **Import from File**. Any API or AI credentials remain yours: never include them in the JSON you submit. Test with the supplied synthetic data, export your edited copy, then upload it to Neopolis to receive feedback.",
};

let mapped = 0;
for (const lesson of course.lessons ?? []) {
  for (const chapter of lesson.chapters ?? []) {
    for (const block of chapter.blocks ?? []) {
      if (block?.type !== "cloud_exercise" || !resources[block.id]) continue;
      const resource = resources[block.id].starter;
      block.serverGradedAssessment = "n8n_foundations_workflow_json";
      block.workflowUploadRequired = true;
      block.minimumAnswerLength = 1;
      block.environmentGuide = personalEnvironmentGuide;
      block.learnerCriteria = learnerCriteria[block.id];
      block.nonDownloadableFiles = [];
      block.referencedFiles = [];
      block.resources = [{
        title: { fr: `Télécharger le workflow de départ — ${resource.filename}`, en: `Download starter workflow — ${resource.filename}` },
        description: { fr: actionResourceDescriptions[block.id], en: "Import this starter workflow into your own n8n workspace before completing the activity." },
        url: resource.url,
        filename: resource.filename,
        assetMeta: { source: "Neopolis media library", filename: resource.filename, sha256: resource.sha256, size: resource.size },
      }];
      delete block.solution;
      delete block.evaluationPrompt;
      delete block.rubricCriteria;
      delete block.solutionResources;
      mapped += 1;
    }
  }
}
if (mapped !== 10) throw new Error(`Expected 10 mapped n8n TP blocks; found ${mapped}.`);

const stripXp = (value) => {
  if (Array.isArray(value)) return value.map(stripXp);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([key]) => !/\bxp\b/i.test(key)).map(([key, entry]) => [key, stripXp(entry)]));
  return value;
};

// Imported exercise payloads can retain authoring notes from the original hosted
// lab. They are neither usable nor appropriate in an autonomous Neopolis course.
function normalizeLegacyLearningText(value) {
  if (Array.isArray(value)) return value.map(normalizeLegacyLearningText);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalizeLegacyLearningText(entry)]));
  if (typeof value !== "string") return value;
  return value
    .replace(/(?:depuis\s+)?(?:le\s+)?Desktop\/Resources/gi, "depuis la carte Ressources de ce TP")
    .replace(/Sous\s+le\s+(?:<code>)?Desktop(?:<\/code>)?\s+de\s+la\s+VM,?\s+allez\s+dans\s+(?:<code>)?Resources(?:<\/code>)?\s+et\s+ouvrez\s+(?:<code>)?([A-Za-z0-9_.-]+)(?:<\/code>)?/gi, (_match, filename) => `Depuis la carte Ressources de ce TP, téléchargez puis importez \`${filename.replace(/\.+$/, "")}\` dans votre espace n8n`)
    .replace(/(?:dans|depuis)\s+le\s+Desktop\s+de\s+la\s+VM/gi, "dans votre espace n8n personnel")
    .replace(/Fichiers\s+de\s+référence\s+formation[\s\S]*?Fichiers\s+concernés\s*:\s*(?:`[^`]+`\s*,?\s*)+/gi, "Fichiers de référence pour les TP\n\nLes workflows nécessaires sont proposés dans la carte **Ressources** de chaque TP concerné. Téléchargez le fichier de départ, importez-le avec **Import from File**, puis suivez les étapes.\n\n")
    .replace(/(?:les\s+)?fichiers?\s+de\s+VM\s+formation\s+non\s+téléchargeables?\s+sont\s+signalés\s+ci-dessous\s*:\s*reconstruisez-les\s+à\s+partir\s+des\s+consignes,?\s+des\s+indices\s+et\s+de\s+la\s+correction\.?/gi, "Les fichiers nécessaires sont proposés dans la carte Ressources de ce TP.")
    .replace(/(?:sélectionnez|utilisez)\s+les\s+identifiants\s+(?:OpenAI\s+)?préconfigurés?(?:\s+si\s+(?:on\s+)?vous\s+le\s+demande)?/gi, "utilisez vos propres identifiants de test si le connecteur est nécessaire")
    .replace(/vous\s+avez\s+été\s+connecté\s+automatiquement\s+à\s+votre\s+propre\s+compte\s+n8n/gi, "Ouvrez votre espace n8n personnel")
    .replace(/\bouvrez\s+votre\s+espace\s+n8n\s+personnel\s*!/gi, "Ouvrez votre espace n8n personnel.")
    .replace(/\bouvrez\s+votre\s+espace\s+n8n\s+personnel(?:&nbsp;|\s)*!/gi, "Ouvrez votre espace n8n personnel.")
    .replace(/\b(?:la|votre)\s+VM\s+(?:formation|d['’]apprentissage)\b/gi, "votre espace n8n personnel")
    .replace(/connectés\s+de\s+gauche\s+dans\s+les\s+options\s+proposées/gi, "connectés de gauche à droite")
    .replace(/dans\s+formation\b/gi, "dans cette formation")
    .replace(/###\s+####\s+Fichiers\s+de\s+référence\s+pour\s+les\s+TP/gi, "### Fichiers de référence pour les TP")
    .replace(/ou\s+ouvrez\s+votre\s+workspace\s+existant/gi, "ou ouvrez votre espace de travail existant")
    .replace(/Utilisez\s+les\s+nodes\s+mentionnés\s+dans\s+le\s+TP/gi, "Utilisez les nœuds mentionnés dans le TP")
    .replace(/Pour\s+les\s+labs\s+LLM\s+\(Chapitre\s+3\),\s+configurez\s+une\s+credential\s+OpenAI\s+ou\s+un\s+modèle\s+LLM\s+disponible\s+dans\s+n8n/gi, "Pour les TP LLM (chapitre 3), configurez dans n8n vos propres identifiants de modèle si nécessaire")
    .replace(/Exécutez\s+le\s+workflow\s+et\s+comparez\s+le\s+résultat\s+avec\s+la\s+correction/gi, "Exécutez le workflow ; après validation de votre remise, comparez le résultat avec la correction")
    .replace(/`([^`]+)\.`/g, "`$1`.");
}
const sanitizedCourse = normalizeLegacyLearningText(stripXp(course));
fs.writeFileSync(coursePath, `${JSON.stringify(sanitizedCourse, null, 2)}\n`);

const cert = index.certifications?.find((entry) => entry.id === "initiation_automatisation_workflows_n8n");
if (!cert) throw new Error("n8n certification catalogue entry not found.");
cert.totalActivities = 32;
cert.totalDownloads = 12;
cert.downloadCount = 12;
cert.resourceSummary = { fr: "3 PDF de référence et 9 workflows n8n de départ téléchargeables. Les 10 corrections sont déverrouillées après une remise valide.", en: "3 reference PDFs and 9 downloadable n8n starter workflows. The 10 corrections unlock after a valid submission." };
cert.breakdown = {
  ...cert.breakdown,
  fr: "10 vidéos · 17 TP pratiques · 3 tris interactifs · 2 QCM · 3 PDF · 9 workflows n8n de départ",
  en: "10 videos · 17 hands-on labs · 3 drag-and-drop · 2 quizzes · 3 PDFs · 9 n8n starter workflows",
};
const courseEntry = index.courses?.find((entry) => entry.courseId === "initiation_automatisation_workflows_n8n__01" || entry.id === "initiation_automatisation_workflows_n8n__01");
if (courseEntry) {
  courseEntry.totalActivities = 32;
  courseEntry.totalDownloads = 12;
  courseEntry.downloadCount = 12;
  courseEntry.resourceSummary = cert.resourceSummary;
}
fs.writeFileSync(indexPath, `${JSON.stringify(stripXp(index), null, 2)}\n`);
console.log(`Updated ${mapped} n8n TP blocks; exposed 9 unique starters and server-gated correction releases.`);
