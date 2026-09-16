import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = '/home/ubuntu/upload/anthropic-partners.skilljar.com_content_wp_4hdejjwplbrm_3rtcsmg1kllky_Developer_M5_vF2.html_1789548126636.html';
const outputPath = path.join(root, 'docs/skilljar-developer5-requirements-checkpoints.json');
if (!fs.existsSync(sourcePath)) throw new Error(`Source Skilljar manquante : ${sourcePath}`);

const source = fs.readFileSync(sourcePath, 'utf8');
const extract = (start, end) => source.slice(source.indexOf(start), source.indexOf(end));
const sourceScreens = {
  S07B: extract('<section class="screen" id="S07B">', '<section class="screen" id="S07C">'),
  S07D: extract('<section class="screen" id="S07D">', '<section class="screen" id="S08">'),
  S07DAnswers: extract('const S07D_ROWS = [', 'const S07D_OPTS'),
};
if (Object.values(sourceScreens).some((value) => !value)) throw new Error('Les écrans Skilljar S07B/S07D ne sont pas entièrement disponibles.');

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, {
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` },
}).then((response) => response.json());
const model = models.data?.find((item) => item.id === 'claude-sonnet-4-6')?.id;
if (!model) throw new Error('Claude Sonnet est indisponible.');

const bilingual = {
  type: 'object',
  properties: { en: { type: 'string' }, fr: { type: 'string' } },
  required: ['en', 'fr'],
  additionalProperties: false,
};
const option = {
  type: 'object',
  properties: { id: { type: 'string' }, text: bilingual },
  required: ['id', 'text'],
  additionalProperties: false,
};
const pair = {
  type: 'object',
  properties: { left: bilingual, right: bilingual },
  required: ['left', 'right'],
  additionalProperties: false,
};

const prompt = `You are converting two authorized Skilljar screens into reusable standard Neopolis activity blocks. Use ONLY the source HTML and answer keys below. Do not invent facts, options, feedback, or additional questions.

S07B is one mandatory checkpoint with exactly two single-choice questions. Return two independent standard single_choice_exercise proposals. The learner-facing proposals MUST NOT contain correct flags, answer keys, or explanations because their corrections are validated server-side. Use sourceScreenId "S07B" and ids "skilljar_s07b_q1" and "skilljar_s07b_q2". Return their answer keys separately in privateAnswerKeys; source indexes 1 and 2 correspond to option IDs "b" and "c". The private explanation MUST reproduce the source rationale for the correct option and the source classification of every distractor. Translate faithfully into French while retaining names like EU.

S07D is one mandatory matching checkpoint. Return exactly five pairs, each right-side label selected from requirements, design, test, deploy, operate. Include the source's exact corrected pairing and a non-empty source-faithful feedback that states the reason for each pairing. The only standard block types permitted are single_choice_exercise and matching. Both checkpoints must be marked required.

SOURCE HTML AND ANSWER KEYS:
${JSON.stringify(sourceScreens)}
`;

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model,
    max_tokens: 10000,
    thinking: { type: 'enabled', budget_tokens: 4096 },
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'skilljar_developer5_requirements_checkpoints',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            singleChoiceExercises: {
              type: 'array', minItems: 2, maxItems: 2,
              items: {
                type: 'object',
                properties: { sourceScreenId: { type: 'string', enum: ['S07B'] }, id: { type: 'string', enum: ['skilljar_s07b_q1', 'skilljar_s07b_q2'] }, title: bilingual, question: bilingual, options: { type: 'array', minItems: 4, maxItems: 4, items: option }, feedback: bilingual, required: { type: 'boolean' } },
                required: ['sourceScreenId', 'id', 'title', 'question', 'options', 'feedback', 'required'],
                additionalProperties: false,
              },
            },
            privateAnswerKeys: {
              type: 'array', minItems: 2, maxItems: 2,
              items: {
                type: 'object', properties: { id: { type: 'string', enum: ['skilljar_s07b_q1', 'skilljar_s07b_q2'] }, correctAnswer: { type: 'string', enum: ['b', 'c'] }, explanation: bilingual },
                required: ['id', 'correctAnswer', 'explanation'], additionalProperties: false,
              },
            },
            matching: {
              type: 'object',
              properties: { sourceScreenId: { type: 'string', enum: ['S07D'] }, id: { type: 'string', enum: ['skilljar_s07d'] }, title: bilingual, instructions: bilingual, pairs: { type: 'array', minItems: 5, maxItems: 5, items: pair }, feedback: bilingual, required: { type: 'boolean' } },
              required: ['sourceScreenId', 'id', 'title', 'instructions', 'pairs', 'feedback', 'required'], additionalProperties: false,
            },
          },
          required: ['singleChoiceExercises', 'privateAnswerKeys', 'matching'],
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
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Propositions Developer 5 S07 générées : ${output.singleChoiceExercises.length + 1}.`);
