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

  it('restores critical lifecycle cards and localizes the learner-facing lifecycle', () => {
    const lifecycle = chapter('chapter_05');
    const text = lifecycle.blocks.map((block: any) => `${block.body?.en ?? ''}\n${block.body?.fr ?? ''}`).join('\n');
    const cards = lifecycle.blocks.filter((block: any) => block.type === 'flip_cards').flatMap((block: any) => block.cards);
    expect(text).toContain('1 — Exigences');
    expect(text).toContain('7 — Itération');
    expect(cards.map((card: any) => card.back.fr).join('\n')).toContain('Un jalon est une décision de passer d’une phase à la suivante');
    expect(cards.map((card: any) => card.back.fr).join('\n')).not.toMatch(/(?:après un diff\.|Le modèle)$/m);
  });
});
