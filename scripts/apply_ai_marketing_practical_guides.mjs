import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const coursePath = path.join(root, "client", "public", "data", "courses", "ai_for_marketing__01.json");
const guidePath = path.join(root, ".work", "datacamp-audit-2026-09-17", "ai-marketing-practical-guides.json");
const resourcePath = path.join(root, ".work", "datacamp-audit-2026-09-17", "ai-marketing-synthetic-resource-map.json");
const definitionsPath = path.join(root, "server", "aiMarketingAssessmentDefinitions.ts");

const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const guides = JSON.parse(fs.readFileSync(guidePath, "utf8")).guides;
const resources = JSON.parse(fs.readFileSync(resourcePath, "utf8"));
const guideById = new Map(guides.map((guide) => [guide.id, guide]));
let updated = 0;

for (const lesson of course.lessons ?? []) {
  for (const chapter of lesson.chapters ?? []) {
    for (const block of chapter.blocks ?? []) {
      const guide = guideById.get(block.id);
      if (!guide) continue;
      const learnerResources = Array.isArray(block.resources) ? block.resources.filter((resource) => String(resource?.url || "").startsWith("/api/assets/")) : [];
      const synthetic = guide.needsSyntheticResource ? resources[guide.needsSyntheticResource] : null;
      if (synthetic && !learnerResources.some((resource) => resource.url === synthetic.url)) {
        learnerResources.unshift({
          title: { fr: synthetic.title, en: synthetic.title },
          description: { fr: synthetic.description, en: synthetic.description },
          url: synthetic.url,
          assetMeta: { origin: "Neopolis", provenance: "synthetic_practice_resource", sourceRefs: [] },
        });
      }
      Object.assign(block, {
        assignment: { fr: guide.objectiveFr, en: guide.objectiveFr },
        instructions: { fr: `**Préparation**\n${guide.setupFr}\n\n**En cas de blocage**\n${guide.recoveryFr}`, en: `**Preparation**\n${guide.setupFr}\n\n**If blocked**\n${guide.recoveryFr}` },
        environmentGuide: { fr: "Utilisez un assistant IA personnel auquel vous avez accès. N’utilisez que les scénarios et ressources synthétiques fournis ; ne transmettez ni données clients, ni données internes, ni clés API.", en: "Use a personal AI assistant you can access. Use only the supplied synthetic scenarios and resources; never share client data, internal data, or API keys." },
        steps: guide.stepsFr.map((instruction_text, index) => ({ number: index + 1, instruction_text: { fr: instruction_text, en: instruction_text } })),
        hint: { fr: guide.hintFr, en: guide.hintFr },
        learnerCriteria: guide.expectedEvidenceFr,
        resources: learnerResources,
        source_refs: [{ source: "Imported course alignment record", relevance: "Objectif et scénario de l’activité adaptés pour un environnement personnel Neopolis sans dépendance à un compte, VM ou ressource DataCamp.", url: "https://app.datacamp.com/learn/courses/ai-for-marketing" }],
        practiceStatus: "source_adapted_personal_environment",
        serverGradedAssessment: "ai_marketing_source_adapted",
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
fs.writeFileSync(definitionsPath, `/** Server-only scoring references generated from Claude Sonnet source-bounded learner guides. */\nexport const AI_MARKETING_PRACTICAL_ASSESSMENTS = ${JSON.stringify(definitions, null, 2)} as const;\n`);
console.log(JSON.stringify({ coursePath, definitionsPath, updated, resourceLinks: Object.values(resources).map((resource) => resource.url) }, null, 2));
