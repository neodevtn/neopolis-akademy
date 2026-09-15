import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const course = JSON.parse(fs.readFileSync(path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__04.json'), 'utf8'));
const lesson = course.lessons[0];
const selectedIds = new Set(['chapter_01', 'chapter_03', 'chapter_05', 'chapter_09']);
const source = lesson.chapters
  .filter((chapter) => selectedIds.has(chapter.id))
  .map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    content: chapter.blocks.find((block) => block.type === 'content')?.body ?? null,
    cards: chapter.blocks.filter((block) => block.type === 'flip_cards').flatMap((block) => block.cards ?? []),
  }));

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, {
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` },
}).then((response) => response.json());
const model = models.data?.find((item) => item.id === 'claude-sonnet-4-6')?.id;
if (!model) throw new Error('Claude Sonnet is unavailable.');

const prompt = `You are editing French/English learning content about Claude production engineering. Return JSON only with this exact shape: {"sections":[{"chapterId":"...","body":{"en":"...","fr":"..."}}],"cards":[{"chapterId":"...","front":"English front title","back":{"en":"...","fr":"..."}}]}. Use only the supplied facts. Repair only chapters 01, 03, 05 and 09. Replace the fragmented pseudo-tables with concise valid Markdown tables or ordered lists. Translate generic French learner-facing text while retaining technical identifiers (HTTP 429, retry-after, MCP, Claude, JSON) and product names. Restore visibly truncated card backs into complete explanations; do not invent claims or create activities. Include a section only when replacement is needed and a card only when its supplied back is visibly truncated.\n\nSOURCE:\n${JSON.stringify(source)}`;
const result = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model,
    max_tokens: 10000,
    thinking: { type: 'enabled', budget_tokens: 1024 },
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'developer_course4_patches',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  chapterId: { type: 'string' },
                  body: { type: 'object', properties: { en: { type: 'string' }, fr: { type: 'string' } }, required: ['en', 'fr'], additionalProperties: false },
                },
                required: ['chapterId', 'body'],
                additionalProperties: false,
              },
            },
            cards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  chapterId: { type: 'string' },
                  front: { type: 'string' },
                  back: { type: 'object', properties: { en: { type: 'string' }, fr: { type: 'string' } }, required: ['en', 'fr'], additionalProperties: false },
                },
                required: ['chapterId', 'front', 'back'],
                additionalProperties: false,
              },
            },
          },
          required: ['sections', 'cards'],
          additionalProperties: false,
        },
      },
    },
    messages: [{ role: 'user', content: prompt }],
  }),
}).then((response) => response.json());
const output = result.choices?.[0]?.message?.content;
if (!output) throw new Error('Claude Sonnet returned no patch content.');
const clean = output.replace(/^```json\s*|\s*```$/g, '');
const patches = JSON.parse(clean);
fs.writeFileSync(path.join(root, 'docs/anthropic-developer-course4-critical-patches.json'), `${JSON.stringify(patches, null, 2)}\n`);
console.log(`Generated ${patches.sections?.length ?? 0} sections and ${patches.cards?.length ?? 0} cards.`);
