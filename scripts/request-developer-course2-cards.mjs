import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const course = JSON.parse(fs.readFileSync(path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__02.json'), 'utf8'));
const outputPath = path.join(root, 'docs/anthropic-developer-course2-claude-cards.json');
const candidates = course.lessons[0].chapters.flatMap((chapter) => chapter.blocks
  .filter((block) => block.type === 'flip_cards')
  .flatMap((block) => block.cards || [])
  .filter((card) => {
    const back = String(card.back?.fr || '').trim();
    return back.length > 120 && !/[.!?…»)]$/.test(back);
  })
  .map((card) => ({ chapterId: chapter.id, front_en: card.front?.en || '', front_fr: card.front?.fr || '', back_en: card.back?.en || '', back_fr: card.back?.fr || '' })));

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST', headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6', max_tokens: 12000,
    messages: [
      { role: 'system', content: 'Tu es réviseur technique bilingue. Tu complètes des revers de cartes manifestement tronqués en t’appuyant strictement sur les textes fournis. N’ajoute pas de notions externes, ne modifie pas les noms produits Anthropic (Claude, Claude Code, Skills, Projects, Code Execution, MCP) et renvoie seulement le JSON demandé.' },
      { role: 'user', content: `Complète chaque revers de carte ci-dessous afin qu’il forme une phrase ou un paragraphe pédagogique complet. Conserve le sens et le début fourni ; une restitution concise vaut mieux qu’une invention. Si le texte n’est pas objectivement tronqué, reproduis-le avec seulement la ponctuation finale appropriée.\n\nCARTES :\n${JSON.stringify(candidates)}` },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'developer_course2_cards', strict: true, schema: { type: 'object', properties: { cards: { type: 'array', items: { type: 'object', properties: { chapterId: { type: 'string' }, front_en: { type: 'string' }, back_en: { type: 'string' }, back_fr: { type: 'string' } }, required: ['chapterId', 'front_en', 'back_en', 'back_fr'], additionalProperties: false } } }, required: ['cards'], additionalProperties: false } } },
  }),
});
if (!response.ok) throw new Error(`Claude card request failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const content = payload.choices?.[0]?.message?.content;
if (!content) throw new Error('Claude returned no card JSON.');
const result = JSON.parse(content);
const candidateKeys = new Set(candidates.map((card) => `${card.chapterId}:${card.front_en}`));
for (const card of result.cards) {
  if (!candidateKeys.has(`${card.chapterId}:${card.front_en}`)) throw new Error(`Unexpected card: ${card.chapterId}:${card.front_en}`);
}
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Claude Sonnet card restorations written to ${outputPath} for ${result.cards.length} cards.`);
