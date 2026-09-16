import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceFiles = [
  {
    courseId: 'claude_certified_developer_foundations__04',
    sourcePath: '/home/ubuntu/upload/anthropic-partners.skilljar.com_content_wp_4hdejjwplbrm_2gf8jaub9q0dj_Developer_M4_vF2.html_1789547973784.html',
    screenIds: ['S17', 'S18'],
  },
  {
    courseId: 'claude_certified_developer_foundations__05',
    sourcePath: '/home/ubuntu/upload/anthropic-partners.skilljar.com_content_wp_4hdejjwplbrm_3rtcsmg1kllky_Developer_M5_vF2.html_1789548126636.html',
    screenIds: ['S17', 'S18'],
  },
];

const sourceAnswers = {
  'claude_certified_developer_foundations__04:S17': `Eval/test layer: No eval exists. Success was judged by three manual demo runs with no holdout set and no graded cases, there is nothing to fail a regression against when the prompt or model changes.

Error-handling/cost layer: The retry loop retries every status immediately with time.sleep(0) and does not distinguish terminal errors (400s) from retriable ones. Against a rate limit, each instant retry deepens the limit rather than waiting for it to clear.

Security/guardrail layer: write_file uses page.suggested_path as the destination, a path taken from untrusted fetched content, with no PreToolUse hook enforcing a write boundary and no scope limiting what the agent can write.`,
  'claude_certified_developer_foundations__04:S18': `def answer(question, page_url):
    page = fetch(page_url)                   # still untrusted

    # security: fixed write path + PreToolUse hook enforces it
    notes = read_file("/workspace/input/notes")  # scoped read, unchanged
    write_file("/workspace/output/summary.txt", summarize(page))
    # (hook denies any write outside /workspace/output and audits it)

    # error handling: backoff, honor retry-after, fail fast on terminal
    resp = call_with_retry(
        lambda: client.messages.create(model=MODEL, max_tokens=MAX_TOKENS, messages=msg(question)))

    # eval: answer() is covered by a graded holdout set run on every change
    return resp.content[0].text

Each fix sits at the layer it defends: the fixed write path and hook close the security boundary before the tool runs; call_with_retry adds exponential backoff with terminal-status detection; the graded holdout set gives the eval a baseline score to fail against on every future change.`,
  'claude_certified_developer_foundations__05:S17': `Defect 1 (packaging): the repo_path is hardcoded instead of parameterized; a new engagement cannot configure it without editing the loop.

Defect 2 (deployment/versioning): model="opus" is a moving alias, not a pinned full model ID, and there is no retained prior version to roll back to.

Defect 3 (multi-component boundary): fetched content from the Claude Code task is passed straight into next_call as if it were trusted instructions, instead of being wrapped so the next component treats it as data.`,
};

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

const sourceScreens = sourceFiles.flatMap(({ courseId, sourcePath, screenIds }) => {
  if (!fs.existsSync(sourcePath)) throw new Error(`Source Skilljar manquante : ${sourcePath}`);
  const html = fs.readFileSync(sourcePath, 'utf8');
  return screenIds.map((sourceScreenId) => ({
    courseId,
    sourceScreenId,
    sourceText: extractScreen(html, sourceScreenId),
    sourceAnswer: sourceAnswers[`${courseId}:${sourceScreenId}`] || '',
  }));
});

const currentCourses = sourceFiles.map(({ courseId }) => {
  const course = JSON.parse(fs.readFileSync(path.join(root, `client/public/data/courses/${courseId}.json`), 'utf8'));
  return {
    courseId,
    chapters: course.lessons.flatMap((lesson) => lesson.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      blockTypes: chapter.blocks.map((block) => block.type),
    }))),
  };
});

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, {
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` },
}).then((response) => response.json());
const model = models.data?.find((item) => item.id === 'claude-sonnet-4-6')?.id;
if (!model) throw new Error('Claude Sonnet est indisponible.');

const prompt = `You are transforming four authorized authenticated Skilljar source screens into strictly source-faithful, bilingual Neopolis chapters. Use ONLY the supplied source text. Do not invent facts, code, interaction rules, tools, labs, or assessments.

Each source screen is a cumulative free-response activity. Neopolis must use its existing generic CloudExerciseBlock only, not custom UI and not AI evaluation. This block accepts a non-empty learner answer, blocks sequential navigation until submission, and shows a solution only after submission. Preserve the source's honour-system sequence: learner writes first; model answer is revealed second.

Return exactly one chapter proposal per source screen. A proposal must contain concise learner-facing content in English and French. Preserve code identifiers, commands, paths, model IDs and API identifiers in English. Translate explanatory prose to French faithfully. The solution field must contain only the supplied source model answer or source corrected code; never add new recommendations. For S17, use the source diagnosis/model answer supplied in sourceAnswer. For S18, use the corrected version and its source explanation. State source duration in minutes. Preserve each source answer threshold exactly: Developer 4 S17 and S18 require 40 characters; Developer 5 S17 and S18 require 10 characters.

SOURCE SCREENS:
${JSON.stringify(sourceScreens)}

CURRENT COURSE STRUCTURES:
${JSON.stringify(currentCourses)}`;

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
        name: 'skilljar_developer45_cumulative_patches',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            proposals: {
              type: 'array',
              minItems: 4,
              maxItems: 4,
              items: {
                type: 'object',
                properties: {
                  courseId: { type: 'string', enum: sourceFiles.map((item) => item.courseId) },
                  sourceScreenId: { type: 'string', enum: ['S17', 'S18'] },
                  sourceEvidence: { type: 'string' },
                  id: { type: 'string' },
                  title: bilingualSchema,
                  durationMinutes: { type: 'integer', minimum: 1, maximum: 10 },
                  intro: bilingualSchema,
                  referenceCode: bilingualSchema,
                  assignment: bilingualSchema,
                  instructions: bilingualSchema,
                  steps: { type: 'array', minItems: 1, maxItems: 5, items: bilingualSchema },
                  hint: bilingualSchema,
                  solution: bilingualSchema,
                  successMessage: bilingualSchema,
                  minimumAnswerLength: { type: 'integer', minimum: 1, maximum: 200 },
                },
                required: ['courseId', 'sourceScreenId', 'sourceEvidence', 'id', 'title', 'durationMinutes', 'intro', 'referenceCode', 'assignment', 'instructions', 'steps', 'hint', 'solution', 'successMessage', 'minimumAnswerLength'],
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
fs.writeFileSync(path.join(root, 'docs/skilljar-developer45-cumulative-patches.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Propositions cumulatives générées : ${output.proposals.length}.`);
