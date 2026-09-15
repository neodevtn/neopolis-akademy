import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const coursePath = join(process.cwd(), 'client/public/data/courses/claude_certified_associate_foundations__07.json');
const auditPath = join(process.cwd(), 'docs/anthropic-associate-course7-claude-audit.json');
const outputPath = join(process.cwd(), 'docs/anthropic-associate-course7-claude-patches.json');
const [course, audit] = await Promise.all([readFile(coursePath, 'utf8'), readFile(auditPath, 'utf8')]);

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    thinking: { type: 'enabled', budget_tokens: 3072 },
    messages: [
      {
        role: 'system',
        content:
          'Tu corriges des données pédagogiques Anthropic. À partir du JSON et de l’audit fournis, propose exclusivement les remplacements minimaux nécessaires aux constats. Préserve la portée pédagogique, les cartes et activités existantes. Les noms produits Anthropic doivent rester exactement non traduits : Claude, Skills, Projects, Code Execution, MCP, Memory. Ne crée aucun fait, exemple ou activité non source. Pour les textes tronqués, complète fidèlement la logique explicitement développée dans le corps du même chapitre. Pour le français, localise les termes génériques, garde le vouvoiement et n’emploie pas de jargon anglais hors noms produits. Ne renvoie jamais un corps de chapitre entier : pour les corrections de corps, renvoie des substitutions exactes et minimales {from,to}. Réponds en JSON strict.',
      },
      { role: 'user', content: `JSON DU COURS:\n${course}\n\nAUDIT À TRAITER:\n${audit}` },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'associate_course_patch_plan',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            card_replacements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  chapter_id: { type: 'string' },
                  front_en: { type: 'string' },
                  back_en: { type: 'string' },
                  back_fr: { type: 'string' },
                },
                required: ['chapter_id', 'front_en', 'back_en', 'back_fr'],
                additionalProperties: false,
              },
            },
            text_replacements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  chapter_id: { type: 'string' },
                  language: { type: 'string', enum: ['en', 'fr'] },
                  from: { type: 'string' },
                  to: { type: 'string' },
                },
                required: ['chapter_id', 'language', 'from', 'to'],
                additionalProperties: false,
              },
            },
            quiz_replacements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  chapter_id: { type: 'string' },
                  question_stem_fr: { type: 'string' },
                  corrected_option_fr: { type: 'string' },
                },
                required: ['chapter_id', 'question_stem_fr', 'corrected_option_fr'],
                additionalProperties: false,
              },
            },
          },
          required: ['card_replacements', 'text_replacements', 'quiz_replacements'],
          additionalProperties: false,
        },
      },
    },
  }),
});

if (!response.ok) throw new Error(`Claude patch request failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const content = payload.choices?.[0]?.message?.content;
if (typeof content !== 'string') throw new Error('Claude patch request returned no textual JSON content.');
const patches = JSON.parse(content);
await writeFile(outputPath, `${JSON.stringify(patches, null, 2)}\n`, 'utf8');
console.log(`Saved ${patches.card_replacements.length} card, ${patches.text_replacements.length} text and ${patches.quiz_replacements.length} quiz replacements to ${outputPath}`);
