import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_associate_foundations__06.json');
const outputPath = path.join(root, 'docs/anthropic-associate-course6-claude-structured-sections.json');
const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const chapters = course.lessons[0].chapters;
const bodyFor = (id) => chapters.find((chapter) => chapter.id === id)?.blocks.find((block) => block.type === 'content')?.body?.fr;
const skills = bodyFor('chapter_02');
const data = bodyFor('chapter_03');

if (!skills || !data) throw new Error('Associate 6 Skills or Data content is missing.');

const prompt = `Restructurez deux contenus Markdown français sans ajouter, supprimer ou modifier les notions pédagogiques. Objectif : éliminer les intertitres répétés ou fragmentés créés par les paires question-réponse. Pour Skills, conserver toutes les sections mais rendre Source, Portée et Pertinence lisibles dans une structure unique. Pour Données, conserver toutes les sections mais rendre les quatre contrôles de fonctionnalité (Code Execution, Memory, Incognito et contrôles organisationnels Memory) lisibles sans titres « Contrôle » répétés. Préservez exactement les noms produits Anthropic : Skills, Claude, Code Execution, Memory, Incognito, Projects, Team, Enterprise, Owners et Primary Owners. Conservez titres, paragraphes, avertissements et exemples. Retournez exactement un objet JSON avec skills_body_fr et data_body_fr.

CONTENU SKILLS :
${skills}

CONTENU DONNÉES :
${data}`;

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    messages: [
      { role: 'system', content: 'Vous êtes un éditeur pédagogique précis. Répondez uniquement avec un objet JSON.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 8000,
    thinking: { type: 'enabled', budget_tokens: 2048 },
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'associate6_structured_sections',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            skills_body_fr: { type: 'string' },
            data_body_fr: { type: 'string' },
          },
          required: ['skills_body_fr', 'data_body_fr'],
          additionalProperties: false,
        },
      },
    },
  }),
});

if (!response.ok) throw new Error(`Claude request failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const content = payload.choices?.[0]?.message?.content;
const structured = typeof content === 'string' ? JSON.parse(content) : content;
if (!structured?.skills_body_fr || !structured?.data_body_fr) throw new Error('Claude returned an incomplete structure patch.');
fs.writeFileSync(outputPath, `${JSON.stringify(structured, null, 2)}\n`);
console.log('Associate 6 structured sections generated with Claude Sonnet.');
