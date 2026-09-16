import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const course = JSON.parse(await readFile(join(root, 'client/public/data/courses/claude_certified_developer_foundations__03.json'), 'utf8'));
const sourceAudit = JSON.parse(await readFile(join(root, 'docs/skilljar-developer3-source-audit.json'), 'utf8'));

const chapters = course.lessons.flatMap((lesson) => lesson.chapters ?? []);
const projectedExerciseIds = new Set(
  chapters.flatMap((chapter) => (chapter.blocks ?? []))
    .filter((block) => block.type === 'checkpoint' && typeof block.exerciseId === 'string')
    .map((block) => block.exerciseId),
);

const rootExercises = (course.exercises ?? []).map((exercise) => ({
  id: exercise.id,
  chapterId: exercise.chapterId ?? null,
  title: exercise.title ?? null,
  prompt: exercise.prompt ?? null,
  correction: exercise.correction ?? null,
  alreadyProjected: projectedExerciseIds.has(exercise.id),
}));

const visibleSourceScreens = sourceAudit.confirmedGaps.map((gap) => ({
  sourceScreenIds: gap.sourceScreenIds,
  sourceTopic: gap.sourceTopic,
  sourceEvidence: gap.sourceEvidence,
  standardBlock: gap.standardBlock,
  status: gap.status,
}));

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 2400,
    messages: [
      {
        role: 'system',
        content: 'Tu es un auditeur pédagogique rigoureux. Choisis au plus un exercice racine non déjà projeté. Ne le retiens que si son prompt ET sa correction correspondent directement, sans inférence, à une activité explicitement visible dans la source Skilljar fournie et si cette activité n’est pas déjà représentée dans le lecteur par un bloc standard. N’invente aucun contenu. Écarte tous les feedbacks, fragments, corrections isolées, doublons ou rattachements ambigus. Réponds strictement selon le schéma JSON.',
      },
      {
        role: 'user',
        content: `Écrans Skilljar visibles : ${JSON.stringify(visibleSourceScreens)}\n\nExercices racine Developer 3 : ${JSON.stringify(rootExercises)}`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'skilljar_developer3_root_exercise_selection',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            selected: {
              type: 'array',
              maxItems: 1,
              items: {
                type: 'object',
                properties: {
                  exerciseId: { type: 'string' },
                  sourceScreenId: { type: 'string' },
                  targetChapterId: { type: 'string' },
                  standardBlock: { type: 'string' },
                  rationale: { type: 'string' },
                },
                required: ['exerciseId', 'sourceScreenId', 'targetChapterId', 'standardBlock', 'rationale'],
                additionalProperties: false,
              },
            },
            rejectedReason: { type: 'string' },
          },
          required: ['selected', 'rejectedReason'],
          additionalProperties: false,
        },
      },
    },
  }),
});

if (!response.ok) {
  throw new Error(`La sélection Claude Sonnet a échoué : ${response.status} ${await response.text()}`);
}

const payload = await response.json();
const selection = JSON.parse(payload.choices?.[0]?.message?.content || '');
await writeFile(
  join(root, 'docs/skilljar-developer3-unprojected-root-exercise-selection.json'),
  `${JSON.stringify(selection, null, 2)}\n`,
);
console.log(`Exercices racine retenus : ${selection.selected.length}.`);
