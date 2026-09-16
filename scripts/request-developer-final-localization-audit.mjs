import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const courses = [
  'claude_certified_developer_foundations__03.json',
  'claude_certified_developer_foundations__04.json',
  'claude_certified_developer_foundations__05.json',
];
const candidatePattern = /\b(?:What|When|Why|How|Overview|Introduction|Key|Best|Practice|Lesson|Checkpoint|Step|Choose|Build|Use|Apply|Tradeoff|Guardrail|Workflow|Release|Deploy|Review|Testing|Error|Tracing|Observability|Packaging|Contribution|Skills|Plugin|Memory)\b/;

function collectFrenchCandidates(value, trace = [], candidates = []) {
  if (typeof value === 'string') {
    if (candidatePattern.test(value) && value.length <= 1600) {
      candidates.push({ trace: trace.join('.'), text: value });
    }
    return candidates;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectFrenchCandidates(item, [...trace, String(index)], candidates));
    return candidates;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'fr') collectFrenchCandidates(item, [...trace, key], candidates);
      else if (key !== 'en') collectFrenchCandidates(item, [...trace, key], candidates);
    }
  }
  return candidates;
}

const source = courses.map((filename) => {
  const course = JSON.parse(fs.readFileSync(path.join(root, 'client/public/data/courses', filename), 'utf8'));
  return {
    courseId: course.courseId,
    candidates: collectFrenchCandidates(course),
  };
});

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, {
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` },
}).then((response) => response.json());
const model = models.data?.find((item) => item.id === 'claude-sonnet-4-6')?.id;
if (!model) throw new Error('Claude Sonnet is unavailable.');

const prompt = `You are auditing French learner-facing content in Claude Developer Foundations courses. Return JSON only. Review only the supplied candidate strings. Identify at most 15 exact, high-impact replacements where ordinary learner prose or an ordinary table label visibly mixes English into French. A replacement is allowed only when oldText occurs exactly once in that course's public JSON and newText is a faithful French localization based solely on the supplied text.

Do NOT translate or alter technical identifiers, product names, code, commands, file paths, API names, platform/provider names, version/model names, standards, error messages, or recognized technical terms when translation is uncertain. In particular, leave unchanged: Claude, Anthropic, Claude Code, Agent SDK, Skills, Plugin, Plugins, MCP, API, IAM, ARN, JSON, HTTP, Git, GitHub, OpenTelemetry, AWS, Amazon Bedrock, Google Vertex AI, Microsoft Foundry, model IDs, code identifiers, code blocks, shell commands, headers, and literal error messages. Do not add facts, activities, checkpoints, or explanation. If a candidate is technical, ambiguous, already natural French, or has more than one possible meaning, add it to unresolved rather than patching it.

For each patch, cite the exact courseId, oldText, newText, and a short reason. Do not return a patch unless it meets every condition.

CANDIDATES:
${JSON.stringify(source)}`;

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model,
    max_tokens: 6000,
    thinking: { type: 'enabled', budget_tokens: 1536 },
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'developer_final_localization_audit',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            patches: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  courseId: { type: 'string' },
                  oldText: { type: 'string' },
                  newText: { type: 'string' },
                  reason: { type: 'string' },
                },
                required: ['courseId', 'oldText', 'newText', 'reason'],
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
if (!text) throw new Error(`Claude Sonnet returned no final localization audit: ${JSON.stringify(response)}`);
const audit = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ''));
fs.writeFileSync(path.join(root, 'docs/anthropic-developer-final-localization-audit.json'), `${JSON.stringify(audit, null, 2)}\n`);
console.log(`Generated ${audit.patches.length} final localization patches and ${audit.unresolved.length} unresolved candidates.`);
