import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '../../..');
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__01.json');
const indexPath = path.join(root, 'client/src/data/trainingIndex.json');

execFileSync('node', ['scripts/repair-developer-course1.mjs'], { cwd: root, stdio: 'pipe' });

const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const lesson = course.lessons[0];
const chapter = (id: string) => lesson.chapters.find((item: any) => item.id === id);
const content = (id: string) => chapter(id).blocks.find((item: any) => item.type === 'content').body;

describe('Developer Foundations course 1 contract', () => {
  it('keeps the ten-screen MSO course and official 57-minute reference synchronized', () => {
    expect(lesson.chapters).toHaveLength(10);
    expect(lesson.officialDurationMinutes).toBe(57);
    expect(content('chapter_01_1').fr).toContain('**MSO** signifie **Model Selection and Optimization**');
    expect(content('chapter_01_1').fr).toContain('**Durée officielle :** 57 minutes');
    const catalog = index.courses.find((item: any) => item.id === course.courseId);
    expect(catalog).toMatchObject({ officialDurationMinutes: 57, chapterCount: 10, exerciseCount: 6, totalActivities: 6 });
    const certification = index.certifications.find((item: any) => item.id === 'claude_certified_developer_foundations');
    const certificationCourses = index.courses.filter((item: any) => item.certId === certification.id);
    expect(certification.totalVideos).toBe(certificationCourses.reduce((sum: number, item: any) => sum + item.videoCount, 0));
  });

  it('removes malformed root exercises and restores five mandatory standard checkpoints', () => {
    expect(course.exercises).toHaveLength(5);
    expect(course.exercises.map((item: any) => item.chapterId)).toEqual(['chapter_01', 'chapter_02', 'chapter_03', 'chapter_04', 'chapter_06']);
    for (const exercise of course.exercises) {
      expect(exercise).toMatchObject({ interactionType: 'single_choice', completionRequiresCorrectAnswer: true, required: true, difficulty: 'foundation' });
      expect(exercise.options).toHaveLength(4);
      expect(exercise.options.filter((option: any) => option.correct)).toHaveLength(1);
      expect(exercise.correction.fr).toContain('Bonne réponse');
      expect(chapter(exercise.chapterId).completionRule).toEqual({ requires: ['contentViewed', 'requiredExercisesPassed'] });
    }
  });

  it('restores truncated copy, localizes generic French terms and removes generic video fallbacks', () => {
    const optionB = chapter('chapter_05').blocks.find((block: any) => block.id === 'q1').options.find((option: any) => option.id === 'b');
    expect(optionB.text.en).toContain('specific model at build time.');
    expect(optionB.text.fr).toContain('modèle spécifique au moment du développement.');
    expect(content('chapter_01').fr).toContain('La fenêtre de contexte : un budget fixe');
    expect(content('chapter_01').fr).not.toContain('The context window: a fixed budget');
    expect(content('chapter_01').fr).not.toContain('The fenêtre de contexte');
    expect(content('chapter_01').fr).not.toContain('## Tokens\n\n## Fenêtre de contexte\n\n## Échantillonnage\n\n## Non-déterminisme');
    expect(content('chapter_03').fr).toContain('Modes de prompting : zero-shot (sans exemple)');
    expect(content('chapter_08').fr).toContain('Comment les LLMs se comportent');
    expect(chapter('chapter_09').blocks).toHaveLength(1);
    expect(chapter('chapter_09').blocks[0].type).toBe('content');
    expect(lesson.recommendedVideosManaged).toBe(false);
    expect(lesson.recommendedVideos).toBeUndefined();
  });
});
