import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const courseId = 'claude_certified_developer_foundations__03';
const sourcePath = '/home/ubuntu/upload/anthropic-partners.skilljar.com_content_wp_4hdejjwplbrm_168108zug1cy3_Developer_M3_vF2.html_1789547458029.html';

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
    .replace(/sk-prod-warehouse-abc123/g, '[COMPROMISED_TOKEN_REDACTED]')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

if (!fs.existsSync(sourcePath)) throw new Error(`Source Skilljar manquante : ${sourcePath}`);
const sourceHtml = fs.readFileSync(sourcePath, 'utf8');
const sourceScreens = ['S18', 'S19'].map((sourceScreenId) => ({
  sourceScreenId,
  sourceText: extractScreen(sourceHtml, sourceScreenId),
}));

const sourceFeedback = {
  S18: {
    all: 'Bug 1 is bypassPermissions on a production workstation, the mode removes the safety prompts the migration requires. Bug 2 is an absolute path in the skill, it resolves on the author’s machine and nowhere else. Bug 3 is an inline API key in .mcp.json, once committed it lives in repository history regardless of later edits.',
    missedKey: 'You caught the permission mode and the path, but the inline API key in .mcp.json is still there. A key committed to a configuration file enters repository history, where it stays even after later edits. Revise your diagnosis and resubmit.',
    two: 'Review the missed file through the lens of its layer: settings for permission-mode safety, skills for path portability, MCP configuration for secret handling. Revise your diagnosis and resubmit.',
    one: 'Look at each file through the lens of its layer: settings for permission-mode safety, skills for path portability, and MCP configuration for secret handling. Revise your diagnosis and resubmit.',
  },
  S19: {
    correct: 'The settings file keeps defaultMode inside permissions and sets it to acceptEdits, the skill uses a project-relative path variable, and the MCP configuration references the credential as an environment variable.',
    permission: 'The skill path and API key are correct, but the permission mode still uses bypassPermissions. For a production workstation running a migration, that mode removes the confirmation prompts that would catch an unintended destructive command. Revise your assembly and resubmit.',
    path: 'The mode and API key handling are correct, but the skill still uses an absolute path. Use $CLAUDE_PROJECT_DIR to reference the script from the project root so it resolves on any machine. Revise your assembly and resubmit.',
    secret: 'The mode and path are correct, but the inline key is still committed to .mcp.json. Reference an environment variable so the credential never enters repository history. Revise your assembly and resubmit.',
  },
};

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, {
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` },
}).then((response) => response.json());
const model = models.data?.find((item) => item.id === 'claude-sonnet-4-6')?.id;
if (!model) throw new Error('Claude Sonnet est indisponible.');

const bilingualSchema = {
  type: 'object',
  properties: { en: { type: 'string' }, fr: { type: 'string' } },
  required: ['en', 'fr'],
  additionalProperties: false,
};

const prompt = `You are transforming two authorized authenticated Skilljar source screens into source-faithful bilingual Neopolis CloudExerciseBlock chapters. Use ONLY the supplied source screens and feedback messages. Do not invent facts, code, interactions, feedback, labs, grading, or prerequisites.

The Neopolis block already provides: a required free-text answer, a solution revealed only after the answer has at least 10 non-space characters, optional post-reveal reflection choices, and sequential locking until an option marked passes=true is chosen. Preserve this exact source order: learner writes first; model answer reveals second; learner self-assesses; only the correct self-assessment choice unlocks the next chapter. Use exactly four reflection choices per task. Source options S18: all, missed-key, two, one. Source options S19: correct, permission, path, secret. Only all/correct passes=true. Translate prose faithfully to French while preserving code identifiers, commands, paths, configuration keys, and environment variables. Do NOT include any secret-looking literal: replace the source’s redacted secret with [JETON_COMPROMIS] in French and [COMPROMISED_TOKEN] in English. Keep the source duration of 6 minutes and answer minimum of 10 characters for both screens.

SOURCE SCREENS:
${JSON.stringify(sourceScreens)}

SOURCE FEEDBACK:
${JSON.stringify(sourceFeedback)}`;

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
        name: 'skilljar_developer3_cumulative_patches',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            proposals: {
              type: 'array',
              minItems: 2,
              maxItems: 2,
              items: {
                type: 'object',
                properties: {
                  sourceScreenId: { type: 'string', enum: ['S18', 'S19'] },
                  sourceEvidence: { type: 'string' },
                  id: { type: 'string' },
                  title: bilingualSchema,
                  durationMinutes: { type: 'integer', minimum: 6, maximum: 6 },
                  intro: bilingualSchema,
                  referenceCode: bilingualSchema,
                  assignment: bilingualSchema,
                  instructions: bilingualSchema,
                  solution: bilingualSchema,
                  successMessage: bilingualSchema,
                  minimumAnswerLength: { type: 'integer', minimum: 10, maximum: 10 },
                  reflectionTitle: bilingualSchema,
                  reflectionOptions: {
                    type: 'array',
                    minItems: 4,
                    maxItems: 4,
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        label: bilingualSchema,
                        feedback: bilingualSchema,
                        passes: { type: 'boolean' },
                      },
                      required: ['id', 'label', 'feedback', 'passes'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['sourceScreenId', 'sourceEvidence', 'id', 'title', 'durationMinutes', 'intro', 'referenceCode', 'assignment', 'instructions', 'solution', 'successMessage', 'minimumAnswerLength', 'reflectionTitle', 'reflectionOptions'],
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
fs.writeFileSync(path.join(root, 'docs/skilljar-developer3-cumulative-patches.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Propositions cumulatives Developer 3 générées : ${output.proposals.length}.`);
