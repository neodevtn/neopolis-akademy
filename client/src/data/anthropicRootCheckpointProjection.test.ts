import { describe, expect, it } from 'vitest';
import course from '../../public/data/courses/claude_certified_architect_foundations__04.json';

describe('Claude-selected root checkpoint projection', () => {
  it('renders the Rewind checkpoint as a standard required chapter block', () => {
    const lesson = course.lessons[0] as any;
    const exercise = (course.exercises as any[]).find((item) => item.id === 'ex_claude_certified_architect_foundations__04_005');
    const chapter = lesson.chapters.find((item: any) => item.id === 'chapter_01');
    expect(exercise).toMatchObject({ interactionType: 'free_text', chapterId: 'chapter_01', required: true, completionRequiresCorrectAnswer: false });
    expect(exercise.inputSchema.minWords).toBeGreaterThanOrEqual(15);
    expect(chapter.blocks).toContainEqual({ type: 'checkpoint', exerciseId: exercise.id });
    expect(chapter.completionRule).toEqual({ requires: ['contentViewed', 'requiredExercisesPassed'] });
  });
});
