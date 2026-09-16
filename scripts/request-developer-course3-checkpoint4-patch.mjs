import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const coursePath = join(root, 'client/public/data/courses/claude_certified_developer_foundations__03.json');
const outputPath = join(root, 'docs/anthropic-developer-course3-checkpoint4-patch.json');
const course = JSON.parse(await readFile(coursePath, 'utf8'));
const chapter = course.lessons[0].chapters.find((item) => item.id === 'chapter_05');
const truncatedBlock = chapter?.blocks?.find((block) => block.type === 'content' && block.body?.en?.startsWith('Checkpoint 4:'));
if (!truncatedBlock?.body) throw new Error('Developer 3 checkpoint 4 source block is missing.');

const officialEvidence = {
  skills: {
    url: 'https://code.claude.com/docs/en/skills',
    facts: [
      'A skill is a folder containing SKILL.md and can include supporting files.',
      'A skill may be stored in a project or bundled into a plugin.',
    ],
  },
  plugins: {
    url: 'https://code.claude.com/docs/en/plugins',
    facts: [
      'A plugin can bundle skills, agents, hooks, and MCP servers.',
      'A plugin is tested locally with --plugin-dir and plugin skills are namespaced.',
    ],
  },
  hooks: {
    url: 'https://code.claude.com/docs/en/hooks',
    facts: [
      '${CLAUDE_PROJECT_DIR} references the project root, while ${CLAUDE_PLUGIN_ROOT} references scripts bundled inside the plugin.',
      'Absolute paths on one author machine are not a portable plugin reference.',
    ],
  },
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
    thinking: { type: 'enabled', budget_tokens: 2048 },
    messages: [
      {
        role: 'system',
        content: 'Tu complètes uniquement un checkpoint tronqué d’un cours Anthropic. Utilise exclusivement les faits sources fournis et le contexte pédagogique du bloc tronqué. Ne crée aucun lab cloud, ne change pas les noms de produits, ne crée aucune activité libre ni composant sur mesure. Le résultat doit employer un seul bloc standard single_choice_exercise : quatre choix, une bonne réponse, une explication en anglais et français. Rédige une activité originale qui vérifie le défaut de portabilité et la correction associée ; ne prétends pas reproduire mot à mot Skilljar. Produis uniquement le JSON du schéma.',
      },
      {
        role: 'user',
        content: `Bloc tronqué à compléter :\n${JSON.stringify(truncatedBlock.body)}\n\nFaits officiels Anthropic :\n${JSON.stringify(officialEvidence)}\n\nFournis : (1) le contenu court à afficher avant la question, avec le frontmatter et une commande volontairement non portable, suivis d’une consigne claire ; (2) une seule question à choix unique avec quatre options, la réponse correcte, un indice et une explication pédagogique. Les deux langues doivent être entièrement rédigées.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'developer3_checkpoint4_patch',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            body: {
              type: 'object',
              properties: { en: { type: 'string' }, fr: { type: 'string' } },
              required: ['en', 'fr'],
              additionalProperties: false,
            },
            exercise: {
              type: 'object',
              properties: {
                id: { type: 'string', enum: ['checkpoint4_fix_plugin_definition'] },
                type: { type: 'string', enum: ['single_choice_exercise'] },
                question: { type: 'object', properties: { en: { type: 'string' }, fr: { type: 'string' } }, required: ['en', 'fr'], additionalProperties: false },
                hint: { type: 'object', properties: { en: { type: 'string' }, fr: { type: 'string' } }, required: ['en', 'fr'], additionalProperties: false },
                options: {
                  type: 'array',
                  minItems: 4,
                  maxItems: 4,
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', enum: ['a', 'b', 'c', 'd'] },
                      text: { type: 'object', properties: { en: { type: 'string' }, fr: { type: 'string' } }, required: ['en', 'fr'], additionalProperties: false },
                    },
                    required: ['id', 'text'],
                    additionalProperties: false,
                  },
                },
                correctAnswer: { type: 'string', enum: ['a', 'b', 'c', 'd'] },
                explanation: { type: 'object', properties: { en: { type: 'string' }, fr: { type: 'string' } }, required: ['en', 'fr'], additionalProperties: false },
              },
              required: ['id', 'type', 'question', 'hint', 'options', 'correctAnswer', 'explanation'],
              additionalProperties: false,
            },
          },
          required: ['body', 'exercise'],
          additionalProperties: false,
        },
      },
    },
  }),
});
if (!response.ok) throw new Error(`Claude Sonnet checkpoint 4 request failed: ${response.status} ${await response.text()}`);
const result = JSON.parse((await response.json()).choices?.[0]?.message?.content || '');
if (new Set(result.exercise.options.map((option) => option.id)).size !== 4) throw new Error('Claude Sonnet returned duplicate checkpoint 4 option identifiers.');
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log('Wrote one sourced Developer 3 checkpoint 4 patch.');
