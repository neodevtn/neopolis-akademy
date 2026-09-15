import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const projectRoot = process.cwd();
const coursePath = join(projectRoot, 'client/public/data/courses/claude_certified_associate_foundations__07.json');
const outputPath = join(projectRoot, 'docs/anthropic-associate-course7-claude-audit.json');

const course = await readFile(coursePath, 'utf8');
const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 5000,
    thinking: { type: 'enabled', budget_tokens: 2048 },
    messages: [
      {
        role: 'system',
        content:
          'Tu es un auditeur de contenu pédagogique Anthropic. Analyse uniquement le JSON fourni. Ne crée pas de contenu spéculatif et ne modifie pas les noms produits Anthropic (Claude, Skills, Projects, Code Execution, MCP, Memory). Signale seulement les défauts démontrables, notamment texte visiblement tronqué, mélange de langues, durée incompatible, titres/formats fragmentés ou activités hors contexte. Ne considère pas les répétitions pédagogiques délibérées comme un défaut sans preuve.',
      },
      { role: 'user', content: `Audit ce cours Associate 7 :\n${course}` },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'associate_course_audit',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            findings: {
              type: 'array',
              maxItems: 12,
              items: {
                type: 'object',
                properties: {
                  chapter_id: { type: 'string' },
                  severity: { type: 'string', enum: ['high', 'medium', 'low'] },
                  issue_type: {
                    type: 'string',
                    enum: ['duration', 'truncation', 'localization', 'structure', 'activity', 'terminology', 'other'],
                  },
                  evidence: { type: 'string' },
                  recommended_fix: { type: 'string' },
                },
                required: ['chapter_id', 'severity', 'issue_type', 'evidence', 'recommended_fix'],
                additionalProperties: false,
              },
            },
          },
          required: ['findings'],
          additionalProperties: false,
        },
      },
    },
  }),
});

if (!response.ok) {
  throw new Error(`Claude audit failed: ${response.status} ${await response.text()}`);
}

const payload = await response.json();
const content = payload.choices?.[0]?.message?.content;
if (typeof content !== 'string') throw new Error('Claude audit returned no textual JSON content.');
const audit = JSON.parse(content);
await writeFile(outputPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
console.log(`Saved ${audit.findings.length} Claude Sonnet findings to ${outputPath}`);
