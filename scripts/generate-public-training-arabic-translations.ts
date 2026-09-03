import fs from "node:fs";
import path from "node:path";
import { getPublicTrainingThemes } from "../shared/publicTrainingThemes";

const target = process.env.PUBLIC_TRAINING_TRANSLATION_TARGET === "en" ? "en" : "ar";
type Translation = { id: string; translated: string };

const root = process.cwd();
const outputPath = path.join(root, "shared", target === "ar" ? "publicTrainingArabicTranslations.json" : "publicTrainingEnglishTranslations.json");
const themes = getPublicTrainingThemes();
const values = new Set<string>();

for (const theme of themes) {
  [theme.title, theme.shortTitle, theme.description, theme.introduction, ...theme.roles, ...theme.skills].forEach((value) => values.add(value));
  theme.certifications.forEach((certification) => {
    values.add(certification.title);
    values.add(certification.description);
    values.add(certification.level);
    values.add(certification.trainingFormat);
  });
}

const sourceValues = Array.from(values).filter(Boolean).sort((left, right) => left.localeCompare(right, "fr"));
const batches = Array.from({ length: Math.ceil(sourceValues.length / 40) }, (_, index) => sourceValues.slice(index * 40, (index + 1) * 40));
const bySource = new Map<string, string>();

for (const [index, batch] of batches.entries()) {
  const inputs = batch.map((source, itemIndex) => ({ id: `${index + 1}-${itemIndex + 1}`, source }));
  const response = await fetch(`${process.env.OPENAI_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional ${target === "ar" ? "Arabic localisation editor" : "English localisation editor"} for a public e-learning catalogue. Translate faithfully into ${target === "ar" ? "Modern Standard Arabic" : "natural international English"}. Keep product names, acronyms (AI, RAG, MLOps, CRM, BI, OCR, PDF, Google Drive, GitHub), numbers, and technical terms where clarity requires. Do not add claims, brands, availability, locations, accreditation, or promises. Return JSON only.`,
        },
        {
          role: "user",
          content: `Translate every catalogue string below into ${target === "ar" ? "Arabic" : "English"}. Preserve exactly one id per input and return that id unchanged. Batch ${index + 1}/${batches.length}.\n\n${JSON.stringify(inputs)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "public_training_arabic_translations",
          strict: true,
          schema: {
            type: "object",
            properties: {
              translations: {
                type: "array",
                items: {
                type: "object",
                properties: { id: { type: "string" }, translated: { type: "string" } },
                required: ["id", "translated"],
                  additionalProperties: false,
                },
              },
            },
            required: ["translations"],
            additionalProperties: false,
          },
        },
      },
      max_completion_tokens: 9000,
    }),
  });
  if (!response.ok) throw new Error(`Translation batch ${index + 1}/${batches.length} failed: ${response.status} ${await response.text()}`);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Translation batch ${index + 1}/${batches.length} returned no content.`);
  const translations = JSON.parse(content) as { translations: Translation[] };
  const sourceById = new Map(inputs.map((input) => [input.id, input.source]));
  const missingInBatch = inputs.filter((input) => !translations.translations.some((entry) => entry.id === input.id && entry.translated.trim()));
  const unexpectedInBatch = translations.translations.filter((entry) => !sourceById.has(entry.id));
  if (missingInBatch.length || unexpectedInBatch.length) throw new Error(`Translation batch ${index + 1}/${batches.length} schema mismatch: ${missingInBatch.length} missing, ${unexpectedInBatch.length} unexpected.`);
  translations.translations.forEach((entry) => bySource.set(sourceById.get(entry.id)!, entry.translated.trim()));
}

const missing = sourceValues.filter((source) => !bySource.get(source));
const unexpected = Array.from(bySource.keys()).filter((source) => !values.has(source));
if (missing.length || unexpected.length) throw new Error(`Translation schema mismatch: ${missing.length} missing, ${unexpected.length} unexpected.`);

const ordered = Object.fromEntries(sourceValues.map((source) => [source, bySource.get(source)]));
fs.writeFileSync(outputPath, `${JSON.stringify(ordered, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, translated: sourceValues.length, missing: missing.length, unexpected: unexpected.length }, null, 2));
