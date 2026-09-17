import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2];
if (!inputPath || !fs.existsSync(inputPath)) {
  throw new Error("Provide a cached DataCamp HTML path.");
}

const decode = (value) => value
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&amp;", "&")
  .replaceAll("\\u002F", "/")
  .replaceAll("\\n", "\n");
const strip = (value) => value
  .replace(/<\/(?:p|li|h\d|div)>/gi, "\n")
  .replace(/<li[^>]*>/gi, "- ")
  .replace(/<br\s*\/?\s*>/gi, "\n")
  .replace(/<[^>]+>/g, "")
  .replace(/\s+\n/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const decoded = decode(fs.readFileSync(inputPath, "utf8"));
const chunks = decoded.split('"CloudExercise"').slice(1);
const exercises = [];
for (const [index, chunk] of chunks.entries()) {
  const window = chunk.slice(0, 8000);
  const idMatch = window.match(/"id",(\d+)/);
  const htmlMatch = window.match(/"(<p>[\s\S]*?)","(?:[\^A-Za-z0-9_]+)"/);
  const titleMatch = window.match(/"title","([^"]{2,240})"/);
  const description = htmlMatch ? strip(htmlMatch[1]) : "";
  if (description) exercises.push({ ordinal: index + 1, sourceExerciseId: idMatch?.[1] ?? null, title: titleMatch?.[1] ?? null, description });
}
const outputPath = path.join(path.dirname(inputPath), `${path.basename(inputPath, ".html")}.cloud-exercises.json`);
fs.writeFileSync(outputPath, `${JSON.stringify({ inputPath, exerciseCount: exercises.length, exercises }, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, exerciseCount: exercises.length, sample: exercises.slice(0, 4) }, null, 2));
