import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const coursePath = join(process.cwd(), 'client/public/data/courses/claude_certified_associate_foundations__07.json');
const outputPath = join(process.cwd(), 'docs/anthropic-associate-course7-claude-structured-section.json');
const course = JSON.parse(await readFile(coursePath, 'utf8'));
const chapter = course.lessons[0].chapters.find((item) => item.id === 'chapter_03');
const text = chapter.blocks.find((item) => item.type === 'content').body.fr;
const start = text.indexOf('Signal\n\nRépétition');
const end = text.indexOf('Consolider et promouvoir');
if (start < 0 || end < 0 || end <= start) throw new Error('Associate 7 signal section is missing.');
const source = text.slice(start, end).trim();

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 1800,
    thinking: { type: 'enabled', budget_tokens: 768 },
    messages: [
      {
        role: 'system',
        content: 'Tu restructures du contenu pédagogique Anthropic déjà fourni. Transforme uniquement la pseudo-table en Markdown lisible : un sous-titre et trois puces associant chaque signal à son constat et sa correction. Préserve strictement les notions, ne crée aucun exemple, ne supprime aucune information et garde les noms produits Anthropic tels quels. Réponds en JSON strict.',
      },
      { role: 'user', content: `Pseudo-table française à normaliser :\n${source}` },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'structured_signal_section',
        strict: true,
        schema: {
          type: 'object',
          properties: { markdown: { type: 'string' } },
          required: ['markdown'],
          additionalProperties: false,
        },
      },
    },
  }),
});
if (!response.ok) throw new Error(`Claude structure request failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const content = payload.choices?.[0]?.message?.content;
if (typeof content !== 'string') throw new Error('Claude structure request returned no textual JSON content.');
await writeFile(outputPath, `${JSON.stringify(JSON.parse(content), null, 2)}\n`, 'utf8');
console.log(`Saved structured Associate 7 signal section to ${outputPath}`);
