import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const course = JSON.parse(fs.readFileSync(path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__05.json'), 'utf8'));
const lesson = course.lessons[0];
const selectedIds = new Set(['chapter_01', 'chapter_09']);
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

const prompt = `Review only the supplied French learner-facing content for a Claude developer course. Return JSON only. Identify at most 18 high-impact exact replacements where ordinary French prose or table labels visibly mix English words. A replacement is allowed only when oldText occurs exactly once in its chapter contentFr and newText is a faithful French localization based only on the supplied text. Keep these technical identifiers, products, code tokens, API paths, providers, version/model names and standards unchanged whenever they are identifiers: Claude, Anthropic, AWS, Amazon Bedrock, Google Vertex AI, Microsoft Foundry, API, MCP, IAM, ARN, JSON, HTTP, repo_path, model IDs, /anthropic/v1/messages, tool names, and code. Do not rewrite entire sections, add claims, change facts, create activities, or translate code. If terminology is a product name or ambiguous, put it in unresolved instead.

SOURCE:
${JSON.stringify(source)}`;
const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model,
    max_tokens: 7500,
    thinking: { type: 'enabled', budget_tokens: 1024 },
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'developer_course5_localization_patches',
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
}).then((result) => result.json());
const text = response.choices?.[0]?.message?.content;
if (!text) throw new Error('Claude Sonnet returned no localization patch content.');
const patch = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ''));
fs.writeFileSync(path.join(root, 'docs/anthropic-developer-course5-localization-patches.json'), `${JSON.stringify(patch, null, 2)}\n`);
console.log(`Generated ${patch.patches.length} localizations and ${patch.unresolved.length} unresolved items.`);
