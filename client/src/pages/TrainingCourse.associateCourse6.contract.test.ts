import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const course = JSON.parse(fs.readFileSync(path.join(root, 'client/public/data/courses/claude_certified_associate_foundations__06.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'client/src/data/trainingIndex.json'), 'utf8'));
const lesson = course.lessons[0];
const chapter = (id: string) => lesson.chapters.find((item: { id: string }) => item.id === id);
const content = (id: string) => chapter(id).blocks.find((item: { type: string }) => item.type === 'content').body.fr as string;
const cards = (id: string) => chapter(id).blocks.find((item: { type: string }) => item.type === 'flip_cards').cards;

describe('Associate Foundations course 6 contract', () => {
  it('preserves the nine-screen governance sequence and official duration', () => {
    expect(lesson.chapters).toHaveLength(9);
    expect(lesson.title).toEqual({ en: 'Governance, Risk & Responsible Use', fr: 'Gouvernance, risques et utilisation responsable' });
    expect(lesson.recommendedVideosManaged).toBe(false);
    expect(content('chapter_01_1')).toContain('**Durée officielle :** 55 minutes');
    expect(content('chapter_01_1')).toContain('Confiance dans les Skills et risques liés aux fonctionnalités');
    expect(catalog.courses.find((item: { id: string }) => item.id === course.courseId)).toMatchObject({ officialDurationMinutes: 55, chapterCount: 9, exerciseCount: 6 });
  });

  it('keeps only the standard required governance activities in their chapters', () => {
    expect(course.exercises).toEqual([]);
    expect(lesson.recommendedVideos).toBeUndefined();
    expect(lesson.recommendedVideosManaged).toBe(false);
    expect(chapter('chapter_01').completionRule).toEqual({ requires: ['contentViewed', 'requiredExercisesPassed'] });
    expect(chapter('chapter_06').completionRule).toEqual({ requires: ['contentViewed', 'requiredExercisesPassed'] });
    expect(chapter('chapter_01').blocks.find((item: { type: string }) => item.type === 'bucket_sort').cards).toHaveLength(6);
    expect(chapter('chapter_06').blocks.filter((item: { type: string }) => item.type === 'single_choice_exercise')).toHaveLength(5);
  });

  it('restores French governance content, complete cards and Anthropic product names', () => {
    expect(chapter('chapter_06').title.fr).toBe('Quiz du module 6');
    expect(chapter('chapter_02').title.fr).toBe('Confiance dans les Skills et risques liés aux fonctionnalités');
    expect(content('chapter_03')).toContain('Vert : utilisation autorisée');
    expect(content('chapter_03')).toContain('Connaissance des différents points d’entrée, en termes simples.');
    expect(content('chapter_03')).toContain('Caviardez ou anonymisez les identifiants avant le téléversement.');
    expect(content('chapter_03')).toContain('Caviarder les noms, les numéros de compte ou les identifiants avant le téléversement');
    expect(content('chapter_03')).not.toContain('Rédiger les noms, les numéros de compte');
    expect(content('chapter_01')).toContain('### Critères de délégation pour le dépistage');
    expect(content('chapter_01')).toContain('**Réversibilité** — Demandez si une sortie erronée peut être détectée');
    expect(content('chapter_01')).not.toContain('#### Critère\n\nLa question à poser');
    const skillsCards = course.lessons[0].chapters.find((chapter) => chapter.id === 'chapter_02')?.blocks.find((block) => block.type === 'flip_cards')?.cards ?? [];
    expect(skillsCards.map((card) => card.front.fr)).toContain('Confiance dans les Skills et risque au niveau des fonctionnalités');
    expect(skillsCards.map((card) => card.front.fr)).toContain('Deux Skills, deux décisions');
    expect(content('chapter_05')).not.toContain('AI-assisted');
    expect(content('chapter_04')).not.toContain('drift');
    expect(cards('chapter_02').find((item: { front: { en: string } }) => item.front.en === 'Internal does not mean vetted').back.fr).toContain('politique actuelle');
    expect(cards('chapter_03').find((item: { front: { en: string } }) => item.front.en === 'Classify before you upload').back.fr).not.toContain('...');
    expect(cards('chapter_04').find((item: { front: { en: string } }) => item.front.en === 'Audit usage against policy').back.fr).toContain('lacune de diligence');
    expect(cards('chapter_05').find((item: { front: { en: string } }) => item.front.en === 'Performance-review summaries').back.fr).toContain('responsable vérifie que chaque résumé reflète les notes réelles');
  });
});
