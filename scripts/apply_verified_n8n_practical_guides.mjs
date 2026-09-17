import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const coursePath = path.join(root, "client", "public", "data", "courses", "intermediate_workflow_automation_with_n8n__01.json");
const workPath = path.join(root, ".work", "datacamp-audit-2026-09-17");
const guideData = JSON.parse(fs.readFileSync(path.join(workPath, "verified-n8n-practical-guides.json"), "utf8"));
const assetMap = JSON.parse(fs.readFileSync(path.join(workPath, "n8n-synthetic-pack-map.json"), "utf8"));
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));

const guideById = new Map(guideData.guides.map((guide) => [guide.blockId, guide]));
const sourceById = new Map(guideData.sources.map((source) => [source.blockId, source]));
const packByBlock = {
  dc_1_act_04_tp: "webhook_nested_orders",
  dc_2_act_02_tp: "stockholm_weather",
  dc_2_act_03_tp: "stockholm_weather",
  dc_2_act_05_tp: "stockholm_weather",
  dc_2_act_06_tp: "city_validation_rows",
  dc_2_act_07_tp: "city_validation_rows",
  dc_2_act_09_tp: "data_table_rows",
  dc_2_act_10_tp: "data_table_rows",
  dc_3_act_02_tp: "product_feed",
  dc_3_act_03_tp: "product_feed",
  dc_3_act_05_tp: "nested_orders",
  dc_3_act_06_tp: "split_items",
  dc_3_act_07_tp: "nested_orders",
  dc_3_act_09_tp: "workflow_routing_orders",
  dc_3_act_10_tp: "workflow_routing_orders",
  dc_4_act_02_tp: "validation_orders",
  dc_4_act_03_tp: "error_events",
  dc_4_act_06_tp: "ingestion_records",
  dc_4_act_07_tp: "ingestion_records",
};

let updated = 0;
for (const lesson of course.lessons ?? []) {
  for (const chapter of lesson.chapters ?? []) {
    for (const block of chapter.blocks ?? []) {
      const guide = guideById.get(block.id);
      if (!guide) continue;
      const source = sourceById.get(block.id);
      const pack = assetMap[packByBlock[block.id]];
      const sourceRef = { source: "DataCamp course screen", url: source.sourceUrl, relevance: "Rapprochement de l’activité et de ses étapes; texte Neopolis reformulé pour un environnement personnel." };
      Object.assign(block, {
        assignment: { fr: guide.assignmentFr, en: guide.sourceSummaryFr },
        instructions: { fr: `Avant de commencer, utilisez votre propre instance n8n Cloud ou Docker. ${guide.setupFr}`, en: "Use your own n8n Cloud or Docker instance. Follow the source-grounded setup guidance." },
        environmentGuide: {
          fr: "**Préparer votre espace n8n**\n\n1. Ouvrez votre instance personnelle n8n Cloud ou Docker.\n2. Créez un workflow de travail dédié à ce TP.\n3. Utilisez uniquement des données synthétiques ; ne connectez ni compte professionnel, ni secret, ni données réelles.\n4. Exécutez en mode test avant toute activation.",
          en: "**Prepare your n8n workspace**\n\n1. Open your personal n8n Cloud or Docker instance.\n2. Create a dedicated workflow for this practical.\n3. Use synthetic data only; do not connect production accounts, secrets, or real data.\n4. Test before enabling any workflow.",
        },
        steps: guide.stepsFr.map((step, index) => ({ number: index + 1, instruction_text: { fr: step, en: step } })),
        learnerCriteria: guide.proofFr,
        hint: { fr: guide.hintFr, en: guide.hintFr },
        minimumAnswerLength: 90,
        source_refs: [...(Array.isArray(block.source_refs) ? block.source_refs.filter((item) => item?.url !== source.sourceUrl) : []), sourceRef],
        practiceStatus: "source_screen_verified",
        sourceSummary: guide.sourceSummaryFr,
        nonDownloadableFiles: [],
        serverGradedAssessment: "intermediate_n8n_source_verified",
      });
      block.resources = pack ? [{ title: { fr: pack.title, en: pack.title }, description: { fr: `${pack.description} Données synthétiques uniquement.`, en: `${pack.description} Synthetic data only.` }, url: pack.url }] : [];
      delete block.rubricCriteria;
      delete block.evaluationPrompt;
      delete block.solution;
      updated += 1;
    }
  }
}
if (updated !== guideById.size) throw new Error(`Updated ${updated}/${guideById.size} source-verified practicals.`);
fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
console.log(JSON.stringify({ coursePath, updated, resources: Object.keys(packByBlock).length }, null, 2));
