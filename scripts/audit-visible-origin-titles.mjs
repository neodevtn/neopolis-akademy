import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "client/src/data/trainingIndex.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const provenancePattern = /\b(?:datacamp|n8n|novasavo|hugging\s*face)\b/i;

const textValue = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return [value.fr, value.en].filter(Boolean).join(" | ");
  return "";
};

const findings = [];
for (const collectionName of ["certifications", "courses"]) {
  for (const item of catalog[collectionName] ?? []) {
    for (const field of ["title", "description", "subtitle", "catalogTag"]) {
      const value = textValue(item[field]);
      if (provenancePattern.test(value)) {
        findings.push({
          collection: collectionName,
          id: item.id,
          field,
          value,
        });
      }
    }
    for (const field of ["tags", "keywords", "technologies", "tools"]) {
      if (!Array.isArray(item[field])) continue;
      const value = item[field].map(String).join(", ");
      if (provenancePattern.test(value)) {
        findings.push({
          collection: collectionName,
          id: item.id,
          field,
          value,
        });
      }
    }
  }
}

console.log(JSON.stringify({
  catalog: path.relative(root, catalogPath),
  titleFindings: findings.filter((finding) => finding.field === "title"),
  visibleFieldFindings: findings,
  visibleFieldCount: findings.length,
  note: "Les champs id, certId, sourceUrl, sourceType, provider et chemins de média sont exclus : ils peuvent conserver leur provenance technique.",
}, null, 2));
