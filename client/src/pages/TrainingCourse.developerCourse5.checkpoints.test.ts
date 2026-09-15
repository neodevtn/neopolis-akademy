import { describe, expect, it } from 'vitest';
import course from '../../public/data/courses/claude_certified_developer_foundations__05.json';

describe('Developer Foundations course 5 checkpoint integrity', () => {
  const lesson = course.lessons[0] as any;
  const chapter = (id: string) => lesson.chapters.find((item: any) => item.id === id);
  const exercise = (id: string) => (course.exercises as any[]).find((item) => item.id === id);
  it('uses the same-chapter Packaging exercise and exposes no missing trust-boundary exercise', () => {
    const packagingId = 'ex_claude_certified_developer_foundations__05_002';
    expect(chapter('chapter_02').blocks).toContainEqual({ type: 'checkpoint', exerciseId: packagingId });
    expect(exercise(packagingId)).toMatchObject({ chapterId: 'chapter_02', required: true, completionRequiresCorrectAnswer: false });
    expect(exercise(packagingId).inputSchema.minWords).toBeGreaterThanOrEqual(15);
    expect(chapter('chapter_13').blocks).not.toContainEqual({ type: 'checkpoint', exerciseId: 'ex_claude_certified_developer_foundations__05_007' });
    expect(chapter('chapter_13').completionRule).toEqual({ requires: ['contentViewed'] });
  });
});
