import fs from "node:fs";

const sourcePath = "/home/ubuntu/datacamp_packages/ai-for-human-resources/ai-for-human-resources/COURSE_MANIFEST.json";
const coursePath = "client/public/data/courses/ai_for_human_resources__01.json";
const trainingIndexPath = "client/src/data/trainingIndex.json";
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const courseId = course.courseId ?? course.id;
const sourceByKey = new Map(source.chapters.flatMap((chapter) => chapter.activities.map((activity) => [`${activity.chapter_number}.${activity.exercise_number}`, activity])));
const removedActivityIds = new Set(["dc_ch01_act08", "dc_ch02_act02", "dc_ch02_act05", "dc_ch02_act11", "dc_ch03_act03", "dc_ch03_act05", "dc_ch03_act09"]);

function toMarkdown(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/<details(?:\s+[^>]*)?>\s*<summary>([\s\S]*?)<\/summary>/gi, "\n\n**$1**\n")
    .replace(/<\/details>/gi, "").replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(?:p|div|span)>/gi, "\n").replace(/<\/?(?:ul|ol)>/gi, "\n")
    .replace(/<li>/gi, "- ").replace(/<\/li>/gi, "\n")
    .replace(/<\/?(?:strong|b)>/gi, "**").replace(/<\/?(?:em|i)>/gi, "_")
    .replace(/Microsoft Copilot/gi, "un assistant IA génératif de votre choix")
    .replace(/\bCopilot\b/gi, "l’assistant IA choisi")
    .replace(/Merci d[’']avoir fait ce parcours avec DataCamp\.?/gi, "Merci d’avoir suivi ce parcours.")
    .replace(/\bDataCamp\b/gi, "Neopolis Akademy")
    .replace(/DataCamp\s*(?:Lab|Workspace|Campus)|cloud\s+lab|VM\s+DataCamp/gi, "")
    .replace(/\b\d+\s*XP\b/gi, "").replace(/Indice\s*\(-?\d+\s*XP\)/gi, "Afficher l’indice")
    .replace(/\n{3,}/g, "\n\n").trim();
}

function localise(value) {
  if (typeof value === "string") return toMarkdown(value);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([language, text]) => [language, toMarkdown(text)]));
  return value;
}

function cleanLearnerText(value, field = "") {
  if (typeof value === "string") return /(?:id|url|src|path|filename|key|version)$/i.test(field) ? value : toMarkdown(value);
  if (Array.isArray(value)) return value.map((item) => cleanLearnerText(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cleanLearnerText(item, key)]));
  return value;
}

function parseCriteria(prompt, prefix) {
  const match = typeof prompt === "string" && prompt.match(/<required_elements>\s*([\s\S]*?)\s*<\/required_elements>/i);
  if (!match) return [];
  return match[1].split(/\n(?=\s*\d+\.\s+(?:\*\*)?)/).map((entry) => entry.trim()).filter((entry) => /^\d+\.\s+/.test(entry)).map((entry, index) => {
    const clean = entry.replace(/^\d+\.\s+/, "").trim();
    const labelMatch = clean.match(/^(?:\*\*([^*]+)\*\*|([^:\n]+))\s*:\s*([\s\S]*)$/);
    return { id: `${prefix}_criterion_${index + 1}`, label: (labelMatch?.[1] || labelMatch?.[2] || `Critère ${index + 1}`).trim(), description: (labelMatch?.[3] || clean).trim(), weight: 1 };
  });
}

let converted = 0;
let removed = 0;
for (const lesson of course.lessons ?? []) {
  lesson.chapters = (lesson.chapters ?? []).filter((chapter) => {
    if (!removedActivityIds.has(chapter.id)) return true;
    removed += 1;
    return false;
  });
  for (const chapter of lesson.chapters ?? []) {
    const match = chapter.id?.match(/^dc_ch(\d+)_act(\d+)$/);
    const sourceActivity = match ? sourceByKey.get(`${Number(match[1])}.${Number(match[2])}`) : null;
    const prompt = sourceActivity?.content?.question?.prompt;
    for (const block of chapter.blocks ?? []) {
      if (block.type !== "cloud_exercise") continue;
      const criteria = parseCriteria(prompt, block.id || chapter.id);
      if (criteria.length) {
        block.rubricCriteria = criteria;
        block.maxScore = criteria.length;
        block.passingScore = criteria.length;
        block.minWords = 1;
        block.rubricVersion = "datacamp-source-2026-08-28";
        block.evaluationPrompt = toMarkdown(block.assignment);
        converted += 1;
      }
      for (const field of ["title", "assignment", "instructions", "hint", "solution", "successMessage", "evaluationPrompt"]) block[field] = localise(block[field]);
      block.environmentGuide = { fr: "Utilisez un assistant IA génératif auquel vous avez personnellement accès. Créez une nouvelle conversation et ne communiquez ni clé API, ni donnée confidentielle ou personnelle.", en: "Use a generative AI assistant you can personally access. Start a new conversation and never include an API key, confidential information, or personal data." };
      delete block.xp;
    }
    for (const block of chapter.blocks ?? []) Object.assign(block, cleanLearnerText(block));
  }
}
course.exerciseCount = (course.lessons ?? []).flatMap((lesson) => lesson.chapters ?? []).filter((chapter) => chapter.type === "exercise" || chapter.type === "quiz").length;
fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
const trainingIndex = JSON.parse(fs.readFileSync(trainingIndexPath, "utf8"));
for (const entry of [...(trainingIndex.certifications ?? []), ...(trainingIndex.courses ?? [])]) {
  if (entry.id !== "datacamp_ai_for_human_resources" && entry.id !== courseId) continue;
  delete entry.breakdown;
  delete entry.exerciseLabel;
}
fs.writeFileSync(trainingIndexPath, `${JSON.stringify(trainingIndex, null, 2)}\n`);
console.log(JSON.stringify({ converted, removed, exerciseCount: course.exerciseCount }, null, 2));
