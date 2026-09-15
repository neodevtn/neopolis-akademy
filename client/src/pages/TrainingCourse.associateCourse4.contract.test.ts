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
    expect(redesign.completionRule.requires).toContain('requiredExercisesPassed');
    expect(delegation.blocks[0].body.fr).not.toContain('Human-retained');
    expect(delegation.blocks[0].body.fr).not.toContain('AI, un humain');
    expect(delegation.blocks[0].body.fr).not.toContain('reviewer');
    expect(delegation.blocks[0].body.fr).not.toContain('Délégation : pourquoi ?');
    expect(lesson.chapters.find((chapter: { id: string }) => chapter.id === 'chapter_09').blocks[0].body.fr).not.toContain('It\'s basically');
    expect(delegationSort.correction.fr).toContain('réversibles');
  });
});
