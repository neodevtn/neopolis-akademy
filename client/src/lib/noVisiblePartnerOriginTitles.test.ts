import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const partnerPattern = /\b(?:datacamp|n8n|novasavo|hugging\s*face)\b/i;

function textFromTitle(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).filter((item): item is string => typeof item === "string");
}

describe("titres publics des formations", () => {
  it("ne comporte aucune provenance partenaire dans les titres affichés", () => {
    const catalog = JSON.parse(fs.readFileSync(path.join(root, "client/src/data/trainingIndex.json"), "utf8"));
    const courseDirectory = path.join(root, "client/public/data/courses");
    const renderedCourseTitles = fs.readdirSync(courseDirectory)
      .filter((file) => file.endsWith(".json"))
      .flatMap((file) => textFromTitle(JSON.parse(fs.readFileSync(path.join(courseDirectory, file), "utf8")).title));
    const searchIndex = JSON.parse(fs.readFileSync(path.join(root, "client/public/data/training-search-index.json"), "utf8"));
    const titles = [
      ...catalog.certifications,
      ...catalog.courses,
    ].flatMap((item) => textFromTitle(item.title)).concat(
      renderedCourseTitles,
      searchIndex
        .filter((entry: { kind?: string }) => entry.kind === "certification" || entry.kind === "course")
        .map((entry: { title?: string }) => entry.title || ""),
    );

    expect(titles.filter((title) => partnerPattern.test(title))).toEqual([]);
  });

  it("préserve les identifiants techniques de catalogue nécessaires aux références existantes", () => {
    const catalog = JSON.parse(fs.readFileSync(path.join(root, "client/src/data/trainingIndex.json"), "utf8"));
    const certificationIds = new Set(catalog.certifications.map((item: { id: string }) => item.id));
    const courseIds = new Set(catalog.courses.map((item: { id: string }) => item.id));

    expect(certificationIds).toContain("datacamp_building_marketing_workflows_with_n8n");
    expect(certificationIds).toContain("novasavo_automatisation_comptable_ia");
    expect(courseIds).toContain("initiation_automatisation_workflows_n8n__01");
  });
});
