import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const course = JSON.parse(await readFile(join(root, 'client/public/data/courses/claude_certified_developer_foundations__03.json'), 'utf8'));
const lesson = course.lessons[0];
const chapters = lesson.chapters.filter((chapter) => ['chapter_01', 'chapter_03', 'chapter_05'].includes(chapter.id)).map((chapter) => ({ id: chapter.id, title: chapter.title, body: chapter.blocks.find((block) => block.type === 'content')?.body }));
const exercises = course.exercises.map((exercise) => ({ id: exercise.id, chapterId: exercise.chapterId, title: exercise.title, prompt: exercise.prompt, correction: exercise.correction }));

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6', max_tokens: 2200,
    messages: [
      { role: 'system', content: 'Tu es un relecteur pédagogique Anthropic. Sélectionne uniquement des exercices texte libre dont le prompt et la correction évaluent directement le contenu de l’écran assigné. Ne crées rien. Écarte les exercices mal rattachés, tronqués ou liés à un autre écran. Chaque écran ne peut recevoir au plus un checkpoint. Réponds uniquement au JSON du schéma.' },
      { role: 'user', content: `Écrans : ${JSON.stringify(chapters)}\n\nExercices existants : ${JSON.stringify(exercises)}` },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'developer3_checkpoint_selection', strict: true, schema: { type: 'object', properties: { selected: { type: 'array', maxItems: 3, items: { type: 'object', properties: { exerciseId: { type: 'string' }, chapterId: { type: 'string' }, rationale: { type: 'string' } }, required: ['exerciseId', 'chapterId', 'rationale'], additionalProperties: false } } }, required: ['selected'], additionalProperties: false } } },
  }),
});
if (!response.ok) throw new Error(`Checkpoint selection failed: ${response.status} ${await response.text()}`);
const selection = JSON.parse((await response.json()).choices?.[0]?.message?.content || '');
await writeFile(join(root, 'docs/anthropic-developer-course3-checkpoint-selection.json'), `${JSON.stringify(selection, null, 2)}\n`);
console.log(`Selected ${selection.selected.length} checkpoints.`);
