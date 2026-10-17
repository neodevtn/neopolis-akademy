import { describe, expect, it } from 'vitest';
import course from '../../public/data/courses/claude_certified_architect_foundations__04.json';

describe('Claude-selected root checkpoint projection', () => {
  it('removes the unverifiable Rewind free-text checkpoint without leaving a phantom gate', () => {
    const lesson = course.lessons[0] as any;
    const exercise = (course.exercises as any[]).find((item) => item.id === 'ex_claude_certified_architect_foundations__04_005');
    const chapter = lesson.chapters.find((item: any) => item.id === 'chapter_01');
    expect(exercise).toBeUndefined();
    expect(chapter.blocks.some((block: any) => block.type === 'checkpoint')).toBe(false);
    expect(chapter.completionRule).toEqual({ requires: ['contentViewed'] });
  });
});
