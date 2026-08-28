import fs from "node:fs";

const sourcePath = "/home/ubuntu/datacamp_packages/ai-for-consulting/package/ai-for-consulting/COURSE_MANIFEST.json";
const coursePath = "client/public/data/courses/ai_for_consulting__01.json";
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));

const sourceByKey = new Map(
  source.chapters.flatMap((chapter) => chapter.activities.map((activity) => [`${activity.chapter_number}.${activity.exercise_number}`, activity])),
);

function parseCriteria(prompt, prefix) {
  const match = typeof prompt === "string" && prompt.match(/<required_elements>\s*([\s\S]*?)\s*<\/required_elements>/i);
  if (!match) return [];
  return match[1]
    .split(/\n(?=\s*\d+\.\s+\*\*)/)
    .map((entry) => entry.trim())
    .filter((entry) => /^\d+\.\s+\*\*/.test(entry))
    .map((entry, index) => {
      const clean = entry.replace(/^\d+\.\s+/, "").trim();
      const labelMatch = clean.match(/^\*\*([^*]+)\*\*\s*:\s*([\s\S]*)$/);
      const sourceLabel = labelMatch?.[1]?.trim() || `Critère ${index + 1}`;
      const labels = {
        Goal: "Objectif",
        Style: "Style",
        Context: "Contexte",
        Examples: "Exemples",
        "Use-cases about consultancy": "Cas d’usage pour le conseil",
      };
      return {
        id: `${prefix}_criterion_${index + 1}`,
        label: labels[sourceLabel] || sourceLabel,
        description: (labelMatch?.[2] || clean).trim(),
        weight: 1,
      };
    });
}

function localiseAssistantText(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/<details(?:\s+[^>]*)?>\s*<summary>([\s\S]*?)<\/summary>/gi, "\n\n**$1**\n")
    .replace(/<\/details>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/Microsoft Copilot/gi, "un assistant IA génératif de votre choix")
    .replace(/\bCopilot\b/gi, "l’assistant IA choisi")
    .replace(/Cliquez sur l[’']icône [^\n]+(?:\n|$)/gi, "Ouvrez une nouvelle conversation dans l’assistant IA choisi.\n")
    .replace(/Si vous rencontrez des problèmes de connexion[^\n]*\n?/gi, "")
    .replace(/attendre le chargement complet de la fenêtre[^\n]*\n?/gi, "Ouvrez l’assistant IA choisi et démarrez une nouvelle conversation.\n")
    .replace(/appuyez sur _Enter_ pour l[’']envoyer à l[’']assistant IA choisi/gi, "envoyez l’invite dans l’assistant IA choisi")
    .replace(/(Ouvrez une nouvelle conversation dans l’assistant IA choisi\.\n)\1/g, "$1")
    .trim();
}

function localiseValue(value) {
  if (typeof value === "string") return localiseAssistantText(value);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([language, text]) => [language, localiseAssistantText(text)]));
  return value;
}

let converted = 0;
let removed = 0;
let externalReferencesRemoved = 0;

for (const lesson of course.lessons ?? []) {
  lesson.chapters = (lesson.chapters ?? []).filter((chapter) => {
    if (chapter.id === "dc_ch03_act09") {
      removed += 1;
      return false;
    }
    return true;
  });

  for (const chapter of lesson.chapters ?? []) {
    const activityMatch = chapter.id?.match(/^dc_ch(\d+)_act(\d+)$/);
    if (!activityMatch) continue;
    const sourceActivity = sourceByKey.get(`${Number(activityMatch[1])}.${Number(activityMatch[2])}`);
    const prompt = sourceActivity?.content?.question?.prompt;
    let hasAdaptedCloudExercise = false;
    for (const block of chapter.blocks ?? []) {
      if (block.type === "cloud_exercise") {
        const criteria = parseCriteria(prompt, block.id || chapter.id);
        if (criteria.length > 0) {
          hasAdaptedCloudExercise = true;
          block.rubricCriteria = criteria;
          block.maxScore = criteria.length;
          block.passingScore = criteria.length;
          block.minWords = 1;
          block.evaluationPrompt = localiseAssistantText(block.assignment);
          block.rubricVersion = "datacamp-source-2026-08-28";
          if (sourceActivity?.content?.question?.solution) block.solution = localiseAssistantText(sourceActivity.content.question.solution);
          if (sourceActivity?.content?.question?.successMessage) block.successMessage = localiseAssistantText(sourceActivity.content.question.successMessage);
          converted += 1;
        }
        block.title = localiseValue(block.title);
        block.assignment = localiseAssistantText(block.assignment);
        block.instructions = localiseAssistantText(block.instructions);
        block.hint = localiseAssistantText(block.hint);
        if (criteria.length > 0) block.evaluationPrompt = block.assignment;
        block.environmentGuide = {
          fr: "Utilisez un assistant IA génératif auquel vous avez personnellement accès. Créez une nouvelle conversation et ne communiquez ni clé API, ni donnée confidentielle ou personnelle.",
          en: "Use a generative AI assistant you can personally access. Start a new conversation and never include an API key, confidential information, or personal data.",
        };
        delete block.xp;
      }
      if (Array.isArray(block.projectorSlides)) {
        for (const slide of block.projectorSlides) {
          for (const field of ["content", "contentLeft", "contentRight"]) {
            if (typeof slide[field] !== "string" || !/datacamp\.com/i.test(slide[field])) continue;
            const withoutLinks = slide[field]
              .replace(/^\s*\*\*Autres outils d’IA\*\*[\s\S]*$/im, "")
              .replace(/^\s*\*\s*\[[^\]]+\]\(https?:\/\/[^)]+\)\s*$/gim, "")
              .replace(/&nbsp;\s*/g, "")
              .trim();
            if (withoutLinks !== slide[field]) externalReferencesRemoved += 1;
            slide[field] = withoutLinks;
          }
        }
      }
    }
    if (hasAdaptedCloudExercise) {
      chapter.title = localiseValue(chapter.title);
      chapter.subtitle = localiseValue(chapter.subtitle);
      chapter.description = localiseValue(chapter.description);
    }
  }
}

course.exerciseCount = (course.lessons ?? []).flatMap((lesson) => lesson.chapters ?? []).filter((chapter) => chapter.type === "exercise" || chapter.type === "quiz").length;
fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
console.log(JSON.stringify({ converted, removed, externalReferencesRemoved, exerciseCount: course.exerciseCount }, null, 2));
