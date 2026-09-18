import { describe, expect, it } from 'vitest';
import course from '../../public/data/courses/claude_certified_developer_foundations__04.json';

const collectFrenchText = (value: unknown, text: string[] = []): string[] => {
  if (Array.isArray(value)) value.forEach((item) => collectFrenchText(item, text));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'fr' && typeof item === 'string') text.push(item);
      else if (key !== 'en') collectFrenchText(item, text);
    }
  }
  return text;
};

describe('Developer Foundations course 4 checkpoint integrity', () => {
  const lesson = course.lessons[0] as any;
  const chapter = (id: string) => lesson.chapters.find((item: any) => item.id === id);
  const exercise = (id: string) => (course.exercises as any[]).find((item) => item.id === id);
  it('removes source-incomplete checkpoint invitations rather than presenting unanswerable exercises', () => {
    const invalidExerciseIds = [
      'ex_claude_certified_developer_foundations__04_005',
      'ex_claude_certified_developer_foundations__04_007',
      'ex_claude_certified_developer_foundations__04_011',
    ];
    for (const exerciseId of invalidExerciseIds) {
      expect(exercise(exerciseId)).toBeUndefined();
      expect(lesson.chapters.flatMap((item: any) => item.blocks).some((block: any) => block.type === 'checkpoint' && block.exerciseId === exerciseId)).toBe(false);
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

  it('renders each repaired reference table as bounded Markdown instead of concatenated text', () => {
    const sections = [
      ['chapter_01', '| Type de tâche | Méthode de notation | Ce qu’elle détecte | Limites |', 'Task typeGrading methodWhat it catchesWhere it is unreliable'],
      ['chapter_03', '| Niveau ou choix | Ce qu’il isole | Ce qu’il ne peut pas détecter |', 'LevelWhat it isolatesWhat it cannot catch'],
      ['chapter_05', '| Type d’erreur | Réessayable ou échec immédiat | Stratégie de backoff | Comportement de repli |', 'Error typeRetriable or fail-fastBackoff strategyFallback behavior'],
      ['chapter_09', '| Métrique | Où l’instrumenter | Agent unique ou orchestrator-worker |', 'MetricWhere to instrument itSingle-agent versus orchestrator-worker'],
    ] as const;

    for (const [chapterId, markdownHeader, legacyHeader] of sections) {
      const content = chapter(chapterId).blocks.find((block: any) => block.type === 'content');
      expect(content.body.fr).toContain(markdownHeader);
      expect(content.body.en).toContain('|');
      expect(content.body.en).not.toContain(legacyHeader);
      expect(content.body.fr).not.toContain(legacyHeader);
    }
  });

  it('keeps the selected French learner-facing labels localized without changing technical identifiers', () => {
    const content = chapter('chapter_09').blocks.find((block: any) => block.type === 'content').body.fr;
    const errorHandlingContent = chapter('chapter_05').blocks.find((block: any) => block.type === 'content').body.fr;
    const frenchCourseText = collectFrenchText(course).join('\n');
    expect(content).toContain('Sélection du modèle pour la tâche :');
    expect(content).toContain('Taille du prompt et du contexte :');
    expect(content).toContain('Nombre d’appels d’outils :');
    expect(content).toContain('schéma orchestrator-worker');
    expect(errorHandlingContent).toContain('stop_reason');
    expect(frenchCourseText).not.toContain('Réparez le chemin d’erreur et de réessai cassé');
    expect(frenchCourseText).not.toContain('CheckpointTesting & Tracing·10 min');
    expect(content).not.toContain('Model selection for the task :');
    expect(content).not.toContain('Prompt and context size :');
    expect(content).not.toContain('un score baseline épinglé');
  });

  it('restores the two Skilljar cumulative production-hardening tasks before the recap', () => {
    const ids = ['chapter_skilljar_04_s17', 'chapter_skilljar_04_s18'];
    const chapters = ids.map(chapter);
    const recapIndex = lesson.chapters.findIndex((item: any) => item.id === 'chapter_08');
    expect(chapters.every(Boolean)).toBe(true);
    expect(lesson.chapters.findIndex((item: any) => item.id === ids[0])).toBeLessThan(recapIndex);

    for (const cumulative of chapters) {
      const exerciseBlock = cumulative.blocks.find((block: any) => block.type === 'cloud_exercise');
      expect(cumulative.completionRule).toEqual({ requires: ['cloudExerciseCompleted'] });
      expect(exerciseBlock.minimumAnswerLength).toBe(40);
      expect(exerciseBlock.solution.en).not.toHaveLength(0);
      expect(exerciseBlock.solution.fr).not.toHaveLength(0);
      expect(exerciseBlock.instructions.fr).toContain('soumettez');
      expect(exerciseBlock.instructions.fr).toContain('réponse du modèle');
    }

    expect(chapter('chapter_skilljar_04_s17').blocks[1].solution.fr).toContain('aucune évaluation n’existe');
    expect(chapter('chapter_skilljar_04_s18').blocks[1].solution.en).toContain('call_with_retry');
  });
});
