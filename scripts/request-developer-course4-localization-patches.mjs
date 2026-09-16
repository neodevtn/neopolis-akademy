import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const course = JSON.parse(fs.readFileSync(path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__04.json'), 'utf8'));
const lesson = course.lessons[0];
const selectedIds = new Set(['chapter_05', 'chapter_09']);
const source = lesson.chapters
  .filter((chapter) => selectedIds.has(chapter.id))
  .map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    contentFr: chapter.blocks.find((block) => block.type === 'content')?.body?.fr ?? '',
  }));

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, {
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` },
}).then((response) => response.json());
const model = models.data?.find((item) => item.id === 'claude-sonnet-4-6')?.id;
if (!model) throw new Error('Claude Sonnet is unavailable.');

const prompt = `You are reviewing the French learner-facing body text for two supplied chapters of an Anthropic developer training course. Return JSON only. Identify at most 12 high-impact, exact replacements for generic English learner-facing text that remains inside the French content. A replacement is allowed only when oldText occurs exactly once in the supplied contentFr and newText is a faithful French localization using only the supplied facts. Preserve all technical identifiers, code, product names, protocol/status identifiers, and values exactly when they are identifiers: Claude, Anthropic, HTTP 429, HTTP 529, retry-after, stop_reason, tool_use, input_json, JSON, Python, hook, subagent, orchestrator-worker, single-agent. Do not alter English inside code samples, quoted API field names, headings that are product names, or any source claim. Do not create activities, examples, external citations, or whole-section rewrites. If a term is legitimately technical or uncertain, list it in unresolved rather than patching it.

SOURCE:
${JSON.stringify(source)}`;
const result = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model,
    max_tokens: 6000,
    thinking: { type: 'enabled', budget_tokens: 1024 },
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'developer_course4_localization_patches',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            patches: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  chapterId: { type: 'string' },
                  oldText: { type: 'string' },
                  newText: { type: 'string' },
                  reason: { type: 'string' },
                },
                required: ['chapterId', 'oldText', 'newText', 'reason'],
                additionalProperties: false,
              },
            },
            unresolved: { type: 'array', items: { type: 'string' } },
          },
          required: ['patches', 'unresolved'],
          additionalProperties: false,
        },
      },
    },
    messages: [{ role: 'user', content: prompt }],
  }),
}).then((response) => response.json());
const output = result.choices?.[0]?.message?.content;
if (!output) throw new Error('Claude Sonnet returned no localization patch content.');
const patches = JSON.parse(output.replace(/^```json\s*|\s*```$/g, ''));
fs.writeFileSync(path.join(root, 'docs/anthropic-developer-course4-localization-patches.json'), `${JSON.stringify(patches, null, 2)}\n`);
console.log(`Generated ${patches.patches.length} localizations and ${patches.unresolved.length} unresolved items.`);
