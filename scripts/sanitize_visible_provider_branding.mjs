import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const files = [
  "client/public/data/courses/intermediate_workflow_automation_with_n8n__01.json",
  "client/public/data/courses/ai_for_marketing__01.json",
  "client/public/data/courses/ai_for_finance__01.json",
];
const technicalUrlKeys = new Set(["url", "href", "sourceUrl"]);
function sanitize(value, key = "") {
  if (typeof value === "string") {
    if (technicalUrlKeys.has(key)) return value;
    return value.replace(/DataCamp/gi, "source course");
  }
  if (Array.isArray(value)) return value.map((item) => sanitize(item, key));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, sanitize(childValue, childKey)]));
  return value;
}
for (const relativePath of files) {
  const filePath = path.join(root, relativePath);
  fs.writeFileSync(filePath, `${JSON.stringify(sanitize(JSON.parse(fs.readFileSync(filePath, "utf8"))), null, 2)}\n`);
}
console.log(JSON.stringify({ sanitizedFiles: files }, null, 2));
