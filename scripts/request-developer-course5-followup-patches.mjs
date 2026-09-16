import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const course = JSON.parse(fs.readFileSync(path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__05.json'), 'utf8'));
const lesson = course.lessons[0];
const selectedIds = new Set(['chapter_01', 'chapter_03', 'chapter_09', 'chapter_13']);
const source = lesson.chapters.filter((chapter) => selectedIds.has(chapter.id)).map((chapter) => ({
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

const prompt = `You are repairing source-supplied French/English content for a Claude developer training course. Return JSON only.

The supplied chapters contain a limited set of visible defects:
- chapter_01: two concatenated packaging tables and three visibly truncated card backs;
- chapter_03: one concatenated contribution table and two visibly truncated card backs;
- chapter_09: one concatenated platform/versioning table;
- chapter_13: two visibly truncated card backs.

Use only the supplied facts. Do not create activities, courses, labs, claims, citations, or whole-section rewrites. Preserve code, product names, API names, field names, versions, URLs, identifiers, and numerical values. Keep technical identifiers exactly when needed (Claude, MCP, API, JSON, repo_path, HTTP status, tool names, code). Do not modify chapter_05.

For a table patch, oldEn and oldFr must each be the exact full concatenated segment that occurs exactly once inside the respective supplied body, with no surrounding paragraph. Replace it with concise valid Markdown using only equivalent existing facts. For a card patch, front must exactly match a supplied English card front; return only visibly truncated cards and restore a complete explanation from the supplied context. If you cannot establish an exact safe replacement, include it in unresolved instead.

SOURCE:
${JSON.stringify(source)}`;
const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model,
    max_tokens: 14000,
    thinking: { type: 'enabled', budget_tokens: 2048 },
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'developer_course5_followup_patches',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            tables: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  chapterId: { type: 'string' },
                  oldEn: { type: 'string' },
                  newEn: { type: 'string' },
                  oldFr: { type: 'string' },
                  newFr: { type: 'string' },
                },
                required: ['chapterId', 'oldEn', 'newEn', 'oldFr', 'newFr'],
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
                  back: {
                    type: 'object',
                    properties: { en: { type: 'string' }, fr: { type: 'string' } },
                    required: ['en', 'fr'],
                    additionalProperties: false,
                  },
                },
                required: ['chapterId', 'front', 'back'],
                additionalProperties: false,
              },
            },
            unresolved: { type: 'array', items: { type: 'string' } },
          },
          required: ['tables', 'cards', 'unresolved'],
          additionalProperties: false,
        },
      },
    },
    messages: [{ role: 'user', content: prompt }],
  }),
}).then((result) => result.json());
const text = response.choices?.[0]?.message?.content;
if (!text) throw new Error('Claude Sonnet returned no follow-up patch content.');
const patch = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ''));
fs.writeFileSync(path.join(root, 'docs/anthropic-developer-course5-followup-patches.json'), `${JSON.stringify(patch, null, 2)}\n`);
console.log(`Generated ${patch.tables.length} table patches, ${patch.cards.length} card patches, and ${patch.unresolved.length} unresolved items.`);
