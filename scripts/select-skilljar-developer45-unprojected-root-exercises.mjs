import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const targets = [
  {
    courseId: 'claude_certified_developer_foundations__04',
    sourceFile: '/home/ubuntu/upload/anthropic-partners.skilljar.com_content_wp_4hdejjwplbrm_2gf8jaub9q0dj_Developer_M4_vF2.html_1789547973784.html',
  },
  {
    courseId: 'claude_certified_developer_foundations__05',
    sourceFile: '/home/ubuntu/upload/anthropic-partners.skilljar.com_content_wp_4hdejjwplbrm_3rtcsmg1kllky_Developer_M5_vF2.html_1789548126636.html',
  },
];

function textFromHtml(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSourceScreens(html) {
  const matches = [...html.matchAll(/<section\b[^>]*\bid="(S\d+[A-Z]?)"[^>]*>[\s\S]*?(?=<section\b[^>]*\bid="S\d+[A-Z]?"|<section\b[^>]*\bid="CERT"|$)/gi)];
  return matches.map((match) => ({
    id: match[1],
    excerpt: textFromHtml(match[0]).slice(0, 5500),
  }));
}

function currentRootExercises(course) {
  const chapters = course.lessons.flatMap((lesson) => lesson.chapters ?? []);
  const projected = new Set(
    chapters.flatMap((chapter) => chapter.blocks ?? [])
      .filter((block) => block.type === 'checkpoint' && typeof block.exerciseId === 'string')
      .map((block) => block.exerciseId),
  );

  return (course.exercises ?? []).filter((exercise) => !projected.has(exercise.id)).map((exercise) => ({
    id: exercise.id,
    chapterId: exercise.chapterId ?? null,
    title: exercise.title ?? null,
    prompt: exercise.prompt ?? null,
    correction: exercise.correction ?? null,
    required: Boolean(exercise.required),
  }));
}

const selections = [];
for (const target of targets) {
  const course = JSON.parse(await readFile(join(root, 'client/public/data/courses', `${target.courseId}.json`), 'utf8'));
  const sourceHtml = await readFile(target.sourceFile, 'utf8');
  const packet = {
    courseId: target.courseId,
    rootExercises: currentRootExercises(course),
    sourceScreens: extractSourceScreens(sourceHtml),
  };
  const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2800,
      messages: [
        {
          role: 'system',
          content: 'Tu es un auditeur pédagogique Anthropic très conservateur. Compare les exercices racine Neopolis aux écrans Skilljar authentifiés. Retiens au plus un exercice seulement si son prompt, sa correction et son chapitre de destination correspondent explicitement à une interaction Skilljar décrite dans les extraits, et si aucune interaction standard équivalente n’est déjà présente. Ne crée ni ne réécris aucun contenu. Écarte les fragments, retours de correction, feedbacks, cartes, doublons, exercices déjà implicitement intégrés et tout rattachement ambigu. Réponds strictement selon le schéma JSON.',
        },
        { role: 'user', content: JSON.stringify(packet) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'skilljar_developer45_root_exercise_selection',
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
  if (!response.ok) throw new Error(`Sélection Claude Sonnet échouée pour ${target.courseId}: ${response.status} ${await response.text()}`);
  const data = await response.json();
  selections.push({ courseId: target.courseId, ...JSON.parse(data.choices?.[0]?.message?.content || '') });
}

await writeFile(
  join(root, 'docs/skilljar-developer45-unprojected-root-exercise-selection.json'),
  `${JSON.stringify({ selections }, null, 2)}\n`,
);
console.log(`Cours examinés : ${selections.length}.`);
