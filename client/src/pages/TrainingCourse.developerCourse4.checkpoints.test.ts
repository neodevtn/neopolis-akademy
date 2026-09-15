import { describe, expect, it } from 'vitest';
import course from '../../public/data/courses/claude_certified_developer_foundations__04.json';

describe('Developer Foundations course 4 checkpoint integrity', () => {
  const lesson = course.lessons[0] as any;
  const chapter = (id: string) => lesson.chapters.find((item: any) => item.id === id);
  const exercise = (id: string) => (course.exercises as any[]).find((item) => item.id === id);
  it('references existing same-chapter exercises from every repaired checkpoint', () => {
    const pairs = [
      ['chapter_05', 'ex_claude_certified_developer_foundations__04_005'],
      ['chapter_07', 'ex_claude_certified_developer_foundations__04_007'],
      ['chapter_11', 'ex_claude_certified_developer_foundations__04_011'],
    ];
    for (const [chapterId, exerciseId] of pairs) {
      expect(chapter(chapterId).blocks).toContainEqual({ type: 'checkpoint', exerciseId });
      expect(exercise(exerciseId)).toMatchObject({ chapterId, required: true, completionRequiresCorrectAnswer: false });
      expect(exercise(exerciseId).inputSchema.minWords).toBeGreaterThanOrEqual(15);
    }
  });
});
