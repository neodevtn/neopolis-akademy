import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const course = JSON.parse(fs.readFileSync(path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__02.json'), 'utf8'));
const outputPath = path.join(root, 'docs/anthropic-developer-course2-claude-prompting-structure.json');
const chapter = course.lessons[0].chapters.find((item) => item.id === 'chapter_01');
const body = chapter.blocks.find((block) => block.type === 'content').body.fr;
const firstStart = body.indexOf('Ce que vous avez observé');
const firstEnd = body.indexOf('Diagnostiquer un prompt de classification');
const secondStart = body.indexOf('Stack all four techniques');
const secondEnd = body.indexOf('Quand utiliser chaque technique');
const thirdStart = body.indexOf('System Prompts');
const thirdEnd = body.indexOf('La boucle d’itération');
const existing = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, 'utf8')) : {};
if ([thirdStart, thirdEnd].some((index) => index < 0) || thirdEnd <= thirdStart) throw new Error('Third Prompting Craft section is missing.');
const first = firstStart >= 0 && firstEnd > firstStart ? body.slice(firstStart, firstEnd).trim() : existing.first_section_fr;
const second = secondStart >= 0 && secondEnd > secondStart ? body.slice(secondStart, secondEnd).trim() : existing.second_section_fr;
const third = body.slice(thirdStart, thirdEnd).trim();
if (!first || !second) throw new Error('Prior Prompting Craft sections are unavailable.');

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST', headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6', max_tokens: 5500,
    messages: [
      { role: 'system', content: 'Tu es un éditeur pédagogique technique francophone. Convertis deux pseudo-tableaux en Markdown lisible. Ne rajoute aucune notion et conserve Claude, XML, JSON, les identifiants techniques et les exemples de code. Localise les termes génériques de manière cohérente : prompt système, contrainte de sortie, exemples few-shot.' },
      { role: 'user', content: `Réécris exactement les trois extraits français suivants sous forme de sections Markdown concises et lisibles. Pour le premier, utilise une sous-section par symptôme et trois puces : observation, élément manquant, raison. Pour le second, utilise une liste avec un intitulé en gras et une phrase. Pour le troisième, utilise quatre sous-sections : Prompt système, Balises XML, Exemples few-shot, Contraintes de sortie. Conserve toutes les notions, sans ajouter de nouveau conseil. Localise les termes génériques : prompt système, contrainte de sortie, exemples few-shot, sortie structurée.\n\nEXTRAIT 1:\n${first}\n\nEXTRAIT 2:\n${second}\n\nEXTRAIT 3:\n${third}` },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'prompting_structure', strict: true, schema: { type: 'object', properties: { first_section_fr: { type: 'string' }, second_section_fr: { type: 'string' }, third_section_fr: { type: 'string' } }, required: ['first_section_fr', 'second_section_fr', 'third_section_fr'], additionalProperties: false } } },
  }),
});
if (!response.ok) throw new Error(`Claude structure request failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const content = payload.choices?.[0]?.message?.content;
if (!content) throw new Error('Claude returned no structure JSON.');
const result = JSON.parse(content);
if (![result.first_section_fr, result.second_section_fr, result.third_section_fr].every((section) => typeof section === 'string' && section.trim().length > 80)) throw new Error('Claude structure did not satisfy minimum content guards.');
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Claude Sonnet prompting structure written to ${outputPath}`);
