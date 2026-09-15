import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const course = JSON.parse(
  fs.readFileSync(
    path.join(root, 'client/public/data/courses/claude_certified_associate_foundations__04.json'),
    'utf8',
  ),
);
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'client/src/data/trainingIndex.json'), 'utf8'));
const lesson = course.lessons[0];

describe('Associate Foundations course 4 contract', () => {
  it('preserves the 10-screen workflow sequence and the official duration', () => {
    const catalogCourse = catalog.courses.find((item: { id: string }) => item.id === course.courseId);
    expect(lesson.chapters).toHaveLength(10);
    expect(catalogCourse.officialDurationMinutes).toBe(63);
    expect(catalogCourse.title).toEqual({
      en: 'Workflow Integration & Solution Design',
      fr: 'Intégration des flux de travail et conception de solutions',
    });
    expect(lesson.chapters[0].blocks[0].body.fr).toContain('Durée officielle :** 63 minutes');
  });

  it('uses only the in-screen workflow activities and keeps human/model decisions interactive', () => {
    const delegation = lesson.chapters.find((chapter: { id: string }) => chapter.id === 'chapter_08');
    const redesign = lesson.chapters.find((chapter: { id: string }) => chapter.id === 'chapter_10');
    const delegationSort = delegation.blocks.find((block: { id: string }) => block.id === 'bucket_delegation_mapping');
    const redesignSort = redesign.blocks.find((block: { id: string }) => block.id === 'reconcevoir_flux_de_travail_delegation');

    expect(course.exercises).toEqual([]);
    expect(delegationSort.cards).toHaveLength(6);
    expect(delegationSort.buckets.map((bucket: { label: { fr: string } }) => bucket.label.fr)).toEqual([
      'Adaptée à l’IA',
      'Collaboration IA–humain',
      'Revue humaine requise',
      'Réservée à l’humain',
    ]);
    expect(redesignSort.cards).toHaveLength(5);
    expect(redesignSort.correction.fr).toContain('déterministe et réversible');
    expect(redesignSort.correction.fr).toContain('une personne confirme la décision');
    const researchCards = lesson.chapters.find((chapter: { id: string }) => chapter.id === 'chapter_06').blocks
      .find((block: { type: string }) => block.type === 'flip_cards').cards;
    const researchSynthesis = researchCards.find((card: { front: { en: string } }) => card.front.en === 'Research and synthesis');
    expect(researchSynthesis.back.fr).toContain('recherche web dans le chat');
    expect(researchSynthesis.back.fr).not.toContain('web search in chat');
    const solutionDesign = lesson.chapters.find((chapter: { id: string }) => chapter.id === 'chapter_07');
    expect(solutionDesign.blocks[0].body.fr).toContain('partenaire de conception');
    expect(solutionDesign.blocks[0].body.fr).not.toContain('partenaire de design');
    expect(solutionDesign.blocks[0].body.fr).not.toContain("le build n'est plus");
    expect(solutionDesign.blocks[0].body.fr).not.toContain('prompt-and-iterate');
    const requirements = lesson.chapters.find((chapter: { id: string }) => chapter.id === 'chapter_05');
    expect(requirements.blocks[0].body.fr).toContain('À partir du RFP joint et du fil d’e-mails');
    expect(requirements.blocks[0].body.fr).not.toContain('From the attached RFP');
    const moduleQuiz = lesson.chapters.find((chapter: { id: string }) => chapter.id === 'chapter_11');
    expect(moduleQuiz.title.fr).toBe('Module 4');
    expect(moduleQuiz.blocks[0].body.fr).toContain('Quiz du module 4 : Intégration des flux de travail et conception de solutions');
    expect(moduleQuiz.title.fr).not.toContain('workflow');
    const frenchStrings: string[] = [];
    const collectFrenchStrings = (value: unknown) => {
      if (Array.isArray(value)) {
        value.forEach(collectFrenchStrings);
      } else if (value && typeof value === 'object') {
        for (const [key, nestedValue] of Object.entries(value)) {
          if (key === 'fr' && typeof nestedValue === 'string') frenchStrings.push(nestedValue);
          else collectFrenchStrings(nestedValue);
        }
      }
    };
    collectFrenchStrings(course);
    expect(frenchStrings.join('\n')).not.toMatch(/\bworkflow\b/i);
    expect(redesign.completionRule.requires).toContain('requiredExercisesPassed');
    expect(delegation.blocks[0].body.fr).not.toContain('Human-retained');
    expect(delegation.blocks[0].body.fr).not.toContain('AI, un humain');
    expect(delegation.blocks[0].body.fr).not.toContain('reviewer');
    expect(delegation.blocks[0].body.fr).not.toContain('Délégation : pourquoi ?');
    expect(lesson.chapters.find((chapter: { id: string }) => chapter.id === 'chapter_09').blocks[0].body.fr).not.toContain('It\'s basically');
    expect(delegationSort.correction.fr).toContain('réversibles');
  });

  it('keeps the stakeholder communication cards complete and pedagogically coherent in French and English', () => {
    const value = lesson.chapters.find((chapter: { id: string }) => chapter.id === 'chapter_09');
    const cards = value.blocks.find((block: { type: string }) => block.type === 'flip_cards').cards;
    const calibrated = cards.find((card: { front: { en: string } }) => card.front.en === 'Calibrate to the audience');
    const comparison = cards.find((card: { front: { en: string } }) => card.front.en === 'Overstated vs. Accurate');
    const overstatement = cards.find((card: { front: { en: string } }) => card.front.en === 'Phrases that quietly overstate');

    expect(calibrated.back.en).toContain('directed at stakeholders rather than at Claude.');
    expect(calibrated.back.fr).toContain('destinée aux parties prenantes plutôt qu’à Claude.');
    expect(calibrated.back.fr).not.toMatch(/Ceci est t$/);
    expect(comparison.back.en).toContain('This states value and limits in one breath.');
    expect(comparison.back.fr).toContain('la valeur et les limites en une seule phrase.');
    expect(overstatement.back.en).toContain('then identify the human checkpoint.');
    expect(overstatement.back.fr).toContain('puis identifiez le point de contrôle humain.');
    expect(overstatement.back.fr).not.toContain('"«');
  });
});
