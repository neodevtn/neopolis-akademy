import { readFile, writeFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const coursesDir = join(root, 'client/public/data/courses');
const excluded = new Set([
  'claude_certified_associate_foundations__01',
  'claude_certified_associate_foundations__02',
  'claude_certified_associate_foundations__03',
  'claude_certified_associate_foundations__04',
  'claude_certified_associate_foundations__05',
  'claude_certified_associate_foundations__06',
  'claude_certified_associate_foundations__07',
  'claude_certified_associate_foundations__08',
  'claude_certified_developer_foundations__01',
  'claude_certified_developer_foundations__02',
  'claude_certified_developer_foundations__03',
]);

const summaries = [];
for (const filename of readdirSync(coursesDir).filter((name) => name.startsWith('claude_') && name.endsWith('.json'))) {
  const courseId = filename.replace(/\.json$/, '');
  if (excluded.has(courseId)) continue;
  const course = JSON.parse(await readFile(join(coursesDir, filename), 'utf8'));
  const lesson = course.lessons?.[0];
  if (!lesson || !Array.isArray(course.exercises)) continue;
  const chapters = (lesson.chapters || []).map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    excerpt: String(chapter.blocks?.find((block) => block.type === 'content')?.body?.fr || '').slice(0, 450),
  }));
  const exercises = course.exercises.filter((exercise) => exercise.interactionType === 'free_text' && exercise.chapterId && !String(exercise.chapterId).includes('final')).map((exercise) => ({
    id: exercise.id,
    chapterId: exercise.chapterId,
    title: exercise.title?.fr || exercise.title?.en || '',
    prompt: String(exercise.prompt?.fr || exercise.prompt?.en || '').slice(0, 700),
    correction: String(exercise.correction?.fr || exercise.correction?.en || '').slice(0, 500),
  })).slice(0, 8);
  summaries.push({ courseId, chapters, exercises });
}

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6', max_tokens: 4200,
    messages: [
      { role: 'system', content: 'Tu es un relecteur pédagogique. Pour chaque cours, sélectionne au plus un exercice texte libre EXISTANT qui évalue directement le contenu de l’écran auquel son chapterId le rattache. Ne crées rien. Écarte les exercices tronqués, ceux qui évoquent une notion absente de l’écran, les écrans de fin et les exercices dont le rattachement est ambigu. Réponds au JSON demandé.' },
      { role: 'user', content: JSON.stringify(summaries) },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'anthropic_root_checkpoint_selection', strict: true, schema: { type: 'object', properties: { selections: { type: 'array', items: { type: 'object', properties: { courseId: { type: 'string' }, exerciseId: { type: 'string' }, chapterId: { type: 'string' }, rationale: { type: 'string' } }, required: ['courseId', 'exerciseId', 'chapterId', 'rationale'], additionalProperties: false } } }, required: ['selections'], additionalProperties: false } } },
  }),
});
if (!response.ok) throw new Error(`Claude selection failed: ${response.status}`);
const content = (await response.json()).choices?.[0]?.message?.content;
const result = JSON.parse(content);
const validCourseIds = new Set(summaries.map((item) => item.courseId));
result.selections = result.selections.filter((item) => validCourseIds.has(item.courseId));
await writeFile(join(root, 'docs/anthropic-8020-root-checkpoint-selection.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(`Selected ${result.selections.length} checkpoints across ${summaries.length} courses.`);
