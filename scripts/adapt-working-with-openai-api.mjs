import fs from "node:fs";
import path from "node:path";

const coursePath = path.resolve("client/public/data/courses/working_with_the_openai_api__01.json");
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));

const cleanText = (value) => value
  .replace(/(?:^|\n)XP\s+quotidiens\s*\n\d+\s*(?:\n|$)/gi, "\n")
  .replace(/(?:^|\n)\d+\s+https:\/\/(?:www\.datacamp\.com\/datalab|platform\.openai\.com\/tokenizer|openai\.com\/pricing)(?:\n|$)/gi, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const cleanVisibleStrings = (value, inheritedTechnical = false) => {
  if (typeof value === "string") return inheritedTechnical ? value : cleanText(value);
  if (Array.isArray(value)) return value.map((item) => cleanVisibleStrings(item, inheritedTechnical));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    cleanVisibleStrings(item, inheritedTechnical || key === "datacampImport"),
  ]));
};

const cleaned = cleanVisibleStrings(course);
fs.writeFileSync(coursePath, `${JSON.stringify(cleaned, null, 2)}\n`);
console.log("Cours OpenAI nettoyé : XP importé et URLs externes retirés des textes apprenant.");
