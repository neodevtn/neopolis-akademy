import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const course = JSON.parse(fs.readFileSync(path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__02.json'), 'utf8'));
const outputPath = path.join(root, 'docs/anthropic-developer-course2-claude-patches.json');
const lesson = course.lessons[0];
const ids = ['chapter_01', 'chapter_03', 'chapter_05', 'chapter_07', 'chapter_09', 'chapter_11', 'chapter_13', 'chapter_15'];
const excerpts = ids.map((id) => {
  const chapter = lesson.chapters.find((item) => item.id === id);
  const body = chapter.blocks.find((block) => block.type === 'content')?.body || {};
  return {
    id,
    title: chapter.title,
    beginning_fr: String(body.fr || '').slice(0, 4500),
    ending_fr: String(body.fr || '').slice(-3500),
  };
});

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 11000,
    messages: [
      { role: 'system', content: 'Tu es réviseur bilingue d’un cours technique Anthropic. Produis seulement le JSON conforme au schéma. Ne crée aucune notion, ne modifie aucun extrait de code ni identifiant, et préserve les noms produits Anthropic : Claude, Claude Code, Skills, Projects, Code Execution et MCP.' },
      { role: 'user', content: `Pour les extraits français suivants, donne des substitutions courtes et exactes pour les reliquats anglais génériques, les anglicismes grammaticaux et les titres concaténés démontrés. Ne fournis une substitution que si la chaîne source exacte est dans les extraits. Priorités : system prompt -> prompt système, output constraint -> contrainte de sortie, quelques pseudo-tableaux ou titres concaténés ; conserve les phrases de code et les valeurs de paramètres. Fournis en plus un contenu bilingue très bref pour remplacer les huit vidéos sans provenance de l’écran Tutoriels pratiques : il doit indiquer qu’aucune vidéo sans provenance n’est proposée et orienter vers les checkpoints et la documentation officielle, sans inventer de source.\n\nEXTRAITS :\n${JSON.stringify(excerpts)}` },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'developer_course2_patches', strict: true,
        schema: {
          type: 'object',
          properties: {
            replacements: {
              type: 'array',
              items: {
                type: 'object',
                properties: { chapterId: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' } },
                required: ['chapterId', 'from', 'to'], additionalProperties: false,
              },
            },
            unsourced_videos_replacement: {
              type: 'object',
              properties: { title_en: { type: 'string' }, title_fr: { type: 'string' }, body_en: { type: 'string' }, body_fr: { type: 'string' } },
              required: ['title_en', 'title_fr', 'body_en', 'body_fr'], additionalProperties: false,
            },
          },
          required: ['replacements', 'unsourced_videos_replacement'], additionalProperties: false,
        },
      },
    },
  }),
});

if (!response.ok) throw new Error(`Claude patch request failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const content = payload.choices?.[0]?.message?.content;
if (!content) throw new Error('Claude returned no patch JSON.');
const result = JSON.parse(content);
for (const patch of result.replacements) {
  const chapter = lesson.chapters.find((item) => item.id === patch.chapterId);
  const text = chapter?.blocks.find((block) => block.type === 'content')?.body?.fr || '';
  const title = chapter?.title?.fr || '';
  if (!text.includes(patch.from) && !title.includes(patch.from)) {
    console.warn(`Patch source to review for ${patch.chapterId}: ${patch.from}`);
  }
}
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Claude Sonnet patches written to ${outputPath}`);
