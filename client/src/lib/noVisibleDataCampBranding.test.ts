import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const technicalKeyPattern = /^(id|certId|courseId|lessonId|chapterId|blockId|sourceUrl|url|href|path|fileName|filename|assetId|mediaId|provider|origin|catalog|repository|rubricVersion|schemaVersion|internal[A-Z]|external[A-Z])/i;

function collectVisibleMentions(value: unknown, pointer = "", key = ""): string[] {
  if (/(^|\.)datacampImport(?:\.|$)/.test(pointer)) return [];
  if (typeof value === "string") return /datacamp/i.test(value) && !technicalKeyPattern.test(key) ? [pointer] : [];
  if (Array.isArray(value)) return value.flatMap((entry, index) => collectVisibleMentions(entry, `${pointer}[${index}]`, key));
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([childKey, childValue]) => collectVisibleMentions(childValue, pointer ? `${pointer}.${childKey}` : childKey, childKey));
}

describe("absence de marque fournisseur dans le contenu visible", () => {
  it("n’expose aucune mention de DataCamp dans le catalogue ou les cours", () => {
    const catalog = JSON.parse(fs.readFileSync(path.join(root, "client/src/data/trainingIndex.json"), "utf8"));
    const courseDirectory = path.join(root, "client/public/data/courses");
    const courseMentions = fs.readdirSync(courseDirectory)
      .filter((file) => file.endsWith(".json"))
      .flatMap((file) => collectVisibleMentions(JSON.parse(fs.readFileSync(path.join(courseDirectory, file), "utf8")), file));

    expect(collectVisibleMentions(catalog, "trainingIndex.json")).toEqual([]);
    expect(courseMentions).toEqual([]);
  });

  it("ne laisse pas de formulations de nettoyage artificielles dans les textes rendus", () => {
    const courseDirectory = path.join(root, "client/public/data/courses");
    const renderedText = fs.readdirSync(courseDirectory)
      .filter((file) => file.endsWith(".json"))
      .map((file) => fs.readFileSync(path.join(courseDirectory, file), "utf8"))
      .join("\n");

    expect(renderedText).not.toMatch(/cours Training|plateforme de plateforme source|local Training package|in the cette formation/i);
    expect(renderedText).not.toMatch(/assistant IA choisi for Microsoft|assistant IA choisi Studio|agent l’assistant IA choisi|l[’']Microsoft Copilot/i);
  });
});
