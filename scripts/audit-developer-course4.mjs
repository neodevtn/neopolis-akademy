import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const projectRoot = process.cwd();
const coursePath = join(projectRoot, 'client/public/data/courses/claude_certified_developer_foundations__04.json');
const outputPath = join(projectRoot, 'docs/anthropic-developer-course4-claude-audit.json');
const course = await readFile(coursePath, 'utf8');
const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6', max_tokens: 4200, thinking: { type: 'enabled', budget_tokens: 1800 },
    messages: [
      { role: 'system', content: 'Tu es un auditeur de contenu pédagogique Anthropic. Analyse uniquement le JSON. Ne crée rien, ne renomme aucun produit Anthropic (Claude, Claude Code, Skills, Projects, Code Execution, MCP, Memory, API Messages, AsyncAnthropic, Message Batches). Signale uniquement les défauts 80/20 démontrables : troncature, mélange FR/EN, pseudo-tableau/titre fragmenté, activité racine invisible/non rattachée, média générique sans provenance, ou durée incohérente. Écarte les répétitions pédagogiques normaux.' },
      { role: 'user', content: `Audit du cours Developer 4 :\n${course}` },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'developer_course4_audit', strict: true, schema: { type: 'object', properties: { findings: { type: 'array', maxItems: 12, items: { type: 'object', properties: { chapter_id: { type: 'string' }, severity: { type: 'string', enum: ['high', 'medium', 'low'] }, issue_type: { type: 'string', enum: ['duration', 'truncation', 'localization', 'structure', 'activity', 'terminology', 'media', 'other'] }, evidence: { type: 'string' }, recommended_fix: { type: 'string' } }, required: ['chapter_id', 'severity', 'issue_type', 'evidence', 'recommended_fix'], additionalProperties: false } } }, required: ['findings'], additionalProperties: false } } },
  }),
});
if (!response.ok) throw new Error(`Claude audit failed: ${response.status}`);
const content = (await response.json()).choices?.[0]?.message?.content;
await writeFile(outputPath, `${JSON.stringify(JSON.parse(content), null, 2)}\n`);
