import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const courseIds = [
  'claude_certified_developer_foundations__04',
  'claude_certified_developer_foundations__05',
];

function buildReviewPacket(course) {
  const lesson = course.lessons?.[0];
  const checkpointExerciseIds = new Set(
    (lesson?.chapters || [])
      .flatMap((chapter) => chapter.blocks || [])
      .filter((block) => block?.type === 'checkpoint' && typeof block.exerciseId === 'string')
      .map((block) => block.exerciseId),
  );
  const candidates = (course.exercises || [])
    .filter((exercise) => !exercise.required && !checkpointExerciseIds.has(exercise.id))
    .map((exercise) => ({
      id: exercise.id,
      chapterId: exercise.chapterId,
      type: exercise.type,
      title: exercise.title,
      prompt: exercise.prompt,
      correction: exercise.correction,
      inputSchema: exercise.inputSchema,
    }));
  const chapterIds = new Set(candidates.map((exercise) => exercise.chapterId));
  const chapters = (lesson?.chapters || [])
    .filter((chapter) => chapterIds.has(chapter.id))
    .map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      content: chapter.blocks?.find((block) => block.type === 'content')?.body,
    }));
  return { courseId: course.id, chapters, candidates };
}

const schema = {
  type: 'object',
  properties: {
    selected: {
      type: 'array',
      maxItems: 1,
      items: {
        type: 'object',
        properties: {
          exerciseId: { type: 'string' },
          chapterId: { type: 'string' },
          rationale: { type: 'string' },
        },
        required: ['exerciseId', 'chapterId', 'rationale'],
        additionalProperties: false,
      },
    },
    deferredRationale: { type: 'string' },
  },
  required: ['selected', 'deferredRationale'],
  additionalProperties: false,
};

const selections = [];
for (const courseId of courseIds) {
  const course = JSON.parse(await readFile(join(root, 'client/public/data/courses', `${courseId}.json`), 'utf8'));
  const packet = buildReviewPacket(course);
  const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2200,
      messages: [
        {
          role: 'system',
          content: 'Tu es un relecteur pédagogique Anthropic extrêmement conservateur. Choisis zéro ou un seul exercice racine existant seulement si son prompt, sa correction et son chapitre assigné prouvent un rattachement explicite et si cet exercice est réellement répondable. Ne crée, réécris ni complète aucun contenu. Écarte les messages de résultat, les retours de correction, les fragments tronqués, les exercices liés à une étude de cas ou un TP non sourcé, et tout doute. Les exercices déjà marqués requis ou déjà projetés comme checkpoint sont exclus. Réponds uniquement au JSON conforme au schéma.',
        },
        {
          role: 'user',
          content: JSON.stringify(packet),
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'developer_root_checkpoint_selection',
          strict: true,
          schema,
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`Developer root exercise selection failed for ${courseId}: ${response.status} ${await response.text()}`);
  const content = (await response.json()).choices?.[0]?.message?.content;
  const selection = JSON.parse(content || '');
  selections.push({ courseId, ...selection });
}

await writeFile(join(root, 'docs/anthropic-developer45-root-checkpoint-selection.json'), `${JSON.stringify({ selections }, null, 2)}\n`);
console.log(`Reviewed ${selections.length} Developer courses.`);
