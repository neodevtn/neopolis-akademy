#!/usr/bin/env node
/**
 * Retire les checkpoints free_text sans correction machine-vérifiable et
 * normalise les blocs text/content historiques. Aucune question, donnée ou
 * réponse n'est inventée : les activités non évaluables sont retirées.
 *
 * Usage: node scripts/remediate-static-p0-p1.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const coursesDir = path.join(root, 'client/public/data/courses');
const manifestPath = path.join(root, 'pedagogical-audit/static-p0-p1-remediation-manifest.json');
const checkOnly = process.argv.includes('--check');
const gatedTypes = new Set([
  'checkpoint', 'single_choice_exercise', 'multi_choice_exercise', 'resource_review',
  'cloud_exercise', 'course_final_quiz', 'reflection', 'guided_action', 'bucket_sort',
  'matching', 'ordering', 'knowledge_check', 'inline_myth_reality',
  'inline_multiple_choice_feedback', 'inline_scenario_question_feedback',
]);

const previous = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : { version: 1, removedUnverifiableCheckpoints: [], prunedOrphanFreeTextDefinitions: [], normalizedLegacyTextBlocks: [], adjustedCompletionRules: [] };
const unique = (entries) => [...new Map(entries.map((entry) => [JSON.stringify(entry), entry])).values()];
const removed = [...(previous.removedUnverifiableCheckpoints || [])];
const prunedDefinitions = [...(previous.prunedOrphanFreeTextDefinitions || [])];
const normalized = [...(previous.normalizedLegacyTextBlocks || [])];
const rules = [...(previous.adjustedCompletionRules || [])];
let changedFiles = 0;

for (const filename of fs.readdirSync(coursesDir).filter((name) => name.endsWith('.json')).sort()) {
  const filePath = path.join(coursesDir, filename);
  const course = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const removedExerciseIds = new Set();
  let changed = false;

  for (const lesson of course.lessons || []) {
    if (!lesson || typeof lesson !== 'object' || !Array.isArray(lesson.chapters)) continue;
    const retainedChapters = [];
    for (const chapter of lesson.chapters) {
      if (!chapter || typeof chapter !== 'object') continue;
      const originalBlocks = Array.isArray(chapter.blocks) ? chapter.blocks : [];
      const retainedBlocks = [];
      for (const block of originalBlocks) {
        if (!block || typeof block !== 'object') {
          retainedBlocks.push(block);
          continue;
        }
        const exercise = block.type === 'checkpoint' && block.exerciseId
          ? (course.exercises || []).find((entry) => entry?.id === block.exerciseId)
          : null;
        if (exercise?.interactionType === 'free_text') {
          removedExerciseIds.add(exercise.id);
          removed.push({ courseId: course.courseId, chapterId: chapter.id, exerciseId: exercise.id, reason: 'free_text checkpoint without a machine-verifiable correction' });
          changed = true;
          continue;
        }
        if (block.type === 'text' && block.content && !block.body) {
          const next = { ...block, type: 'content', body: block.content };
          delete next.content;
          retainedBlocks.push(next);
          normalized.push({ courseId: course.courseId, chapterId: chapter.id, blockId: block.id || null, reason: 'text/content migrated identically to content/body' });
          changed = true;
          continue;
        }
        retainedBlocks.push(block);
      }
      chapter.blocks = retainedBlocks;
      const rule = chapter.completionRule;
      if (rule && typeof rule === 'object' && Array.isArray(rule.requires) && rule.requires.includes('requiredExercisesPassed') && !retainedBlocks.some((block) => gatedTypes.has(block?.type) || (block?.type === 'exercise' && block?.exercise_type === 'numeric_answers'))) {
        rule.requires = rule.requires.filter((requirement) => requirement !== 'requiredExercisesPassed');
        if (!rule.requires.length) delete chapter.completionRule;
        rules.push({ courseId: course.courseId, chapterId: chapter.id, removedRequirement: 'requiredExercisesPassed', reason: 'no remaining rendered required activity' });
        changed = true;
      }
      if (retainedBlocks.length) retainedChapters.push(chapter);
      else {
        removed.push({ courseId: course.courseId, chapterId: chapter.id, exerciseId: null, reason: 'chapter empty after removal of an unverifiable checkpoint' });
        changed = true;
      }
    }
    lesson.chapters = retainedChapters;
  }
  const referencedExerciseIds = new Set(
    (course.lessons || []).flatMap((lesson) => lesson?.chapters || [])
      .flatMap((chapter) => chapter?.blocks || [])
      .filter((block) => block?.type === 'checkpoint' && typeof block.exerciseId === 'string')
      .map((block) => block.exerciseId),
  );
  const orphanFreeTextIds = new Set((course.exercises || [])
    .filter((exercise) => exercise?.interactionType === 'free_text' && !referencedExerciseIds.has(exercise.id))
    .map((exercise) => exercise.id));
  for (const exerciseId of orphanFreeTextIds) {
    prunedDefinitions.push({ courseId: course.courseId, exerciseId, reason: 'unreferenced free_text definition after removal of an unverifiable checkpoint' });
  }
  for (const exerciseId of orphanFreeTextIds) removedExerciseIds.add(exerciseId);
  if (removedExerciseIds.size) {
    course.exercises = (course.exercises || []).filter((exercise) => !removedExerciseIds.has(exercise?.id));
    changed = true;
  }
  if (changed) {
    changedFiles += 1;
    if (!checkOnly) fs.writeFileSync(filePath, `${JSON.stringify(course, null, 2)}\n`);
  }
}

const manifest = {
  version: 1,
  policy: 'Remove any checkpoint whose free-text response cannot be verified; preserve explanatory content and never invent a replacement.',
  removedUnverifiableCheckpoints: unique(removed),
  prunedOrphanFreeTextDefinitions: unique(prunedDefinitions),
  normalizedLegacyTextBlocks: unique(normalized),
  adjustedCompletionRules: unique(rules),
};
if (!checkOnly) fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ checkOnly, changedFiles, removedUnverifiableCheckpoints: manifest.removedUnverifiableCheckpoints.length, normalizedLegacyTextBlocks: manifest.normalizedLegacyTextBlocks.length, adjustedCompletionRules: manifest.adjustedCompletionRules.length }, null, 2));
