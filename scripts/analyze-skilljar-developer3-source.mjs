import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = '/home/ubuntu/upload/anthropic-partners.skilljar.com_content_wp_4hdejjwplbrm_168108zug1cy3_Developer_M3_vF2.html_1789547458029.html';
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__03.json');

if (!fs.existsSync(sourcePath)) {
  throw new Error(`La capture source Skilljar attendue est absente : ${sourcePath}`);
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function toText(value) {
  return decodeHtml(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:p|h1|h2|h3|li|tr|div|section)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+\n/g, '\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim(),
  );
}

const html = fs.readFileSync(sourcePath, 'utf8');
const screens = [];
const sectionPattern = /<section class="screen[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g;
for (const match of html.matchAll(sectionPattern)) {
  const [, id, fragment] = match;
  const title = toText(fragment.match(/<h[12][^>]*class="screen-title"[^>]*>([\s\S]*?)<\/h[12]>/i)?.[1] ?? '');
  const meta = toText(fragment.match(/<div class="screen-meta">([\s\S]*?)<\/div>/i)?.[1] ?? '');
  const interactions = [...fragment.matchAll(/<(?:button|div)[^>]+id="([^"]+)"[^>]*>/gi)]
    .map((entry) => entry[1])
    .filter((value) => /(?:S\d+|match|submit|skip)/i.test(value));
  const sourceText = toText(fragment).slice(0, 9000);
  screens.push({ id, meta, title, interactions, sourceText });
}

const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const current = course.lessons.flatMap((lesson) => lesson.chapters.map((chapter) => ({
  id: chapter.id,
  title: chapter.title,
  type: chapter.type,
  durationMinutes: chapter.durationMinutes ?? null,
  blockTypes: chapter.blocks.map((block) => block.type),
  exerciseIds: chapter.blocks
    .filter((block) => block.exerciseId || block.id)
    .map((block) => block.exerciseId ?? block.id),
})));

const modelCatalog = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, {
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` },
}).then((response) => response.json());
const model = modelCatalog.data?.find((item) => item.id === 'claude-sonnet-4-6')?.id;
if (!model) throw new Error('Claude Sonnet est indisponible.');

const prompt = `You are auditing an authorized, authenticated Skilljar source against a Neopolis course JSON. Work only from the supplied source screens and current structure. Do not invent content, source screens, activities, or facts.

The learner-facing source has 22 screens including checkpoints. Neopolis must use its standard blocks only. Decide what is factually safe to reconcile next. The user specifically needs the remaining Developer 3 TP/checkpoint/integration gaps checked.

Return JSON only.

For each confirmed gap, cite screenIds, exact source evidence (at most 240 characters), the currently absent/partial Neopolis topic, a recommended action, and one of these statuses: "safe_to_reconstruct", "source_visible_but_needs_standard_block_mapping", "do_not_reconstruct". Use safe_to_reconstruct only if the supplied source fully describes the visible educational content and the interaction can be expressed with a listed standard block already used in Neopolis (content, flip_cards, bucket_sort, single_choice_exercise, checkpoint, matching). Never suggest an external lab, a live cloud task, a root exercise, a custom UI, or an unverified completion rule.

Also list the current Neopolis chapters that already align with the source. Focus on high-impact missing source material: MCP Servers, Enterprise Integration, Cumulative Integration Task, Key Takeaways, and any source checkpoint absent from Neopolis. Do not emit prose outside JSON.

SOURCE SCREENS:
${JSON.stringify(screens)}

CURRENT NEOPOLIS STRUCTURE:
${JSON.stringify(current)}`;

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model,
    max_tokens: 7500,
    thinking: { type: 'enabled', budget_tokens: 2048 },
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'skilljar_developer3_source_audit',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            sourceScreenCount: { type: 'integer' },
            existingAlignment: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sourceScreenIds: { type: 'array', items: { type: 'string' } },
                  neopolisChapterId: { type: 'string' },
                  reason: { type: 'string' },
                },
                required: ['sourceScreenIds', 'neopolisChapterId', 'reason'],
                additionalProperties: false,
              },
            },
            confirmedGaps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sourceScreenIds: { type: 'array', items: { type: 'string' } },
                  sourceTopic: { type: 'string' },
                  sourceEvidence: { type: 'string' },
                  missingOrPartialInNeopolis: { type: 'string' },
                  recommendedAction: { type: 'string' },
                  standardBlock: { type: 'string' },
                  status: {
                    type: 'string',
                    enum: ['safe_to_reconstruct', 'source_visible_but_needs_standard_block_mapping', 'do_not_reconstruct'],
                  },
                },
                required: ['sourceScreenIds', 'sourceTopic', 'sourceEvidence', 'missingOrPartialInNeopolis', 'recommendedAction', 'standardBlock', 'status'],
                additionalProperties: false,
              },
            },
            nextLot: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sourceScreenIds: { type: 'array', items: { type: 'string' } },
                  action: { type: 'string' },
                  rationale: { type: 'string' },
                },
                required: ['sourceScreenIds', 'action', 'rationale'],
                additionalProperties: false,
              },
            },
            retainOpen: { type: 'array', items: { type: 'string' } },
          },
          required: ['sourceScreenCount', 'existingAlignment', 'confirmedGaps', 'nextLot', 'retainOpen'],
          additionalProperties: false,
        },
      },
    },
    messages: [{ role: 'user', content: prompt }],
  }),
}).then((result) => result.json());

const text = response.choices?.[0]?.message?.content;
if (!text) throw new Error(`Claude Sonnet did not return an audit: ${JSON.stringify(response)}`);
const audit = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ''));
fs.writeFileSync(path.join(root, 'docs/skilljar-developer3-source-audit.json'), `${JSON.stringify(audit, null, 2)}\n`);
console.log(`Skilljar Developer 3 audit generated: ${audit.sourceScreenCount} source screens, ${audit.confirmedGaps.length} confirmed gaps.`);
