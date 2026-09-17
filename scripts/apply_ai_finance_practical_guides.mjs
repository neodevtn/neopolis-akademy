import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const coursePath = path.join(root, "client", "public", "data", "courses", "ai_for_finance__01.json");
const guidesPath = path.join(root, ".work", "datacamp-audit-2026-09-17", "ai-finance-practical-guides.json");
const resourcesPath = path.join(root, ".work", "datacamp-audit-2026-09-17", "ai-finance-synthetic-resource-map.json");
const definitionsPath = path.join(root, "server", "aiFinanceAssessmentDefinitions.ts");
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const guides = JSON.parse(fs.readFileSync(guidesPath, "utf8")).guides;
const resources = JSON.parse(fs.readFileSync(resourcesPath, "utf8"));
const guideById = new Map(guides.map((guide) => [guide.id, guide]));
const extraResourceByBlock = {
  dc_1_act_06_tp: "harborview_earnings_excerpt",
  dc_1_act_07_tp: "harborview_earnings_excerpt",
};
const cleanStep = (value) => String(value || "").split(/\s+—\s+(?:Alternative conversationnelle|Preuve observable|Aucun corrigé attendu|Traitement de ressources|Rappel de sécurité)\s*:/i)[0].trim();
let updated = 0;
for (const lesson of course.lessons ?? []) {
  for (const chapter of lesson.chapters ?? []) {
    for (const block of chapter.blocks ?? []) {
      const guide = guideById.get(block.id);
      if (!guide) continue;
      const managed = Array.isArray(block.resources) ? block.resources.filter((resource) => String(resource?.url || "").startsWith("/api/assets/")) : [];
      const resourceKeys = [guide.needsSyntheticResource, extraResourceByBlock[block.id]].filter(Boolean);
      for (const resourceKey of resourceKeys) {
        const resource = resources[resourceKey];
        if (resource && !managed.some((item) => item.url === resource.url)) managed.unshift({
          title: { fr: resource.title, en: resource.title },
          description: { fr: resource.description, en: resource.description },
          url: resource.url,
          assetMeta: { origin: "Neopolis", provenance: "synthetic_practice_resource", sourceRefs: [] },
        });
      }
      Object.assign(block, {
        assignment: { fr: guide.objectiveFr, en: guide.objectiveFr },
        instructions: { fr: `**Préparation**\n${guide.setupFr}\n\n**Alternative si la fonction n’existe pas**\n${guide.recoveryFr}`, en: `**Preparation**\n${guide.setupFr}\n\n**Alternative if the feature is unavailable**\n${guide.recoveryFr}` },
        environmentGuide: { fr: "Utilisez un assistant IA personnel auquel vous avez accès. Employez uniquement les scénarios et ressources synthétiques fournis par Neopolis : aucune donnée financière réelle, donnée personnelle, information confidentielle ni clé API.", en: "Use a personal AI assistant you can access. Use only Neopolis-provided synthetic scenarios and resources: no real financial data, personal data, confidential information, or API keys." },
        steps: guide.stepsFr
          .map(cleanStep)
          .filter((step) => step && !/^(Alternative conversationnelle|Preuve observable|Aucun corrigé attendu)\s*:/i.test(step))
          .map((instruction_text, index) => ({ number: index + 1, instruction_text: { fr: instruction_text, en: instruction_text } })),
        hint: { fr: guide.hintFr, en: guide.hintFr },
        learnerCriteria: guide.expectedEvidenceFr,
        resources: managed,
        source_refs: [{ source: "Imported course alignment record", relevance: "Objectif de TP conservé et adapté à un environnement personnel Neopolis sans VM ni fichier externe temporaire.", url: "https://app.datacamp.com/learn/courses/ai-for-finance" }],
        practiceStatus: "source_adapted_personal_environment",
        serverGradedAssessment: "ai_finance_source_adapted",
        minimumAnswerLength: 180,
        successMessage: "Votre preuve a été évaluée côté serveur. Les points de compétences sont attribués lorsque le seuil est atteint.",
      });
      delete block.solution;
      delete block.rubricCriteria;
      delete block.evaluationPrompt;
      delete block.maxScore;
      delete block.passingScore;
      updated += 1;
    }
  }
}
if (updated !== guides.length) throw new Error(`Expected to update ${guides.length} TP, updated ${updated}.`);
fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
const definitions = Object.fromEntries(guides.map((guide) => [guide.id, {
  title: guide.objectiveFr,
  rubric: guide.expectedEvidenceFr,
  correction: `Pour réussir ce TP, la preuve devait montrer : ${guide.expectedEvidenceFr.join(" ; ")}.`,
  maxScore: guide.expectedEvidenceFr.length,
  passingScore: Math.max(2, Math.ceil(guide.expectedEvidenceFr.length * 0.67)),
}]));
fs.writeFileSync(definitionsPath, `/** Server-only scoring references generated from Claude Sonnet source-bounded learner guides. */\nexport const AI_FINANCE_PRACTICAL_ASSESSMENTS = ${JSON.stringify(definitions, null, 2)} as const;\n`);
console.log(JSON.stringify({ coursePath, definitionsPath, updated }, null, 2));
