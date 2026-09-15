import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const course = JSON.parse(fs.readFileSync(path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__05.json'), 'utf8'));
const lesson = course.lessons[0];
const selectedIds = new Set(['chapter_01', 'chapter_03', 'chapter_05', 'chapter_13']);
const source = lesson.chapters.filter((chapter) => selectedIds.has(chapter.id)).map((chapter) => ({
  id: chapter.id,
  content: chapter.blocks.find((block) => block.type === 'content')?.body ?? null,
  cards: chapter.blocks.filter((block) => block.type === 'flip_cards').flatMap((block) => block.cards ?? []),
}));

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, { headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` } }).then((response) => response.json());
const model = models.data?.find((item) => item.id === 'claude-sonnet-4-6')?.id;
if (!model) throw new Error('Claude Sonnet is unavailable.');
const prompt = `Return JSON only with {"cards":[{"chapterId":"...","front":"...","back":{"en":"...","fr":"..."}}],"lifecycleFr":"..."}. Restore only visibly truncated cards in the supplied Developer Foundations course source. Preserve code, product names, identifiers, facts, and the original teaching point. The lifecycleFr must be a concise French replacement for the chapter 05 content, retaining its existing stages and interactions while translating generic learner-facing labels such as Requirements, Design, Build, Test, Deploy, Operate, Iterate, gating and baseline. Do not create activities or claims.\nSOURCE:\n${JSON.stringify(source)}`;
const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model,
    max_tokens: 9000,
    thinking: { type: 'enabled', budget_tokens: 1024 },
    response_format: { type: 'json_schema', json_schema: { name: 'developer_course5_patches', strict: true, schema: { type: 'object', properties: { cards: { type: 'array', items: { type: 'object', properties: { chapterId: { type: 'string' }, front: { type: 'string' }, back: { type: 'object', properties: { en: { type: 'string' }, fr: { type: 'string' } }, required: ['en', 'fr'], additionalProperties: false } }, required: ['chapterId', 'front', 'back'], additionalProperties: false } }, lifecycleFr: { type: 'string' } }, required: ['cards', 'lifecycleFr'], additionalProperties: false } } },
    messages: [{ role: 'user', content: prompt }],
  }),
}).then((result) => result.json());
const text = response.choices?.[0]?.message?.content;
if (!text) throw new Error('Claude Sonnet returned no patch content.');
const patch = JSON.parse(text);
fs.writeFileSync(path.join(root, 'docs/anthropic-developer-course5-critical-patches.json'), `${JSON.stringify(patch, null, 2)}\n`);
console.log(`Generated ${patch.cards.length} card patches.`);
