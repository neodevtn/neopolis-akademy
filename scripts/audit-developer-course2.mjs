import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__02.json');
const outputPath = path.join(root, 'docs/anthropic-developer-course2-claude-audit.json');
const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));

const compactCourse = {
  courseId: course.courseId,
  sourceCourseTitle: course.sourceCourseTitle,
  lessons: course.lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    officialDurationMinutes: lesson.officialDurationMinutes,
    recommendedVideosManaged: lesson.recommendedVideosManaged,
    recommendedVideos: lesson.recommendedVideos || [],
    chapters: lesson.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      type: chapter.type,
      durationMinutes: chapter.durationMinutes,
      blocks: chapter.blocks.map((block) => ({
        type: block.type,
        body: block.body,
        cards: block.cards,
        items: block.items,
        question: block.question,
      })),
    })),
  })),
  exercises: course.exercises || [],
};

const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [
      {
        role: 'system',
        content: 'Tu es un auditeur pédagogique rigoureux. Analyse uniquement les données fournies. Ne produis pas de composants, ne crée pas de contenu inventé et ne transforme pas les noms produits Anthropic (Claude, Claude Code, Skills, Projects, Code Execution, MCP). Réponds seulement avec un JSON conforme au schéma demandé.',
      },
      {
        role: 'user',
        content: `Audite le cours Neopolis suivant au regard de ces exigences : durée officielle 209 min, 12 écrans, 8 activités interactives attendues, parcours Developer Foundations. Le contenu français doit être complet, grammatical, et localiser les termes génériques sans traduire les noms produits. Les ressources vidéo sans provenance explicite doivent être signalées. Les exercices racine hors chapitre sont à signaler, mais ne les supprime pas dans l’analyse. Repère les titres ou pseudo-tableaux qui rendraient le cours difficile à lire avec le renderer Markdown standard. Distingue clairement les défauts démontrés des éléments qui doivent être préservés.\n\nCOURS :\n${JSON.stringify(compactCourse)}`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'developer_course2_audit',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            confirmed_findings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  chapter_id: { type: 'string' },
                  category: { type: 'string' },
                  severity: { type: 'string' },
                  evidence: { type: 'string' },
                  correction_scope: { type: 'string' },
                },
                required: ['chapter_id', 'category', 'severity', 'evidence', 'correction_scope'],
                additionalProperties: false,
              },
            },
            preserve: { type: 'array', items: { type: 'string' } },
            activity_assessment: { type: 'string' },
            media_assessment: { type: 'string' },
          },
          required: ['summary', 'confirmed_findings', 'preserve', 'activity_assessment', 'media_assessment'],
          additionalProperties: false,
        },
      },
    },
  }),
});

if (!response.ok) throw new Error(`Claude audit failed: ${response.status} ${await response.text()}`);
const result = await response.json();
const content = result.choices?.[0]?.message?.content;
if (!content) throw new Error('Claude audit returned no content.');
const audit = JSON.parse(content);
fs.writeFileSync(outputPath, `${JSON.stringify(audit, null, 2)}\n`);
console.log(`Claude Sonnet audit written to ${outputPath}`);
