import fs from "node:fs";
import path from "node:path";
import { invokeLLM } from "../server/_core/llm";

const root = path.resolve(import.meta.dirname, "..");
const course = JSON.parse(fs.readFileSync(path.join(root, "client", "public", "data", "courses", "ai_for_finance__01.json"), "utf8"));
const outPath = path.join(root, ".work", "datacamp-audit-2026-09-17", "ai-finance-practical-guides.json");
const localized = (value: unknown) => typeof value === "string" ? value : (value && typeof value === "object" ? String((value as any).fr || (value as any).en || "") : "");
const practicals = course.lessons.flatMap((lesson: any) => lesson.chapters || []).flatMap((chapter: any) => chapter.blocks || [])
  .filter((block: any) => block.type === "cloud_exercise")
  .map((block: any) => ({
    id: block.id,
    title: localized(block.title),
    assignment: localized(block.assignment),
    instructions: localized(block.instructions),
    rubric: (block.rubricCriteria || []).map((criterion: any) => criterion.description || criterion.label),
    referencedFiles: [...(block.nonDownloadableFiles || []), ...(block.referencedFiles || []).map((file: any) => file?.filename || file?.name).filter(Boolean)],
  }));

const schema = {
  type: "json_schema" as const,
  json_schema: {
    name: "ai_finance_practical_guides",
    strict: true,
    schema: {
      type: "object", additionalProperties: false,
      properties: {
        guides: {
          type: "array", minItems: practicals.length, maxItems: practicals.length,
          items: { type: "object", additionalProperties: false, properties: {
            id: { type: "string" }, objectiveFr: { type: "string" }, setupFr: { type: "string" }, recoveryFr: { type: "string" },
            stepsFr: { type: "array", minItems: 4, maxItems: 7, items: { type: "string" } }, hintFr: { type: "string" },
            expectedEvidenceFr: { type: "array", minItems: 2, maxItems: 6, items: { type: "string" } }, needsSyntheticResource: { type: "string" },
          }, required: ["id", "objectiveFr", "setupFr", "recoveryFr", "stepsFr", "hintFr", "expectedEvidenceFr", "needsSyntheticResource"] },
        },
      }, required: ["guides"],
    },
  },
};

const response = await invokeLLM({
  model: "claude-sonnet-4-6",
  maxTokens: 8000,
  thinking: { type: "enabled", budget_tokens: 1800 },
  responseFormat: schema,
  messages: [{ role: "system", content: "Vous réécrivez des guides de TP pédagogiques français pour un apprenant utilisant son propre assistant IA. Vous utilisez exclusivement les faits fournis : n’inventez pas de fonction, fichier, produit, résultat numérique ni affirmation financière. Transformez les rubriques en preuves observables sans montrer de correction. Supprimez toute dépendance à une VM ou interface propriétaire : proposez un chemin principal et une alternative conversationnelle si l’outil ne permet pas les assistants personnalisés, la programmation ou les fichiers de connaissances. Interdisez les données financières réelles, personnelles, confidentielles et les clés API. Si un fichier est explicitement requis, répondez seulement finwise_brand_guidelines ou q3_forecast_data ; sinon chaîne vide." }, { role: "user", content: `Produisez un guide par TP, sans modifier les identifiants.\n${JSON.stringify(practicals)}` }],
});
const content = response.choices?.[0]?.message?.content;
const raw = Array.isArray(content) ? content.map((part: any) => part?.text || "").join("") : content;
const parsed = JSON.parse(String(raw || "{}"));
const ids = new Set(practicals.map((practical: any) => practical.id));
if (!Array.isArray(parsed.guides) || parsed.guides.length !== practicals.length || parsed.guides.some((guide: any) => !ids.has(guide.id))) throw new Error("Claude Sonnet returned incomplete AI finance practical guides.");
fs.writeFileSync(outPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), model: "claude-sonnet-4-6", guides: parsed.guides }, null, 2)}\n`);
console.log(JSON.stringify({ outputPath: outPath, guideCount: parsed.guides.length, model: "claude-sonnet-4-6" }, null, 2));
