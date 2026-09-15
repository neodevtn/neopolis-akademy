import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__04.json');
const contentPatchPath = path.join(root, 'docs/anthropic-developer-course4-critical-patches.json');
const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const lesson = course.lessons?.[0];
const findChapter = (id) => lesson.chapters.find((chapter) => chapter.id === id);
const attachExistingCheckpoint = (chapterId, exerciseId) => {
  const exercise = course.exercises.find((item) => item.id === exerciseId);
  const chapter = findChapter(chapterId);
  if (!exercise || !chapter || exercise.chapterId !== chapterId) throw new Error(`Invalid checkpoint ${chapterId}:${exerciseId}`);
  const block = chapter.blocks.find((item) => item.type === 'checkpoint');
  if (!block) throw new Error(`No checkpoint block in ${chapterId}`);
  block.exerciseId = exerciseId;
  exercise.required = true;
  exercise.completionRequiresCorrectAnswer = false;
  exercise.inputSchema = { ...(exercise.inputSchema || {}), minWords: Math.max(15, exercise.inputSchema?.minWords || 0) };
  chapter.completionRule = { requires: ['contentViewed', 'requiredExercisesPassed'] };
};

attachExistingCheckpoint('chapter_05', 'ex_claude_certified_developer_foundations__04_005');
attachExistingCheckpoint('chapter_07', 'ex_claude_certified_developer_foundations__04_007');
attachExistingCheckpoint('chapter_11', 'ex_claude_certified_developer_foundations__04_011');

for (const block of findChapter('chapter_01_1').blocks || []) {
  if (block.type !== 'content' || !block.body?.fr) continue;
  block.body.fr = block.body.fr.replace(/Durée estimée\s*:\s*15\s*[–-]\s*25 minutes/gi, 'Durée indicative de l’introduction : 15–25 minutes');
}

if (fs.existsSync(contentPatchPath)) {
  const contentPatches = JSON.parse(fs.readFileSync(contentPatchPath, 'utf8'));
  for (const patch of contentPatches.cards || []) {
    const chapter = findChapter(patch.chapterId);
    const cardsBlock = chapter?.blocks?.find((block) => block.type === 'flip_cards');
    const card = cardsBlock?.cards?.find((item) => item.front === patch.front || item.front?.en === patch.front);
    if (!card) throw new Error(`Missing generated card target ${patch.chapterId}:${patch.front}`);
    card.back = patch.back;
  }
}

fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
console.log('Developer course 4 critical checkpoint associations repaired.');
