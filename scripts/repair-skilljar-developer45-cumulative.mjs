import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const proposalPath = path.join(root, 'docs/skilljar-developer45-cumulative-patches.json');
if (!fs.existsSync(proposalPath)) throw new Error(`Propositions Claude Sonnet manquantes : ${proposalPath}`);

const source = JSON.parse(fs.readFileSync(proposalPath, 'utf8'));
const expected = {
  claude_certified_developer_foundations__04: {
    sourceScreens: ['S17', 'S18'],
    insertionBefore: 'chapter_08',
    answerThreshold: 40,
  },
  claude_certified_developer_foundations__05: {
    sourceScreens: ['S17', 'S18'],
    insertionBefore: 'chapter_10_1',
    answerThreshold: 10,
  },
};

function asMarkdown(value) {
  return String(value || '').trim();
}

function createChapter(proposal) {
  const courseCode = proposal.courseId.endsWith('__04') ? '04' : '05';
  const screenCode = proposal.sourceScreenId.toLowerCase();
  const title = proposal.title;
  const body = {
    en: `## ${title.en}\n\n${asMarkdown(proposal.intro.en)}\n\n### Source application\n\n\`\`\`python\n${asMarkdown(proposal.referenceCode.en)}\n\`\`\``,
    fr: `## ${title.fr}\n\n${asMarkdown(proposal.intro.fr)}\n\n### Application source\n\n\`\`\`python\n${asMarkdown(proposal.referenceCode.fr)}\n\`\`\``,
  };

  return {
    id: `chapter_skilljar_${courseCode}_${screenCode}`,
    sourceScreenId: proposal.sourceScreenId,
    sourceProvenance: 'Skilljar authenticated Developer Foundations, 2026-09-16',
    title,
    type: 'exercise',
    durationMinutes: proposal.durationMinutes,
    blocks: [
      { type: 'content', body },
      {
        type: 'cloud_exercise',
        id: proposal.id,
        title,
        assignment: proposal.assignment,
        instructions: proposal.instructions,
        steps: proposal.steps.map((step) => ({ instruction_text: step })),
        hint: proposal.hint,
        solution: proposal.solution,
        successMessage: proposal.successMessage,
        minimumAnswerLength: proposal.minimumAnswerLength,
        sourceScreenId: proposal.sourceScreenId,
        sourceEvidence: proposal.sourceEvidence,
      },
    ],
    completionRule: { requires: ['cloudExerciseCompleted'] },
  };
}

function validateProposal(proposal) {
  const rule = expected[proposal.courseId];
  if (!rule) throw new Error(`Cours hors périmètre : ${proposal.courseId}`);
  if (!rule.sourceScreens.includes(proposal.sourceScreenId)) throw new Error(`Écran source non attendu : ${proposal.courseId}/${proposal.sourceScreenId}`);
  if (proposal.minimumAnswerLength !== rule.answerThreshold) {
    throw new Error(`Seuil Skilljar incorrect pour ${proposal.courseId}/${proposal.sourceScreenId} : ${proposal.minimumAnswerLength}`);
  }
  if (!proposal.solution?.en || !proposal.solution?.fr) throw new Error(`Correction source absente : ${proposal.courseId}/${proposal.sourceScreenId}`);
  if (!proposal.referenceCode?.en || !proposal.referenceCode?.fr) throw new Error(`Code source absent : ${proposal.courseId}/${proposal.sourceScreenId}`);
}

const grouped = new Map(Object.keys(expected).map((courseId) => [courseId, []]));
for (const proposal of source.proposals || []) {
  validateProposal(proposal);
  grouped.get(proposal.courseId).push(proposal);
}

for (const [courseId, rule] of Object.entries(expected)) {
  const proposals = grouped.get(courseId) || [];
  const actualScreens = proposals.map((proposal) => proposal.sourceScreenId).sort();
  const expectedScreens = [...rule.sourceScreens].sort();
  if (JSON.stringify(actualScreens) !== JSON.stringify(expectedScreens)) {
    throw new Error(`Propositions incomplètes pour ${courseId} : ${actualScreens.join(', ')}`);
  }

  const coursePath = path.join(root, `client/public/data/courses/${courseId}.json`);
  const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
  const lesson = course.lessons?.[0];
  if (!lesson?.chapters) throw new Error(`Leçon introuvable : ${courseId}`);

  const nonCumulativeChapters = lesson.chapters.filter((chapter) => !String(chapter.id || '').startsWith(`chapter_skilljar_${courseId.endsWith('__04') ? '04' : '05'}_s`));
  const insertionIndex = nonCumulativeChapters.findIndex((chapter) => chapter.id === rule.insertionBefore);
  if (insertionIndex < 0) throw new Error(`Point d’insertion introuvable : ${courseId}/${rule.insertionBefore}`);

  const additions = proposals
    .sort((left, right) => left.sourceScreenId.localeCompare(right.sourceScreenId, undefined, { numeric: true }))
    .map(createChapter);
  nonCumulativeChapters.splice(insertionIndex, 0, ...additions);
  lesson.chapters = nonCumulativeChapters;
  fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
  console.log(`${courseId}: ${additions.length} tâches cumulatives Skilljar appliquées.`);
}
