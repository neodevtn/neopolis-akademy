import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const outputPath = join(process.cwd(), 'docs/anthropic-developer-course1-claude-activities.json');
const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 9000,
    thinking: { type: 'enabled', budget_tokens: 2048 },
    messages: [
      {
        role: 'system',
        content:
          'Tu es concepteur pédagogique Anthropic. Produis exclusivement un JSON conforme au schéma, en anglais et en français. Rédige des questions originales, fidèles aux notions fournies, sans recopier de corpus d’examen. Chaque question doit être immédiatement auto-corrigeable via le bloc standard Neopolis de choix unique. La correction doit expliquer précisément la bonne décision et pourquoi les alternatives sont moins adaptées. Conserve les noms produits et techniques Anthropic sans les traduire : Claude, Claude Code, Skills, Projects, Code Execution, MCP, Memory, API Messages, AsyncAnthropic, Message Batches, REST, SDK, tokens, zero-shot, one-shot, multi-shot. Les termes génériques autour d’eux doivent être localisés naturellement en français.',
      },
      {
        role: 'user',
        content:
          'Crée cinq checkpoints pour le cours Developer 1 « MSO Foundations ». Le cours enseigne successivement : (1) tokens, fenêtre de contexte, échantillonnage et non-déterminisme ; (2) sélection de modèle et raisonnement adaptatif selon coût, latence et qualité ; (3) prompting zero-shot, one-shot et multi-shot ; (4) SDK ou REST, streaming, AsyncAnthropic et Message Batches ; (5) prédire le comportement avec ces concepts. Associe exactement un checkpoint aux chapitres chapter_01, chapter_02, chapter_03, chapter_04 et chapter_06. Chaque checkpoint a quatre options (a-d), une seule correcte, une correction détaillée, et 2 à 4 tags de compétence. Le dernier est un scénario de prédiction de comportement ; les quatre premiers testent directement le chapitre précédent. Le niveau est Foundations développeur.',
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'developer_mso_activities',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            exercises: {
              type: 'array',
              minItems: 5,
              maxItems: 5,
              items: {
                type: 'object',
                properties: {
                  chapterId: { type: 'string', enum: ['chapter_01', 'chapter_02', 'chapter_03', 'chapter_04', 'chapter_06'] },
                  title: {
                    type: 'object',
                    properties: { en: { type: 'string' }, fr: { type: 'string' } },
                    required: ['en', 'fr'],
                    additionalProperties: false,
                  },
                  prompt: {
                    type: 'object',
                    properties: { en: { type: 'string' }, fr: { type: 'string' } },
                    required: ['en', 'fr'],
                    additionalProperties: false,
                  },
                  instructions: {
                    type: 'object',
                    properties: { en: { type: 'string' }, fr: { type: 'string' } },
                    required: ['en', 'fr'],
                    additionalProperties: false,
                  },
                  options: {
                    type: 'array',
                    minItems: 4,
                    maxItems: 4,
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', enum: ['a', 'b', 'c', 'd'] },
                        en: { type: 'string' },
                        fr: { type: 'string' },
                        correct: { type: 'boolean' },
                      },
                      required: ['id', 'en', 'fr', 'correct'],
                      additionalProperties: false,
                    },
                  },
                  correction: {
                    type: 'object',
                    properties: { en: { type: 'string' }, fr: { type: 'string' } },
                    required: ['en', 'fr'],
                    additionalProperties: false,
                  },
                  skillTags: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'string' } },
                },
                required: ['chapterId', 'title', 'prompt', 'instructions', 'options', 'correction', 'skillTags'],
                additionalProperties: false,
              },
            },
          },
          required: ['exercises'],
          additionalProperties: false,
        },
      },
    },
  }),
});

if (!response.ok) throw new Error(`Claude activity generation failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const content = payload.choices?.[0]?.message?.content;
if (typeof content !== 'string') throw new Error('Claude activity generation returned no textual JSON content.');
const activities = JSON.parse(content);
await writeFile(outputPath, `${JSON.stringify(activities, null, 2)}\n`, 'utf8');
console.log(`Saved ${activities.exercises.length} Claude Sonnet activities to ${outputPath}`);
