import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sourcePath = resolve(root, 'client/public/data/courses/claude_certified_associate_foundations__08.json');
const outputPath = resolve(root, 'docs/anthropic-associate-course8-claude-readiness.json');
const course = JSON.parse(await readFile(sourcePath, 'utf8'));

const option = {
  type: 'object',
  properties: {
    id: { type: 'string', enum: ['a', 'b', 'c', 'd'] },
    en: { type: 'string' },
    fr: { type: 'string' },
    correct: { type: 'boolean' },
  },
  required: ['id', 'en', 'fr', 'correct'],
  additionalProperties: false,
};
const schema = {
  type: 'object',
  properties: {
    question_en: { type: 'string' },
    question_fr: { type: 'string' },
    options: { type: 'array', minItems: 4, maxItems: 4, items: option },
    correction_en: { type: 'string' },
    correction_fr: { type: 'string' },
  },
  required: ['question_en', 'question_fr', 'options', 'correction_en', 'correction_fr'],
  additionalProperties: false,
};

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 5000,
    messages: [
      {
        role: 'system',
        content: 'Tu rédiges une seule question de readiness originale pour un cours Anthropic. Utilise seulement les notions explicitement présentes dans la source fournie. La bonne réponse doit être unique. Fournis quatre options plausibles et une correction qui explique précisément la bonne réponse ainsi que chaque distracteur. Ne fais pas de référence à des sources externes ni à Pearson. Conserve sans traduction les noms de produits et rôles Anthropic. Réponds uniquement au schéma JSON demandé.',
      },
      {
        role: 'user',
        content: `Crée un seul point de contrôle de readiness qui remplace une réponse libre. Il doit mesurer la bonne prochaine étape de préparation : identifier son module le plus faible, revoir ses cadres de décision et savoir quand escalader à un Claude Developer ou Claude Architect. Le niveau est Associate.\n\nSource :\n${JSON.stringify(course.lessons[0])}`,
      },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'associate_course_8_readiness', strict: true, schema } },
  }),
});

if (!response.ok) throw new Error(`Échec du checkpoint Claude : HTTP ${response.status}`);
const payload = await response.json();
const output = payload.choices?.[0]?.message?.content;
if (typeof output !== 'string') throw new Error('Réponse Claude sans contenu JSON.');
await writeFile(outputPath, `${JSON.stringify(JSON.parse(output), null, 2)}\n`, 'utf8');
console.log(outputPath);
