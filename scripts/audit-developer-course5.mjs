import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const course = await readFile(join(root, 'client/public/data/courses/claude_certified_developer_foundations__05.json'), 'utf8');
const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6', max_tokens: 3600, thinking: { type: 'enabled', budget_tokens: 1400 },
    messages: [
      { role: 'system', content: 'Tu audites uniquement ce JSON pédagogique Anthropic. Ne génère pas de contenu et ne renomme jamais les produits Anthropic. Remonte exclusivement les défauts 80/20 démontrables : texte tronqué, mélange FR/EN visible, tableau Markdown concaténé, checkpoint qui vise un exercice absent ou d’un autre écran, exercice racine invisible, média générique sans provenance et durée manifestement contradictoire. Ignore les améliorations stylistiques mineures.' },
      { role: 'user', content: course },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'developer_course5_audit', strict: true, schema: { type: 'object', properties: { findings: { type: 'array', maxItems: 12, items: { type: 'object', properties: { chapter_id: { type: 'string' }, severity: { type: 'string', enum: ['high', 'medium', 'low'] }, issue_type: { type: 'string', enum: ['duration', 'truncation', 'localization', 'structure', 'activity', 'terminology', 'media', 'other'] }, evidence: { type: 'string' }, recommended_fix: { type: 'string' } }, required: ['chapter_id', 'severity', 'issue_type', 'evidence', 'recommended_fix'], additionalProperties: false } } }, required: ['findings'], additionalProperties: false } } },
  }),
});
if (!response.ok) throw new Error(`Claude audit failed: ${response.status}`);
const content = (await response.json()).choices?.[0]?.message?.content;
await writeFile(join(root, 'docs/anthropic-developer-course5-claude-audit.json'), `${JSON.stringify(JSON.parse(content), null, 2)}\n`);
