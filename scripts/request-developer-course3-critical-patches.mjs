import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const inputPath = join(root, 'client/public/data/courses/claude_certified_developer_foundations__03.json');
const outputPath = join(root, 'docs/anthropic-developer-course3-critical-patches.json');
const course = JSON.parse(await readFile(inputPath, 'utf8'));
const lesson = course.lessons[0];
const pick = (id) => lesson.chapters.find((chapter) => chapter.id === id);
const source = ['chapter_01', 'chapter_03', 'chapter_05'].map((id) => {
  const chapter = pick(id);
  return { id, title: chapter.title, blocks: chapter.blocks };
});

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 7000,
    thinking: { type: 'enabled', budget_tokens: 2048 },
    messages: [
      { role: 'system', content: 'Tu corriges un cours Anthropic sans inventer de notions ni modifier les noms produits Claude Code, Claude, MCP, Skills, Projects, Memory ou Tool Use. Restaure seulement les cartes réellement tronquées à partir du contenu du même chapitre. Réécris les trois sections concaténées dans un Markdown bref et lisible, fidèle à leurs notions. Produis uniquement le JSON du schéma.' },
      { role: 'user', content: `À partir de ces trois chapitres, produis : (1) une version complète FR/EN des cartes « What to Watch Out for » des chapitres 01, 03 et 05, plus « Setup » du chapitre 05 ; (2) un Markdown FR/EN lisible pour les sections concaténées de chapter_01 (Permission Modes & Human Gates), chapter_03 (Durable Project Context et mécanismes) et chapter_05 (Layer / What it is / Who it is for / When to reach for it). Ne crée pas de questions ni de faits externes.\n\n${JSON.stringify(source)}` },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'developer3_critical_patches', strict: true, schema: { type: 'object', properties: {
      cards: { type: 'array', minItems: 4, maxItems: 4, items: { type: 'object', properties: { chapterId: { type: 'string' }, title: { type: 'string' }, back: { type: 'object', properties: { en: { type: 'string' }, fr: { type: 'string' } }, required: ['en', 'fr'], additionalProperties: false } }, required: ['chapterId', 'title', 'back'], additionalProperties: false } },
      sections: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'object', properties: { chapterId: { type: 'string' }, body: { type: 'object', properties: { en: { type: 'string' }, fr: { type: 'string' } }, required: ['en', 'fr'], additionalProperties: false } }, required: ['chapterId', 'body'], additionalProperties: false } },
    }, required: ['cards', 'sections'], additionalProperties: false } } },
  }),
});
if (!response.ok) throw new Error(`Claude patch request failed: ${response.status} ${await response.text()}`);
const result = JSON.parse((await response.json()).choices?.[0]?.message?.content || '');
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Wrote ${result.cards.length} cards and ${result.sections.length} sections.`);
