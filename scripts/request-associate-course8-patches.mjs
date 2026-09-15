import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const coursePath = resolve(root, 'client/public/data/courses/claude_certified_associate_foundations__08.json');
const outputPath = resolve(root, 'docs/anthropic-associate-course8-claude-patches.json');
const course = JSON.parse(await readFile(coursePath, 'utf8'));
const lesson = course.lessons[0];
const chapter = (id) => lesson.chapters.find((item) => item.id === id);
const content = (id) => chapter(id).blocks.find((item) => item.type === 'content').body;
const cards = chapter('chapter_01').blocks.find((item) => item.type === 'flip_cards').cards;

const schema = {
  type: 'object',
  properties: {
    intro_en: { type: 'string' },
    intro_fr: { type: 'string' },
    summary_body_en: { type: 'string' },
    summary_body_fr: { type: 'string' },
    exercise_intro_en: { type: 'string' },
    exercise_intro_fr: { type: 'string' },
    card_exam_en: { type: 'string' },
    card_exam_fr: { type: 'string' },
    card_boundary_en: { type: 'string' },
    completion_en: { type: 'string' },
    completion_fr: { type: 'string' },
    key_takeaways_en: { type: 'string' },
    key_takeaways_fr: { type: 'string' },
  },
  required: ['intro_en', 'intro_fr', 'summary_body_en', 'summary_body_fr', 'exercise_intro_en', 'exercise_intro_fr', 'card_exam_en', 'card_exam_fr', 'card_boundary_en', 'completion_en', 'completion_fr', 'key_takeaways_en', 'key_takeaways_fr'],
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
    max_tokens: 7000,
    messages: [
      {
        role: 'system',
        content: 'Tu es un éditeur pédagogique précis. Réécris uniquement à partir des notions présentes dans la source fournie. N’ajoute aucun fait, lien, examen, conseil, média ou mécanique qui n’est pas déjà attesté. Conserve sans traduction les noms de produits Anthropic : Claude, Projects, Skills, Memory, Code Execution, MCP, Claude Developer, Claude Architect. Produis des contenus Markdown courts, cohérents et prêts à être affichés par les blocs standards Neopolis. Réponds uniquement avec le JSON du schéma imposé.',
      },
      {
        role: 'user',
        content: `Le cours « Course Summary & Next Steps » doit durer officiellement 8 minutes et rester une synthèse courte. À partir des extraits source ci-dessous :\n1) élimine les titres et introductions dupliqués ;\n2) localise les termes génériques en français sans traduire les noms produits ;\n3) restaure précisément les cartes tronquées ;\n4) complète les blocs de fin anglais et français sans emoji, en mentionnant la fin du parcours et la préparation à l’examen, non un module suivant ;\n5) réécris l’introduction pour annoncer seulement la synthèse, les cartes de révision et le checkpoint effectivement présents, sans annoncer de quiz ou de contenu supplémentaire ;\n6) produis les points clés EN et FR comme bilan des sept domaines, sans noms de chapitres bruts ;\n7) garde un checkpoint intégré et ne crée aucune activité nouvelle ;\n8) ne mentionne ni Pearson, ni de spécification à vérifier, ni ressources externes dans les contenus réécrits.\n\nIntroduction EN:\n${content('chapter_01_1').en}\n\nIntroduction FR:\n${content('chapter_01_1').fr}\n\nContenu synthèse EN:\n${content('chapter_01').en}\n\nContenu synthèse FR:\n${content('chapter_01').fr}\n\nIntroduction exercice EN:\n${content('chapter_02').en}\n\nIntroduction exercice FR:\n${content('chapter_02').fr}\n\nCarte examen EN/FR:\n${JSON.stringify(cards.find((card) => card.front.en === 'Preparing for the exam').back)}\n\nCarte frontière EN/FR:\n${JSON.stringify(cards.find((card) => card.front.en === 'Knowing your boundary').back)}\n\nFin FR:\n${content('chapter_05').fr}\n\nPoints clés FR:\n${content('chapter_04').fr}`,
      },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'associate_course_8_patches', strict: true, schema } },
  }),
});

if (!response.ok) throw new Error(`Échec des correctifs Claude : HTTP ${response.status}`);
const payload = await response.json();
const output = payload.choices?.[0]?.message?.content;
if (typeof output !== 'string') throw new Error('Réponse Claude sans contenu JSON.');
await writeFile(outputPath, `${JSON.stringify(JSON.parse(output), null, 2)}\n`, 'utf8');
console.log(outputPath);
