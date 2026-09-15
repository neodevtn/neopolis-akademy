import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const course = JSON.parse(fs.readFileSync(path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__02.json'), 'utf8'));
const outputPath = path.join(root, 'docs/anthropic-developer-course2-claude-activities.json');
const lesson = course.lessons[0];
const chapterIds = ['chapter_01', 'chapter_03', 'chapter_05', 'chapter_07', 'chapter_09', 'chapter_11', 'chapter_13', 'chapter_15'];

const source = chapterIds.map((id) => {
  const chapter = lesson.chapters.find((item) => item.id === id);
  const body = chapter.blocks.find((block) => block.type === 'content')?.body || {};
  return {
    id,
    title: chapter.title,
    excerpt_en: String(body.en || '').slice(0, 4500),
    excerpt_fr: String(body.fr || '').slice(0, 4500),
  };
});

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 15000,
    messages: [
      { role: 'system', content: 'Tu conçois des checkpoints pédagogiques originaux pour un cours Anthropic. Produis seulement le JSON conforme au schéma. Les questions doivent reposer strictement sur les extraits fournis. Ne copie pas de questions d’examen. Préserve les noms produits Anthropic : Claude, Claude Code, Skills, Projects, Code Execution et MCP.' },
      { role: 'user', content: `Crée exactement huit checkpoints à choix unique, un par chapitre fourni. Chaque checkpoint est obligatoire et doit vérifier la notion du chapitre qui le précède. Les quatre options doivent être plausibles ; une seule est correcte. Écris EN et FR, et fournis une explication concise de la bonne réponse ainsi qu’une explication spécifique pour chaque distracteur. Les scénarios doivent couvrir : contrainte de sortie, Extended Thinking, schéma d’outil, gestion de flux interrompu, budget de contexte, boucle agentique, mémoire, ingestion multimodale. N’utilise aucune tâche cloud inaccessible ; emploie seulement des situations locales de développement.\n\nSOURCES :\n${JSON.stringify(source)}` },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'developer_course2_activities', strict: true,
        schema: {
          type: 'object',
          properties: {
            exercises: {
              type: 'array', minItems: 8, maxItems: 8,
              items: {
                type: 'object',
                properties: {
                  chapterId: { type: 'string' },
                  title: { type: 'object', properties: { en: { type: 'string' }, fr: { type: 'string' } }, required: ['en', 'fr'], additionalProperties: false },
                  prompt: { type: 'object', properties: { en: { type: 'string' }, fr: { type: 'string' } }, required: ['en', 'fr'], additionalProperties: false },
                  instructions: { type: 'object', properties: { en: { type: 'string' }, fr: { type: 'string' } }, required: ['en', 'fr'], additionalProperties: false },
                  options: {
                    type: 'array', minItems: 4, maxItems: 4,
                    items: { type: 'object', properties: { id: { type: 'string' }, en: { type: 'string' }, fr: { type: 'string' }, correct: { type: 'boolean' }, rationale: { type: 'object', properties: { en: { type: 'string' }, fr: { type: 'string' } }, required: ['en', 'fr'], additionalProperties: false } }, required: ['id', 'en', 'fr', 'correct', 'rationale'], additionalProperties: false },
                  },
                  skillTags: { type: 'array', minItems: 1, items: { type: 'string' } },
                },
                required: ['chapterId', 'title', 'prompt', 'instructions', 'options', 'skillTags'], additionalProperties: false,
              },
            },
          },
          required: ['exercises'], additionalProperties: false,
        },
      },
    },
  }),
});

if (!response.ok) throw new Error(`Claude activity request failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const content = payload.choices?.[0]?.message?.content;
if (!content) throw new Error('Claude returned no activity JSON.');
const result = JSON.parse(content);
if (new Set(result.exercises.map((item) => item.chapterId)).size !== chapterIds.length || chapterIds.some((id) => !result.exercises.some((item) => item.chapterId === id))) {
  throw new Error('Claude activities must cover each expected chapter exactly once.');
}
for (const exercise of result.exercises) {
  if (exercise.options.filter((option) => option.correct).length !== 1) throw new Error(`Exactly one correct answer required for ${exercise.chapterId}.`);
}
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Claude Sonnet activities written to ${outputPath}`);
