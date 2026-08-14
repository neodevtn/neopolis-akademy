import fs from "node:fs";
import path from "node:path";

const courseDirectory = path.resolve("client/public/data/courses");
const reportPath = path.resolve("docs/text-content-audit.json");
const records = [];

function inspectText(value, location, courseFile, language = "string") {
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return;
    const lines = text.split(/\r?\n/).filter(Boolean);
    const hasHeading = /^#{1,3}\s/m.test(text);
    const hasList = /^(?:[-*•]|\d+\.)\s/m.test(text);
    const hasEmphasis = /(?:\*\*[^*]+\*\*|(?<!\*)\*[^*\n]+\*)/.test(text);
    const hasQuote = /^>\s/m.test(text);
    const hasParagraphs = /\n\s*\n/.test(text);
    const isLongFlatText = text.length >= 350 && !hasHeading && !hasList && !hasEmphasis && !hasQuote && !hasParagraphs;
    records.push({
      courseFile,
      location,
      language,
      characters: text.length,
      lines: lines.length,
      signals: { hasHeading, hasList, hasEmphasis, hasQuote, hasParagraphs, isLongFlatText },
      sample: text.slice(0, 220),
    });
    return;
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const language of ["en", "fr"]) {
      if (typeof value[language] === "string") inspectText(value[language], location, courseFile, language);
    }
  }
}

function walk(node, location, courseFile) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => walk(item, `${location}[${index}]`, courseFile));
    return;
  }
  if (!node || typeof node !== "object") return;

  for (const [key, value] of Object.entries(node)) {
    const nextLocation = location ? `${location}.${key}` : key;
    if (["body", "content", "text", "description", "instructions"].includes(key)) inspectText(value, nextLocation, courseFile);
    walk(value, nextLocation, courseFile);
  }
}

for (const filename of fs.readdirSync(courseDirectory).filter((name) => name.endsWith(".json"))) {
  try {
    const course = JSON.parse(fs.readFileSync(path.join(courseDirectory, filename), "utf8"));
    walk(course, "", filename);
  } catch (error) {
    records.push({ courseFile: filename, error: String(error) });
  }
}

const byLanguage = Object.fromEntries(["en", "fr", "string"].map((language) => {
  const items = records.filter((record) => record.language === language);
  return [language, {
    total: items.length,
    flatLong: items.filter((record) => record.signals?.isLongFlatText).length,
    headings: items.filter((record) => record.signals?.hasHeading).length,
    lists: items.filter((record) => record.signals?.hasList).length,
    emphasis: items.filter((record) => record.signals?.hasEmphasis).length,
  }];
}));

const report = {
  generatedAt: new Date().toISOString(),
  totals: byLanguage,
  flatLongCandidates: records.filter((record) => record.signals?.isLongFlatText),
  records,
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ totals: byLanguage, flatLongCandidates: report.flatLongCandidates.length, reportPath }, null, 2));
