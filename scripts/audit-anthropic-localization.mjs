import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const coursesDir = resolve(process.cwd(), "client/public/data/courses");
const outputPath = resolve(process.cwd(), "docs/anthropic-localization-candidates.json");
const files = (await readdir(coursesDir)).filter((file) => file.startsWith("claude_") && file.endsWith(".json"));
const findings = [];

function walk(value, path = "$", file = "") {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, `${path}[${index}]`, file));
    return;
  }
  if (!value || typeof value !== "object") return;

  if (typeof value.en === "string" && typeof value.fr === "string") {
    const en = value.en.trim();
    const fr = value.fr.trim();
    if (en === fr && /[A-Za-z]{5,}/.test(en) && en.length > 18) {
      findings.push({ file, path, text: en, length: en.length });
    }
  }
  Object.entries(value).forEach(([key, child]) => walk(child, `${path}.${key}`, file));
}

for (const file of files) walk(JSON.parse(await readFile(resolve(coursesDir, file), "utf8")), "$", file);

const byFile = Object.groupBy(findings, ({ file }) => file);
await writeFile(outputPath, `${JSON.stringify({ total: findings.length, byFile, findings }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ total: findings.length, byFile: Object.fromEntries(Object.entries(byFile).map(([file, entries]) => [file, entries.length])) }, null, 2));
