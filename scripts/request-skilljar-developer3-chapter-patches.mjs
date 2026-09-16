import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const courseId = 'claude_certified_developer_foundations__03';
const sourcePath = '/home/ubuntu/upload/anthropic-partners.skilljar.com_content_wp_4hdejjwplbrm_168108zug1cy3_Developer_M3_vF2.html_1789547458029.html';

if (!fs.existsSync(sourcePath)) throw new Error(`Source Skilljar manquante : ${sourcePath}`);

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function extractScreen(html, id) {
  const pattern = new RegExp(`<section class="screen" id="${id}">([\\s\\S]*?)<\\/section>`);
  const match = html.match(pattern);
  if (!match) throw new Error(`Écran Skilljar ${id} introuvable.`);
  return decodeHtml(match[1])
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/h[1-4]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const html = fs.readFileSync(sourcePath, 'utf8');
const sourceScreens = ['S12', 'S13', 'S15', 'S16', 'S20'].map((sourceScreenId) => ({
  sourceScreenId,
  sourceText: extractScreen(html, sourceScreenId),
}));

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, {
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` },
}).then((response) => response.json());
const model = models.data?.find((item) => item.id === 'claude-sonnet-4-6')?.id;
if (!model) throw new Error('Claude Sonnet est indisponible.');

const prompt = `You are transforming five authorized authenticated Skilljar source screens into exactly three bilingual Neopolis teaching chapters. Use ONLY the supplied screen text. Do not invent facts, versions, code, tools, labs, or assessments. Do not include any source reference as learner-facing copy.

Produce exactly:
1) MCP Servers, derived only from S12 and S13, including server model, tools/resources/prompts, transport and scope, context cost, prompt caching, RAG, GitHub server example, and the inline credential warning. Use 3 to 6 concise flip cards only for concepts directly visible in the source.
2) Enterprise Integration, derived only from S15 and S16, including identity/auth patterns, separation/rotation of secrets, audit and residency, production OAuth redirect URI warning. Use 3 concise flip cards only for the three explicitly supplied service-authentication patterns.
3) Key Takeaways, derived only from S20, with no flip cards unless necessary. Preserve the seven supplied recap concepts, in concise form.

The content body is Markdown. Preserve product names, identifiers, paths, commands, configuration keys and code tokens in English. Translate explanatory prose to French faithfully. Use content and flip_cards blocks only. Keep the material concise enough for short Neopolis screens, but retain every key conclusion specified above. Do not create custom UI.

SOURCE SCREENS:\n${JSON.stringify(sourceScreens)}`;

const bilingualSchema = {
  type: 'object',
  properties: { en: { type: 'string' }, fr: { type: 'string' } },
  required: ['en', 'fr'],
  additionalProperties: false,
};

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model,
    max_tokens: 20000,
    thinking: { type: 'enabled', budget_tokens: 6144 },
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'skilljar_developer3_chapter_patches',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            chapters: {
              type: 'array',
              minItems: 3,
              maxItems: 3,
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', enum: ['chapter_skilljar_mcp_servers', 'chapter_skilljar_enterprise_integration', 'chapter_06'] },
                  sourceScreenIds: {
                    type: 'array',
                    minItems: 1,
                    maxItems: 2,
                    items: { type: 'string', enum: ['S12', 'S13', 'S15', 'S16', 'S20'] },
                  },
                  title: bilingualSchema,
                  durationMinutes: { type: 'integer', minimum: 1, maximum: 30 },
                  body: bilingualSchema,
                  flipCards: {
                    type: 'array',
                    maxItems: 6,
                    items: {
                      type: 'object',
                      properties: { front: bilingualSchema, back: bilingualSchema },
                      required: ['front', 'back'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['id', 'sourceScreenIds', 'title', 'durationMinutes', 'body', 'flipCards'],
                additionalProperties: false,
              },
            },
          },
          required: ['chapters'],
          additionalProperties: false,
        },
      },
    },
    messages: [{ role: 'user', content: prompt }],
  }),
}).then((result) => result.json());

const text = response.choices?.[0]?.message?.content;
if (!text) throw new Error(`Claude Sonnet n'a retourné aucune proposition : ${JSON.stringify(response)}`);
const output = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ''));
fs.writeFileSync(path.join(root, 'docs/skilljar-developer3-chapter-patches.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Propositions de chapitres Developer 3 générées : ${output.chapters.length}.`);
