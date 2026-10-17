#!/usr/bin/env node
/**
 * Remédiation pédagogique P0/P1/P2 fondée uniquement sur le contenu déjà
 * disponible dans les cours : aucune donnée métier, réponse ou ressource n'est
 * inventée. Les activités irréalisables sont remplacées par le contenu de leur
 * écran, afin de préserver le parcours sans imposer un verrou impossible.
 *
 * Usage:
 *   node scripts/remediate-pedagogical-p0-p2.mjs
 *   node scripts/remediate-pedagogical-p0-p2.mjs --check
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const coursesDir = path.join(root, "client", "public", "data", "courses");
const manifestPath = path.join(root, "pedagogical-audit", "p0-p2-remediation-manifest.json");
const checkOnly = process.argv.includes("--check");

const localize = (value, fallback = "") => {
  if (typeof value === "string") return { fr: value, en: value };
  if (value && typeof value === "object") {
    const fr = typeof value.fr === "string" ? value.fr : typeof value.en === "string" ? value.en : fallback;
    const en = typeof value.en === "string" ? value.en : typeof value.fr === "string" ? value.fr : fallback;
    return { fr, en };
  }
  return { fr: fallback, en: fallback };
};

const stripMarkup = (value) => String(value || "")
  .replace(/<[^>]+>/g, "")
  .replace(/[\s#*_`>|-]+/g, " ")
  .trim();

const meaningful = (value, minimum = 20) => {
  const localized = localize(value);
  return stripMarkup(localized.fr).length >= minimum || stripMarkup(localized.en).length >= minimum;
};

const visibleTitle = (chapter, block) => localize(chapter.title || block.title, "cet écran");

function explicitUnavailableArtifact(block) {
  const raw = JSON.stringify(block).toLowerCase();
  const hasResource = Array.isArray(block.resources) && block.resources.some((resource) => typeof resource?.url === "string" && resource.url.trim());
  if (hasResource) return false;
  return [
    "desktop/resources",
    "dossier resources",
    "pack neopolis",
    "téléverser le fichier",
    "televerser le fichier",
    "upload the file",
    "call_transcript.pdf",
  ].some((marker) => raw.includes(marker));
}

function incompleteExecutableInstructions(block) {
  const source = `${String(block.instructions || "")}\n${String(block.hint || "")}`;
  return /```[^`]*\\\s*```/s.test(source) || /api_key=\\\s*```/s.test(source);
}

function replacementContent(chapter, block) {
  const fromChapter = chapter.description || chapter.summary || chapter.body;
  const fromAssignment = block.assignment || block.instructions || block.prompt;
  const body = meaningful(fromChapter) ? localize(fromChapter) : localize(fromAssignment);
  return {
    type: "content",
    id: `${block.id || chapter.id || "screen"}_learning_note`,
    title: visibleTitle(chapter, block),
    body,
    remediation: {
      reason: "activity_removed_unverifiable_or_incomplete_source",
      sourcePreserved: true,
    },
  };
}

function genericSteps(chapter, block) {
  const title = visibleTitle(chapter, block);
  return [
    {
      fr: `Relisez la consigne et identifiez le résultat attendu pour « ${title.fr} ».`,
      en: `Review the instructions and identify the expected outcome for “${title.en}”.`,
    },
    {
      fr: "Réalisez la tâche avec les informations et ressources fournies sur cet écran, sans utiliser de donnée confidentielle.",
      en: "Complete the task with the information and resources provided on this screen, without using confidential data.",
    },
    {
      fr: "Vérifiez votre production au regard des critères indiqués avant de la soumettre.",
      en: "Check your work against the stated criteria before submitting it.",
    },
  ];
}

function videoObjective(chapter, block) {
  const title = visibleTitle(chapter, block);
  return {
    fr: `Pendant cette vidéo, repérez les éléments qui illustrent « ${title.fr} » avant de poursuivre.`,
    en: `While watching, identify the elements that illustrate “${title.en}” before continuing.`,
  };
}

const manifest = {
  generatedAt: new Date().toISOString(),
  policy: "No missing files, datasets, answers, or factual explanations are invented. An impracticable graded activity is replaced by its existing screen content.",
  convertedActivities: [],
  structuredActivities: [],
  contextualizedVideos: [],
  restoredLegacyRubrics: [],
  copiedFeedbackFromExistingHints: [],
  addedInteractionInstructions: [],
};

let changes = 0;
for (const filename of fs.readdirSync(coursesDir).filter((name) => name.endsWith(".json")).sort()) {
  const filePath = path.join(coursesDir, filename);
  const course = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let courseChanged = false;

  for (const lesson of course.lessons || []) {
    for (const chapter of lesson.chapters || []) {
      const blocks = Array.isArray(chapter.blocks) ? chapter.blocks : [];
      chapter.blocks = blocks.flatMap((block) => {
        if (block?.type !== "cloud_exercise") return [block];
        const reason = explicitUnavailableArtifact(block)
          ? "required_artifact_not_available_in_media_library"
          : incompleteExecutableInstructions(block)
            ? "source_instruction_is_truncated_and_not_reproducible" : null;
        if (!reason) return [block];

        const replacement = replacementContent(chapter, block);
        if (!meaningful(replacement.body)) return [];
        chapter.type = "content";
        chapter.requiredBeforeAdvance = false;
        delete chapter.completionRule;
        courseChanged = true;
        changes += 1;
        manifest.convertedActivities.push({ courseId: course.courseId, chapterId: chapter.id, blockId: block.id || null, reason, replacementBlockId: replacement.id });
        return [replacement];
      });

      for (const block of chapter.blocks) {
        if (block?.type === "cloud_exercise" && (!Array.isArray(block.steps) || block.steps.length === 0) && (meaningful(block.assignment) || meaningful(block.instructions))) {
          block.steps = genericSteps(chapter, block);
          courseChanged = true;
          changes += 1;
          manifest.structuredActivities.push({ courseId: course.courseId, chapterId: chapter.id, blockId: block.id || null });
        }

        if (block?.type === "video" && !meaningful(block.objectiveBefore) && !meaningful(block.alternativeTextFr) && !meaningful(block.transcript) && !(Array.isArray(block.questionsAfter) && block.questionsAfter.length > 0)) {
          block.objectiveBefore = videoObjective(chapter, block);
          courseChanged = true;
          changes += 1;
          manifest.contextualizedVideos.push({ courseId: course.courseId, chapterId: chapter.id, blockId: block.id || null });
        }

        if (block?.type === "ai_evaluation" && Array.isArray(block.rubricCriteria) && block.rubricCriteria.length > 0 && block.rubricCriteria.every((criterion) => criterion?.source === "legacy_rubric")) {
          // The original text rubric is displayed by the reusable evaluation
          // component and is also used by TekTek to give exact submission
          // guidance. Do not replace it with a lossy generated paraphrase.
          delete block.rubricCriteria;
          courseChanged = true;
          changes += 1;
          manifest.restoredLegacyRubrics.push({ courseId: course.courseId, chapterId: chapter.id, blockId: block.id || null });
        }

        if (["bucket_sort", "matching", "ordering", "fill_blank", "terminal_sim", "code_repl"].includes(block?.type) && !meaningful(block.instructions)) {
          const title = visibleTitle(chapter, block);
          block.instructions = {
            fr: `Réalisez l’activité « ${title.fr} » puis vérifiez chaque réponse avant de valider.`,
            en: `Complete the “${title.en}” activity, then check each answer before submitting.`,
          };
          courseChanged = true;
          changes += 1;
          manifest.addedInteractionInstructions.push({ courseId: course.courseId, chapterId: chapter.id, blockId: block.id || null, type: block.type });
        }

        if (["single_choice_exercise", "multi_choice_exercise"].includes(block?.type) && !block.serverValidated && !meaningful(block.explanation) && meaningful(block.hint)) {
          block.explanation = block.hint;
          courseChanged = true;
          changes += 1;
          manifest.copiedFeedbackFromExistingHints.push({ courseId: course.courseId, chapterId: chapter.id, blockId: block.id || null });
        }
      }
    }
  }

  if (courseChanged && !checkOnly) fs.writeFileSync(filePath, `${JSON.stringify(course, null, 2)}\n`);
}

// The manifest describes the durable current state, rather than only the
// mutations made by this particular run. This keeps the evidence for a
// deliberate removal available after an idempotence check.
const currentConversions = [];
for (const filename of fs.readdirSync(coursesDir).filter((name) => name.endsWith(".json")).sort()) {
  const course = JSON.parse(fs.readFileSync(path.join(coursesDir, filename), "utf8"));
  for (const lesson of course.lessons || []) {
    for (const chapter of lesson.chapters || []) {
      for (const block of chapter.blocks || []) {
        if (block?.type === "content" && block?.remediation?.sourcePreserved === true) {
          currentConversions.push({
            courseId: course.courseId,
            chapterId: chapter.id,
            blockId: block.id || null,
            reason: block.remediation.reason || "activity_removed_unverifiable_or_incomplete_source",
          });
        }
      }
    }
  }
}
manifest.convertedActivities = currentConversions;

if (!checkOnly) fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ checkOnly, changes, manifest: path.relative(root, manifestPath), counts: Object.fromEntries(Object.entries(manifest).filter(([, value]) => Array.isArray(value)).map(([key, value]) => [key, value.length])) }, null, 2));
