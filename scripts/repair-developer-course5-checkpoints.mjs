import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__05.json');
const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const lesson = course.lessons?.[0];
const getChapter = (id) => lesson.chapters.find((chapter) => chapter.id === id);
const getExercise = (id) => course.exercises.find((exercise) => exercise.id === id);

const packaging = getChapter('chapter_02');
const packagingExercise = getExercise('ex_claude_certified_developer_foundations__05_002');
if (!packaging || !packagingExercise || packagingExercise.chapterId !== packaging.id) throw new Error('Developer 5 Packaging checkpoint cannot be repaired safely.');
const packagingCheckpoint = packaging.blocks.find((block) => block.type === 'checkpoint');
if (!packagingCheckpoint) throw new Error('Developer 5 Packaging checkpoint block is missing.');
packagingCheckpoint.exerciseId = packagingExercise.id;
packagingExercise.required = true;
packagingExercise.completionRequiresCorrectAnswer = false;
packagingExercise.inputSchema = { ...(packagingExercise.inputSchema || {}), minWords: Math.max(15, packagingExercise.inputSchema?.minWords || 0) };
packaging.completionRule = { requires: ['contentViewed', 'requiredExercisesPassed'] };

const trustBoundary = getChapter('chapter_13');
if (!trustBoundary) throw new Error('Developer 5 trust-boundary chapter is missing.');
trustBoundary.blocks = trustBoundary.blocks.filter((block) => !(block.type === 'checkpoint' && block.exerciseId === 'ex_claude_certified_developer_foundations__05_007'));
trustBoundary.completionRule = { requires: ['contentViewed'] };

fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
console.log('Developer course 5 checkpoint references repaired.');
