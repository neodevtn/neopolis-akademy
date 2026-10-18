#!/usr/bin/env node
/**
 * Applique, de façon idempotente, les décisions P0/P1 revues formation par
 * formation. Une décision n'est exécutée que si le cours, le chapitre et le
 * bloc (lorsqu'il est précisé) correspondent encore exactement au JSON actuel.
 *
 * Politique : ne jamais inventer un actif, une donnée ou une correction ; ne
 * jamais retirer une vidéo, un téléchargement ou un contenu pédagogique valide
 * pour résoudre une anomalie d'activité. Une activité non vérifiable devient
 * du contenu source non bloquant si sa consigne est exploitable, sinon elle est
 * retirée. Les portes sont ensuite recalculées à partir des blocs restants.
 *
 * Usage:
 *   node scripts/apply-verified-p0-p1-remediations.mjs
 *   node scripts/apply-verified-p0-p1-remediations.mjs --check
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const coursesDir = path.join(root, "client", "public", "data", "courses");
const plansDir = path.join(root, "pedagogical-audit", "p0-p1-remediation-plans");
const manifestPath = path.join(root, "pedagogical-audit", "p0-p1-verified-remediation-manifest.json");
const checkOnly = process.argv.includes("--check");

const interactiveTypes = new Set([
  "checkpoint", "single_choice_exercise", "multi_choice_exercise", "resource_review",
  "cloud_exercise", "course_final_quiz", "reflection", "guided_action", "bucket_sort",
  "matching", "ordering", "knowledge_check", "inline_myth_reality",
  "inline_multiple_choice_feedback", "inline_scenario_question_feedback", "ai_evaluation",
  "code_repl", "terminal_sim", "exercise",
]);
const removableActivityTypes = new Set(interactiveTypes);
const protectedTypes = new Set(["video", "download", "content", "callout", "transcript", "annotated_screenshot"]);
const knownActions = new Set([
  "remove_block", "convert_block_to_content", "remove_chapter", "remove_completion_requirement",
  "remove_orphan_exercise", "remove_stale_text_reference", "mark_false_positive",
]);

function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function writeJson(file, value) { if (!checkOnly) fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); }
function localize(value, fallback = "") {
  if (typeof value === "string") return { fr: value, en: value };
  if (value && typeof value === "object") {
    const fr = typeof value.fr === "string" ? value.fr : typeof value.en === "string" ? value.en : fallback;
    const en = typeof value.en === "string" ? value.en : typeof value.fr === "string" ? value.fr : fallback;
    return { fr, en };
  }
  return { fr: fallback, en: fallback };
}
function textLength(value) {
  const v = localize(value);
  return Math.max(v.fr.replace(/<[^>]*>/g, "").trim().length, v.en.replace(/<[^>]*>/g, "").trim().length);
}
function sourceText(block, chapter) {
  const candidates = [block.assignment, block.instructions, block.prompt, block.description, chapter.description, chapter.summary, chapter.body];
  return candidates.find((candidate) => textLength(candidate) >= 24) ?? null;
}
function toContent(block, chapter) {
  const body = sourceText(block, chapter);
  if (!body) return null;
  return {
    type: "content",
    id: `${block.id || chapter.id || "screen"}_learning_note`,
    title: localize(block.title || chapter.title, "Note pédagogique"),
    body: localize(body),
    remediation: { sourcePreserved: true, reason: "activity_removed_unverifiable_or_unprovided" },
  };
}
function findChapter(course, chapterId) {
  for (const lesson of course.lessons || []) {
    for (const chapter of lesson?.chapters || []) if (chapter?.id === chapterId) return { lesson, chapter };
  }
  return null;
}
function findBlock(chapter, blockId) {
  if (!Array.isArray(chapter?.blocks)) return null;
  return chapter.blocks.find((block) => block && typeof block === "object" && block.id === blockId) ?? null;
}
function scopedBlock(chapter, action) {
  if (!action.block_id) return null;
  return findBlock(chapter, action.block_id);
}
function hasGatedActivity(chapter) {
  return (chapter.blocks || []).some((block) => {
    if (!block || typeof block !== "object") return false;
    if (block.type === "exercise" && block.exercise_type === "numeric_answers") return true;
    return interactiveTypes.has(block.type);
  });
}
function normalizeChapterGate(chapter, forceNonBlocking) {
  const before = JSON.stringify({ requiredBeforeAdvance: chapter.requiredBeforeAdvance, completionRule: chapter.completionRule });
  const remainingGated = hasGatedActivity(chapter);
  if (forceNonBlocking || !remainingGated) {
    chapter.requiredBeforeAdvance = false;
    delete chapter.completionRule;
    delete chapter.requiredExercisesPassed;
  } else if (chapter.completionRule?.requires && Array.isArray(chapter.completionRule.requires)) {
    const requires = chapter.completionRule.requires.filter((requirement) => {
      if (requirement === "cloudExerciseCompleted") return (chapter.blocks || []).some((block) => block?.type === "cloud_exercise");
      if (requirement === "requiredExercisesPassed") return (chapter.blocks || []).some((block) => interactiveTypes.has(block?.type) && block?.type !== "cloud_exercise");
      if (requirement === "videosViewed") return (chapter.blocks || []).some((block) => block?.type === "video" && block.optional !== true);
      return true;
    });
    if (requires.length) chapter.completionRule.requires = requires;
    else delete chapter.completionRule;
  }
  return before !== JSON.stringify({ requiredBeforeAdvance: chapter.requiredBeforeAdvance, completionRule: chapter.completionRule });
}
function removeExerciseIfUnreferenced(course, exerciseId) {
  if (!exerciseId || !Array.isArray(course.exercises)) return false;
  const stillReferenced = (course.lessons || []).some((lesson) => (lesson?.chapters || []).some((chapter) =>
    (chapter?.blocks || []).some((block) => block?.type === "checkpoint" && block.exerciseId === exerciseId),
  ));
  if (stillReferenced) return false;
  const before = course.exercises.length;
  course.exercises = course.exercises.filter((exercise) => exercise?.id !== exerciseId);
  return course.exercises.length !== before;
}
function scrubKnownStaleText(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/\n?\s*(?:À vous(?: maintenant)? de (?:pratiquer|vous entraîner|traduire)[^.!?]*[.!?]|Maintenant, passez aux exercices\s*[.!?]|Now(?:,)? (?:try|practise|practice)[^.!?]*[.!?])/giu, "")
    .replace(/\s{3,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
function scrubObject(value) {
  if (typeof value === "string") return scrubKnownStaleText(value);
  if (Array.isArray(value)) return value.map(scrubObject);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, scrubObject(entry)]));
  return value;
}
function architectIntroductionReplacement(block) {
  const body = localize(block.body);
  return {
    ...block,
    body: {
      fr: "## Bienvenue\n\nCe module présente les repères nécessaires pour aborder les contenus qui suivent, notamment la délégation. Avancez écran par écran et utilisez la navigation pour revoir un point si nécessaire.\n\n**Durée estimée :** 15–25 minutes",
      en: "## Welcome\n\nThis module introduces the reference points needed for the following content, including delegation. Move through one screen at a time and use the navigation to review a point when needed.\n\n**Estimated time:** 15–25 minutes",
    },
    remediation: { sourcePreserved: false, reason: "obsolete_architecture_track_claims_removed" },
  };
}

const previous = fs.existsSync(manifestPath) ? readJson(manifestPath) : { executed: [], skipped: [], falsePositives: [] };
// The first large run predates the durable history field. Its aggregate is
// retained here so subsequent idempotent runs never erase the audit trail.
const reconstructedInitialRun = {
  generatedAt: "2026-10-18T13:20:19.000Z",
  source: "initial_verified_application",
  summary: {
    coursesChanged: 111,
    executed: 1885,
    byResult: {
      activity_block_removed: 483,
      activity_converted_to_source_preserved_content: 197,
      architect_introduction_rewritten_without_obsolete_promises: 1,
      chapter_queued_for_removal: 9,
      chapter_removed: 387,
      existing_content_screen_made_non_blocking: 1,
      known_stale_instruction_removed: 19,
      screen_made_non_blocking: 788,
    },
  },
};
const previousHistory = Array.isArray(previous.migrationHistory)
  ? previous.migrationHistory
  : [reconstructedInitialRun, ...(previous.summary?.executed ? [{
    generatedAt: previous.generatedAt || null,
    source: "previous_manifest_snapshot",
    summary: previous.summary,
  }] : [])];
const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  policy: "Execute only an action whose target currently resolves exactly. Preserve valid videos, downloads and explanatory content. Convert only unverified activity instructions to non-blocking source-preserved content; remove corresponding gates and orphan exercise definitions.",
  executed: [],
  skipped: [],
  falsePositives: [],
  planFiles: [],
  migrationHistory: previousHistory,
};
const changedCourses = new Set();
const plans = fs.readdirSync(plansDir).filter((name) => name.endsWith(".json")).sort().map((name) => ({ name, plan: readJson(path.join(plansDir, name)) }));
const actionsByCourse = new Map();
for (const { name, plan } of plans) {
  manifest.planFiles.push(name);
  for (const action of plan.actions || []) {
    if (!knownActions.has(action?.action)) {
      manifest.skipped.push({ plan: name, action, reason: "unknown_action" });
      continue;
    }
    const courseId = action.course_id;
    if (!courseId) {
      manifest.skipped.push({ plan: name, action, reason: "course_id_missing" });
      continue;
    }
    if (!actionsByCourse.has(courseId)) actionsByCourse.set(courseId, []);
    actionsByCourse.get(courseId).push({ ...action, plan: name });
  }
}

for (const [courseId, actions] of actionsByCourse) {
  const coursePath = path.join(coursesDir, `${courseId}.json`);
  if (!fs.existsSync(coursePath)) {
    for (const action of actions) manifest.skipped.push({ plan: action.plan, action, reason: "course_not_found" });
    continue;
  }
  const course = readJson(coursePath);
  let changed = false;
  const chaptersToRemove = new Set();
  const forcedNonBlocking = new Set();
  const exercisesToCheck = new Set();

  // Blocks first, then chapter/gate cleanup in a second deterministic pass.
  for (const action of actions) {
    const target = action.chapter_id ? findChapter(course, action.chapter_id) : null;
    if (action.action === "mark_false_positive") {
      manifest.falsePositives.push({ plan: action.plan, courseId, chapterId: action.chapter_id || null, reason: action.reason, evidence: action.evidence });
      continue;
    }
    if (!target) {
      manifest.skipped.push({ plan: action.plan, action, reason: "chapter_not_found" });
      continue;
    }
    const { chapter } = target;
    if (action.action === "remove_chapter") {
      chaptersToRemove.add(chapter);
      manifest.executed.push({ plan: action.plan, action, result: "chapter_queued_for_removal" });
      changed = true;
      continue;
    }
    if (action.action === "remove_completion_requirement") {
      forcedNonBlocking.add(chapter);
      continue;
    }
    if (action.action === "remove_orphan_exercise") {
      exercisesToCheck.add(action.exercise_id);
      continue;
    }
    if (action.action === "remove_stale_text_reference") {
      if (courseId === "claude_certified_architect_foundations__01" && chapter.id === "chapter_01_1") {
        const content = (chapter.blocks || []).find((block) => block?.type === "content");
        if (content) {
          const replacement = architectIntroductionReplacement(content);
          if (JSON.stringify(content) !== JSON.stringify(replacement)) {
            Object.assign(content, replacement);
            manifest.executed.push({ plan: action.plan, action, result: "architect_introduction_rewritten_without_obsolete_promises" });
            changed = true;
          } else {
            manifest.skipped.push({ plan: action.plan, action, reason: "already_applied" });
          }
        } else manifest.skipped.push({ plan: action.plan, action, reason: "architect_content_block_not_found" });
      } else {
        const selected = action.block_id ? scopedBlock(chapter, action) : null;
        if (!selected) {
          manifest.skipped.push({ plan: action.plan, action, reason: "stale_reference_requires_exact_block_id_or_supported_safe_rewrite" });
        } else {
          const before = JSON.stringify(selected);
          const cleaned = scrubObject(selected);
          if (before === JSON.stringify(cleaned)) manifest.skipped.push({ plan: action.plan, action, reason: "no_exact_safe_stale_phrase_found" });
          else {
            Object.assign(selected, cleaned);
            manifest.executed.push({ plan: action.plan, action, result: "known_stale_instruction_removed" });
            changed = true;
          }
        }
      }
      continue;
    }

    const selected = action.block_id ? scopedBlock(chapter, action) : null;
    if (!selected && action.block_id) {
      manifest.skipped.push({ plan: action.plan, action, reason: "block_not_found" });
      continue;
    }
    if (action.action === "convert_block_to_content" && !selected) {
      // A plan with no block ID can only make an already-rendered content screen
      // non-blocking. Its original text remains available; no new activity is created.
      if ((chapter.blocks || []).some((block) => block?.type === "content")) {
        if (normalizeChapterGate(chapter, true)) {
          manifest.executed.push({ plan: action.plan, action, result: "existing_content_screen_made_non_blocking" });
          changed = true;
        } else {
          manifest.skipped.push({ plan: action.plan, action, reason: "already_applied" });
        }
      } else manifest.skipped.push({ plan: action.plan, action, reason: "content_block_not_found_for_blockless_conversion" });
      continue;
    }
    if (protectedTypes.has(selected?.type)) {
      manifest.skipped.push({ plan: action.plan, action, reason: "protected_valid_media_or_content_block" });
      continue;
    }
    if (!removableActivityTypes.has(selected?.type)) {
      manifest.skipped.push({ plan: action.plan, action, reason: "target_is_not_a_supported_activity_block" });
      continue;
    }
    if (action.action === "remove_block") {
      chapter.blocks = (chapter.blocks || []).filter((block) => block !== selected);
      forcedNonBlocking.add(chapter);
      if (selected.exerciseId) exercisesToCheck.add(selected.exerciseId);
      if (action.exercise_id) exercisesToCheck.add(action.exercise_id);
      manifest.executed.push({ plan: action.plan, action, result: "activity_block_removed" });
      changed = true;
    } else if (action.action === "convert_block_to_content") {
      const replacement = toContent(selected, chapter);
      if (replacement) {
        chapter.blocks = (chapter.blocks || []).map((block) => block === selected ? replacement : block);
        if (selected.exerciseId) exercisesToCheck.add(selected.exerciseId);
        if (action.exercise_id) exercisesToCheck.add(action.exercise_id);
        forcedNonBlocking.add(chapter);
        manifest.executed.push({ plan: action.plan, action, result: "activity_converted_to_source_preserved_content" });
      } else {
        chapter.blocks = (chapter.blocks || []).filter((block) => block !== selected);
        forcedNonBlocking.add(chapter);
        if (selected.exerciseId) exercisesToCheck.add(selected.exerciseId);
        if (action.exercise_id) exercisesToCheck.add(action.exercise_id);
        manifest.executed.push({ plan: action.plan, action, result: "activity_removed_without_usable_instruction" });
      }
      changed = true;
    }
  }

  for (const lesson of course.lessons || []) {
    if (!Array.isArray(lesson?.chapters)) continue;
    for (const chapter of lesson.chapters) {
      if (chaptersToRemove.has(chapter)) continue;
      // Do not infer a removal from the mere absence of an interactive block.
      // A video- or content-only screen can legitimately retain its own
      // progression policy. Only an explicitly reviewed action is allowed to
      // make a chapter non-blocking.
      if (forcedNonBlocking.has(chapter)) {
        if (normalizeChapterGate(chapter, true)) {
          manifest.executed.push({ courseId, chapterId: chapter.id || null, action: "normalize_completion_rule", result: "screen_made_non_blocking" });
          changed = true;
        }
      }
      if (!Array.isArray(chapter.blocks) || chapter.blocks.length === 0) chaptersToRemove.add(chapter);
    }
    const removedFromLesson = lesson.chapters.filter((chapter) => chaptersToRemove.has(chapter));
    if (removedFromLesson.length) {
      lesson.chapters = lesson.chapters.filter((chapter) => !chaptersToRemove.has(chapter));
      changed = true;
      for (const chapter of removedFromLesson) {
        manifest.executed.push({ courseId, chapterId: chapter.id || null, action: "remove_empty_or_corrupt_chapter", result: "chapter_removed" });
      }
    }
  }
  // An empty lesson is not an educational screen and causes a dead-end in the
  // learner navigation. Remove it only when the course still has at least one
  // substantive lesson; this preserves the course rather than inventing a
  // replacement assessment or placeholder page.
  const nonEmptyLessons = (course.lessons || []).filter((lesson) => Array.isArray(lesson?.chapters) && lesson.chapters.length > 0);
  if (nonEmptyLessons.length > 0 && nonEmptyLessons.length !== (course.lessons || []).length) {
    for (const [lessonIndex, lesson] of (course.lessons || []).entries()) {
      if (!Array.isArray(lesson?.chapters) || lesson.chapters.length === 0) {
        manifest.executed.push({
          courseId,
          lessonId: lesson?.id || null,
          lessonIndex,
          action: "remove_empty_lesson",
          result: "lesson_removed_without_inventing_placeholder_content",
        });
      }
    }
    course.lessons = nonEmptyLessons;
    changed = true;
  }
  for (const exerciseId of exercisesToCheck) {
    if (removeExerciseIfUnreferenced(course, exerciseId)) {
      manifest.executed.push({ courseId, exerciseId, action: "remove_orphan_exercise", result: "exercise_definition_removed" });
      changed = true;
    }
  }
  if (changed) {
    changedCourses.add(courseId);
    writeJson(coursePath, course);
  }
}

manifest.summary = {
  plansRead: plans.length,
  coursesChanged: [...changedCourses].sort(),
  executed: manifest.executed.length,
  skipped: manifest.skipped.length,
  falsePositives: manifest.falsePositives.length,
  byResult: Object.fromEntries(Object.entries(manifest.executed.reduce((acc, entry) => {
    const key = entry.result || entry.action || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})).sort()),
  skippedByReason: Object.fromEntries(Object.entries(manifest.skipped.reduce((acc, entry) => {
    acc[entry.reason] = (acc[entry.reason] || 0) + 1;
    return acc;
  }, {})).sort()),
};
if (!checkOnly && manifest.executed.length > 0) {
  manifest.migrationHistory = [...previousHistory, {
    generatedAt: manifest.generatedAt,
    source: "verified_idempotent_application",
    summary: manifest.summary,
  }];
}
writeJson(manifestPath, manifest);
console.log(JSON.stringify({ checkOnly, ...manifest.summary, manifest: path.relative(root, manifestPath) }, null, 2));
