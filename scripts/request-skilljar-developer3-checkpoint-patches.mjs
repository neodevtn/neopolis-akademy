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
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const html = fs.readFileSync(sourcePath, 'utf8');
const sourceScreens = ['S07', 'S14', 'S17'].map((sourceScreenId) => ({
  sourceScreenId,
  sourceText: extractScreen(html, sourceScreenId),
}));

const sourceCorrections = {
  S07: {
    answer: 'PreToolUse; a command script reads the tool call from stdin, checks the file path, and exits with code 2 for .env.production while writing the reason to stderr.',
    explanation: 'PreToolUse runs before the tool call, so it can block. PostToolUse cannot prevent a tool call that has already happened.',
  },
  S14: {
    pairs: [
      ['A local SQLite query tool used only on one development machine.', 'stdio + Local'],
      ['A company-hosted code search service shared by the engineering team.', 'HTTP + Project (.mcp.json)'],
      ['An experimental repository-specific web scraper not ready to share.', 'stdio or HTTP + Local'],
      ['A security scanner IT deploys to every developer Claude Code installation.', 'HTTP + Enterprise (managed settings)'],
    ],
    explanation: 'stdio is for a server on the learner machine; HTTP is for a remote service or a service reached by multiple machines. Local scope is personal, project scope is shared through .mcp.json, and enterprise scope is deployed by administrators.',
  },
  S17: {
    correctAnswer: 'b',
    explanation: 'The 401 means the key is rejected and must be rotated. The plaintext key in a known file is also a secret-handling failure. The targeted fix rotates the key, moves the value into a CI-injected environment variable, and updates MCP configuration to reference that variable.',
  },
};

const course = JSON.parse(fs.readFileSync(path.join(root, `client/public/data/courses/${courseId}.json`), 'utf8'));
const courseStructure = course.lessons.flatMap((lesson) => lesson.chapters.map((chapter) => ({
  id: chapter.id,
  title: chapter.title,
  blockTypes: chapter.blocks.map((block) => block.type),
})));

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, {
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` },
}).then((response) => response.json());
const model = models.data?.find((item) => item.id === 'claude-sonnet-4-6')?.id;
if (!model) throw new Error('Claude Sonnet est indisponible.');

const prompt = `You are converting three authorized authenticated Skilljar checkpoints into standard Neopolis blocks. Use ONLY the supplied source screens and source corrections. Do not invent facts, options, interactions, code, or feedback.

Source S07 uses two selection blanks. Represent it as a standard matching block with exactly two pairs: the lifecycle event and blocking command. Source S14 is a four-pair transport-and-scope matching block. For S07 and S14, use a French translation faithful to source while preserving technical identifiers such as PreToolUse, stdin, .env.production, stdio, HTTP, .mcp.json, and MCP.

Source S17 is a sensitive standard single-choice exercise. Return its three options, but do NOT include a correct marker or answer in that learner-facing proposal. It will be validated by the existing serverValidated mechanism. Preserve the connection trace as learner-facing reference code. The private answer key is separately fixed to option b.

All checkpoints are mandatory: chapter completion must require their standard interaction completion. Keep answer explanations concise and source-faithful. Return bilingual fields. Never create bespoke UI or a free-response activity.

SOURCE SCREENS:\n${JSON.stringify(sourceScreens)}\n\nSOURCE CORRECTIONS:\n${JSON.stringify(sourceCorrections)}\n\nCURRENT COURSE STRUCTURE:\n${JSON.stringify(courseStructure)}`;

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
    max_tokens: 12000,
    thinking: { type: 'enabled', budget_tokens: 4096 },
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'skilljar_developer3_checkpoint_patches',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            proposals: {
              type: 'array',
              minItems: 3,
              maxItems: 3,
              items: {
                type: 'object',
                properties: {
                  sourceScreenId: { type: 'string', enum: ['S07', 'S14', 'S17'] },
                  targetChapterId: { type: 'string', enum: ['chapter_03', 'chapter_05'] },
                  id: { type: 'string' },
                  type: { type: 'string', enum: ['matching', 'single_choice_exercise'] },
                  title: bilingualSchema,
                  instructions: bilingualSchema,
                  sourceEvidence: { type: 'string' },
                  feedback: bilingualSchema,
                  referenceCode: bilingualSchema,
                  pairs: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: { left: bilingualSchema, right: bilingualSchema },
                      required: ['left', 'right'],
                      additionalProperties: false,
                    },
                  },
                  question: bilingualSchema,
                  options: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: { id: { type: 'string' }, text: bilingualSchema },
                      required: ['id', 'text'],
                      additionalProperties: false,
                    },
                  },
                  serverValidated: { type: 'boolean' },
                },
                required: ['sourceScreenId', 'targetChapterId', 'id', 'type', 'title', 'instructions', 'sourceEvidence', 'feedback', 'referenceCode', 'pairs', 'question', 'options', 'serverValidated'],
                additionalProperties: false,
              },
            },
          },
          required: ['proposals'],
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
fs.writeFileSync(path.join(root, 'docs/skilljar-developer3-checkpoint-patches.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Propositions Developer 3 générées : ${output.proposals.length}.`);
