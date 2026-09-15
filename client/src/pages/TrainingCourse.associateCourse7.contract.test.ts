import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const course = JSON.parse(fs.readFileSync(path.join(root, 'client/public/data/courses/claude_certified_associate_foundations__07.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'client/src/data/trainingIndex.json'), 'utf8'));
const lesson = course.lessons[0];
const chapter = (id: string) => lesson.chapters.find((item: { id: string }) => item.id === id);
const content = (id: string, language: 'en' | 'fr') => chapter(id).blocks.find((item: { type: string }) => item.type === 'content').body[language] as string;
const cards = (id: string) => chapter(id).blocks.find((item: { type: string }) => item.type === 'flip_cards').cards;

describe('Associate Foundations course 7 contract', () => {
  it('keeps the official duration, seven chapters and catalog metadata synchronized', () => {
    const entry = catalog.courses.find((item: { id: string }) => item.id === course.courseId);
    expect(course.sourceCourseTitle).toBe('Claude Certified Associate - Foundations / Troubleshooting & Optimization');
    expect(lesson.title.fr).toBe('Dépannage et optimisation');
    expect(lesson.chapters).toHaveLength(7);
    expect(content('chapter_01_1', 'fr')).toContain('**Durée officielle :** 30 minutes');
    expect(content('chapter_01_1', 'en')).toContain('**Official duration:** 30 minutes');
    expect(entry).toMatchObject({ officialDurationMinutes: 30, chapterCount: 7, exerciseCount: 5, totalActivities: 5 });
  });

  it('restores the six truncated cards in both languages and preserves product names', () => {
    const first = cards('chapter_01').find((item: { front: { en: string } }) => item.front.en === 'Diagnosing Underperforming Prompts and Outputs');
    const cause = cards('chapter_01').find((item: { front: { en: string } }) => item.front.en === 'Isolating the cause');
    const captured = cards('chapter_02').find((item: { front: { en: string } }) => item.front.en === 'Captured');
    const lost = cards('chapter_02').find((item: { front: { en: string } }) => item.front.en === 'Lost');
    const friction = cards('chapter_03').find((item: { front: { en: string } }) => item.front.en === 'Find redundancy and friction');
    const measure = cards('chapter_03').find((item: { front: { en: string } }) => item.front.en === 'Measure the improvement');
    expect(first.back.fr).toContain('réparation de cinq minutes.');
    expect(cause.back.en).toContain('points straight to the fix.');
    expect(captured.back.fr).toContain('section de clôture');
    expect(lost.back.en).toContain('leaving it un-captured.');
    expect(friction.back.fr).toContain('liste d’améliorations à apporter.');
    expect(measure.back.en).toContain('improvement you can point to.');
    expect(content('chapter_01', 'fr')).toContain('Skills');
    expect(content('chapter_02', 'fr')).toContain('Memory');
    expect(content('chapter_03', 'fr')).toContain('Projects');
    expect(content('chapter_01', 'fr')).toContain('résultats sous-performants');
    expect(content('chapter_01', 'fr')).not.toMatch(/\boutputs?\b|\bfeature\b|\bchecklist\b/);
    expect(content('chapter_03', 'fr')).not.toMatch(/\bworkflow\b|\bknowledge base\b|\bstanding instructions\b/);
    expect(content('chapter_03', 'fr')).toContain('**Signaux à normaliser**');
    expect(content('chapter_03', 'fr')).toContain('**Variabilité**');
    expect(content('chapter_03', 'fr')).not.toContain('Signal\n\nRépétition');
  });

  it('keeps only the five integrated quiz questions mandatory and aligns the third scenario', () => {
    const quiz = chapter('chapter_04');
    const questions = quiz.blocks.filter((item: { type: string }) => item.type === 'single_choice_exercise');
    const q3 = questions.find((item: { id: string }) => item.id === 'q3');
    const answer = q3.options.find((item: { id: string }) => item.id === q3.correctAnswer);
    expect(course.exercises).toEqual([]);
    expect(questions).toHaveLength(5);
    expect(quiz.completionRule).toEqual({ requires: ['contentViewed', 'requiredExercisesPassed'] });
    expect(q3.question.fr).toContain('flux de travail de newsletter assisté par IA');
    expect(answer.text.fr).toContain('base de connaissances ou les instructions permanentes d’un Project');
    expect(lesson.recommendedVideosManaged).toBe(false);
    expect(lesson.recommendedVideos).toBeUndefined();
  });
});
