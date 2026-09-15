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

  it('restores the critical card explanations without clipped endings', () => {
    const cards = ['chapter_01', 'chapter_05', 'chapter_09'].flatMap((chapterId) =>
      chapter(chapterId).blocks.filter((block: any) => block.type === 'flip_cards').flatMap((block: any) => block.cards),
    );
    const text = cards.map((card: any) => `${card.back.en}\n${card.back.fr}`).join('\n');
    expect(text).toContain('Twenty cases that include irregular and edge inputs can catch a break');
    expect(text).toContain('Vingt cas comprenant des entrées irrégulières');
    expect(text).not.toMatch(/(?:une bre|un tran|which c|retu)$/m);
  });
});
