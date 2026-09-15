import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sourcePath = resolve(root, 'client/public/data/courses/claude_certified_associate_foundations__08.json');
const outputPath = resolve(root, 'docs/anthropic-associate-course8-claude-audit.json');
const course = JSON.parse(await readFile(sourcePath, 'utf8'));

const schema = {
  type: 'object',
  properties: {
    course_id: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          location: { type: 'string' },
          issue: { type: 'string' },
          evidence: { type: 'string' },
          action: { type: 'string', enum: ['restore_complete_text', 'localize', 'remove_root_exercise', 'standardize_heading', 'remove_generic_media_fallback', 'preserve'] },
          source_confirmation_needed: { type: 'boolean' },
        },
        required: ['severity', 'location', 'issue', 'evidence', 'action', 'source_confirmation_needed'],
        additionalProperties: false,
      },
    },
    preserve: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['course_id', 'findings', 'preserve', 'summary'],
  additionalProperties: false,
};

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    messages: [
      {
        role: 'system',
        content: 'Tu es un auditeur pédagogique rigoureux. Analyse uniquement les données reçues. Ne crée pas de nouveau contenu pédagogique et ne propose jamais de composant personnalisé. Les noms produits Anthropic (Claude, Projects, Skills, Memory, Code Execution, MCP) doivent être préservés. Réponds uniquement au schéma JSON demandé.',
      },
      {
        role: 'user',
        content: `Audite le cours JSON suivant. Référence officielle du cours : 8 minutes, synthèse courte, bilan par domaine et test de readiness sans gonfler artificiellement le cours. Identifie seulement les défauts clairement démontrables : texte tronqué, reliquat de langue, titres/sections répétés ou fragmentés, exercice racine hors chapitre, durée ambiguë, médias génériques hors source. Signale ce qu'il faut préserver, notamment les blocs standards et les activités intégrées.\n\n${JSON.stringify(course)}`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'associate_course_8_audit', strict: true, schema },
    },
  }),
});

if (!response.ok) throw new Error(`Échec de l’audit Claude : HTTP ${response.status}`);
const payload = await response.json();
const content = payload.choices?.[0]?.message?.content;
if (typeof content !== 'string') throw new Error('Réponse Claude sans contenu JSON.');
await writeFile(outputPath, `${JSON.stringify(JSON.parse(content), null, 2)}\n`, 'utf8');
console.log(outputPath);
