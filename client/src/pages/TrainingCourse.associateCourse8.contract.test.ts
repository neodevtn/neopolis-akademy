import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const course = JSON.parse(fs.readFileSync(path.join(root, 'client/public/data/courses/claude_certified_associate_foundations__08.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'client/src/data/trainingIndex.json'), 'utf8'));
const lesson = course.lessons[0];
const chapter = (id: string) => lesson.chapters.find((item: { id: string }) => item.id === id);
const content = (id: string, language: 'en' | 'fr') => chapter(id).blocks.find((item: { type: string }) => item.type === 'content').body[language] as string;
const cards = () => chapter('chapter_01').blocks.find((item: { type: string }) => item.type === 'flip_cards').cards;

describe('Associate Foundations course 8 contract', () => {
  it('keeps the official eight-minute duration and five-screen summary synchronized', () => {
    const entry = catalog.courses.find((item: { id: string }) => item.id === course.courseId);
    expect(course.sourceCourseTitle).toBe('Claude Certified Associate - Foundations / Course Summary & Next Steps');
    expect(lesson.title).toMatchObject({ en: 'Course Summary & Next Steps', fr: 'Résumé du cours et prochaines étapes' });
    expect(lesson.chapters).toHaveLength(5);
    expect(content('chapter_01_1', 'en')).toContain('**Official duration:** 8 minutes');
    expect(content('chapter_01_1', 'fr')).toContain('**Durée officielle :** 8 minutes');
    expect(content('chapter_01_1', 'fr')).not.toMatch(/Durée estimée|15[-–]25/);
    expect(entry).toMatchObject({ officialDurationMinutes: 8, chapterCount: 5, exerciseCount: 1, totalActivities: 1 });
  });

  it('keeps a concise localized synthesis without duplicated endings or generic video fallbacks', () => {
    expect(content('chapter_01', 'en')).not.toContain('Course Summary & Next Steps\nYou started this course');
    expect(content('chapter_01', 'fr')).toContain('## AI Fluency');
    expect(content('chapter_01', 'fr')).toContain('choisir le produit, le modèle et les fonctionnalités adaptés');
    expect(content('chapter_01', 'fr')).toContain('flux de travail');
    expect(content('chapter_01', 'fr')).not.toMatch(/Product & Model Selection|Output Evaluation|Workflow Integration/);
    expect(content('chapter_01', 'fr')).not.toContain('Module terminé · Parcours Associate');
    expect(chapter('chapter_01').title.fr).toBe('Module 8 · Résumé du cours et prochaines étapes · Associé');
    expect(chapter('chapter_02').title.fr).toBe('Exercice : Module 8 · Résumé du cours et prochaines étapes · Associé');
    expect(lesson.recommendedVideosManaged).toBe(false);
    expect(lesson.recommendedVideos).toBeUndefined();
    expect(content('chapter_05', 'en')).toContain('## Course complete');
    expect(content('chapter_05', 'fr')).toContain('## Parcours terminé');
  });

  it('restores complete cards and keeps one mandatory standard readiness checkpoint', () => {
    const exam = cards().find((item: { front: { en: string } }) => item.front.en === 'Preparing for the exam');
    const boundary = cards().find((item: { front: { en: string } }) => item.front.en === 'Knowing your boundary');
    const exercise = course.exercises[0];
    expect(exam.back.en).toContain('revisit its decision frameworks.');
    expect(exam.back.fr).toContain('reprenez ses cadres de décision.');
    expect(boundary.back.en).toContain('Associate-level skill.');
    expect(cards().find((item: { front: { en: string } }) => item.front.en === 'Workflow Integration').back.fr).toContain('flux de travail');
    expect(cards().find((item: { front: { en: string } }) => item.front.en === 'Workflow Integration').back.fr).toContain('Délégation');
    expect(cards().find((item: { front: { en: string } }) => item.front.en === 'Configuration').back.fr).toContain('Projects');
    expect(course.exercises).toHaveLength(1);
    expect(exercise).toMatchObject({ chapterId: 'chapter_02', interactionType: 'single_choice', completionRequiresCorrectAnswer: true, required: true });
    expect(exercise.options).toHaveLength(4);
    expect(exercise.options.filter((item: { correct: boolean }) => item.correct)).toHaveLength(1);
    expect(chapter('chapter_02').completionRule).toEqual({ requires: ['contentViewed', 'requiredExercisesPassed'] });
  });
});
