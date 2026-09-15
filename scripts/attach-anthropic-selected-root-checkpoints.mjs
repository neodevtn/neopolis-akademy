import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const selection = JSON.parse(await readFile(join(root, 'docs/anthropic-8020-root-checkpoint-selection.json'), 'utf8'));
for (const selected of selection.selections) {
  const coursePath = join(root, 'client/public/data/courses', `${selected.courseId}.json`);
  const course = JSON.parse(await readFile(coursePath, 'utf8'));
  const lesson = course.lessons?.[0];
  const exercise = course.exercises?.find((item) => item.id === selected.exerciseId);
  const chapter = lesson?.chapters?.find((item) => item.id === selected.chapterId);
  if (!exercise || !chapter || exercise.chapterId !== selected.chapterId || exercise.interactionType !== 'free_text') {
    throw new Error(`Invalid Claude selection for ${selected.courseId}:${selected.exerciseId}`);
  }
  exercise.required = true;
  exercise.completionRequiresCorrectAnswer = false;
  exercise.inputSchema = { ...(exercise.inputSchema || {}), minWords: Math.max(15, exercise.inputSchema?.minWords || 0), maxWords: exercise.inputSchema?.maxWords || 500 };
  chapter.blocks = (chapter.blocks || []).filter((block) => !(block.type === 'checkpoint' && block.exerciseId === selected.exerciseId));
  chapter.blocks.push({ type: 'checkpoint', exerciseId: selected.exerciseId });
  chapter.completionRule = { requires: ['contentViewed', 'requiredExercisesPassed'] };
  await writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`);
}
console.log(`Attached ${selection.selections.length} Claude-validated root checkpoints.`);
