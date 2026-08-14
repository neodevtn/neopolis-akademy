import fs from "node:fs";
import path from "node:path";

const courseDirectory = path.resolve("client/public/data/courses");
let changed = 0;

function alreadyStructured(text) {
  return /^#{1,3}\s/m.test(text) || /^(?:[-*•]|\d+\.)\s/m.test(text) || /\n\s*\n/.test(text) || /(?:\*\*[^*]+\*\*|(?<!\*)\*[^*\n]+\*)/.test(text);
}

function structureText(source) {
  const text = source.trim();
  if (text.length < 350 || alreadyStructured(text)) return source;

  // Existing course notes sometimes use single line breaks between semantic steps.
  // Preserve every word and make these breaks readable paragraphs.
  if (text.includes("\n")) return text.replace(/\n(?!\n)/g, "\n\n");

  // Preserve every original word. Only introduce whitespace and Markdown list markers.
  const objectives = text.match(/^(.{0,140}?(?:you will learn|vous allez apprendre|vous apprendrez)\s*:\s*)([\s\S]+)$/i);
  if (objectives && /\b1\)/.test(objectives[2])) {
    const items = objectives[2]
      .split(/\s+(?=\d+\))/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (items.length >= 2) return `**${objectives[1].trim()}**\n\n${items.map((item) => `- ${item}`).join("\n")}`;
  }

  const sentences = text.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Þ])/).map((item) => item.trim()).filter(Boolean);
  if (sentences.length < 3) return source;
  const paragraphs = [];
  for (let index = 0; index < sentences.length; index += 2) paragraphs.push(sentences.slice(index, index + 2).join(" "));
  return paragraphs.join("\n\n");
}

function walk(node) {
  if (Array.isArray(node)) return node.forEach(walk);
  if (!node || typeof node !== "object") return;
  for (const [key, value] of Object.entries(node)) {
    if (["body", "content", "instructions", "description"].includes(key)) {
      if (typeof value === "string") {
        const next = structureText(value);
        if (next !== value) { node[key] = next; changed += 1; }
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        for (const language of ["en", "fr"]) {
          if (typeof value[language] === "string") {
            const next = structureText(value[language]);
            if (next !== value[language]) { value[language] = next; changed += 1; }
          }
        }
      }
    }
    walk(value);
  }
}

for (const filename of fs.readdirSync(courseDirectory).filter((name) => name.endsWith(".json"))) {
  const file = path.join(courseDirectory, filename);
  const course = JSON.parse(fs.readFileSync(file, "utf8"));
  walk(course);
  fs.writeFileSync(file, `${JSON.stringify(course, null, 2)}\n`);
}

console.log(JSON.stringify({ changed }, null, 2));
