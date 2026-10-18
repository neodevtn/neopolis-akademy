import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import course from '../../public/data/courses/claude_certified_developer_foundations__04.json';
import { findServerValidatedChoiceKey } from '../../../server/sensitiveExerciseAnswerKeys';
import { sanitizeCourseDataForLearner } from '../../../server/courseDataRoute';

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

  it('keeps the legacy S17/S18 chapter and block IDs while replacing free TPs with autonomous bilingual case-study quizzes', () => {
    const checkpoints = [
      {
        chapterId: 'chapter_skilljar_04_s17',
        blockId: 'chapter_cumulative_s17',
        englishCaseStudyTerms: ['Boundary pass', 'Failure pass', 'Regression pass'],
        frenchCaseStudyTerms: ['Passe de frontière', 'Passe de défaillance', 'Passe de régression'],
      },
      {
        chapterId: 'chapter_skilljar_04_s18',
        blockId: 'chapter_cumulative_s18',
        englishCaseStudyTerms: ['Boundary control', 'Failure control', 'Regression control'],
        frenchCaseStudyTerms: ['Contrôle de frontière', 'Contrôle de défaillance', 'Contrôle de régression'],
      },
    ] as const;
    const recapIndex = lesson.chapters.findIndex((item: any) => item.id === 'chapter_08');
    expect(recapIndex).toBeGreaterThan(-1);

    for (const specification of checkpoints) {
      const cumulative = chapter(specification.chapterId);
      expect(cumulative, specification.chapterId).toBeTruthy();
      expect(lesson.chapters.findIndex((item: any) => item.id === specification.chapterId)).toBeLessThan(recapIndex);
      expect(cumulative.completionRule).toEqual({ requires: ['requiredExercisesPassed'] });
      expect(cumulative.completionRule.requires).not.toContain('cloudExerciseCompleted');
      expect(cumulative.blocks.filter((block: any) => block.type === 'cloud_exercise')).toHaveLength(0);

      const caseStudy = cumulative.blocks.find((block: any) => block.type === 'content');
      const quiz = cumulative.blocks.find((block: any) => block.id === specification.blockId);
      expect(caseStudy?.body.en.trim().length).toBeGreaterThan(500);
      expect(caseStudy?.body.fr.trim().length).toBeGreaterThan(500);
      for (const term of specification.englishCaseStudyTerms) expect(caseStudy.body.en).toContain(term);
      for (const term of specification.frenchCaseStudyTerms) expect(caseStudy.body.fr).toContain(term);

      expect(cumulative.blocks.filter((block: any) => block.id === specification.blockId)).toHaveLength(1);
      expect(quiz).toMatchObject({ id: specification.blockId, type: 'single_choice_exercise', serverValidated: true, correctAnswer: 'b' });
      expect(quiz.options).toHaveLength(4);
      expect(quiz.options.map((option: any) => option.id)).toEqual(['a', 'b', 'c', 'd']);
      for (const localizedInstruction of [quiz.question, quiz.explanation, ...quiz.options.map((option: any) => option.text)]) {
        expect(localizedInstruction.en.trim()).not.toHaveLength(0);
        expect(localizedInstruction.fr.trim()).not.toHaveLength(0);
      }
      for (const obsoleteFreeResponseField of ['minimumAnswerLength', 'solution', 'instructions', 'rubricCriteria', 'learnerCriteria']) {
        expect(quiz, `${specification.blockId} must not regress to a free-response TP`).not.toHaveProperty(obsoleteFreeResponseField);
      }
    }
  });

  it('keeps the S17/S18 answer keys server-only and cannot unlock their required-exercise gates with a false answer', () => {
    const learnerCourse = JSON.parse(sanitizeCourseDataForLearner(JSON.stringify(course)));
    const lessonViewerSource = readFileSync(path.resolve(import.meta.dirname, 'training', 'LessonViewer.tsx'), 'utf8');
    const singleChoiceSource = readFileSync(path.resolve(import.meta.dirname, '..', 'components', 'SingleChoiceExercise.tsx'), 'utf8');

    for (const [chapterId, blockId] of [
      ['chapter_skilljar_04_s17', 'chapter_cumulative_s17'],
      ['chapter_skilljar_04_s18', 'chapter_cumulative_s18'],
    ] as const) {
      const sourceQuiz = chapter(chapterId).blocks.find((block: any) => block.id === blockId);
      const learnerQuiz = learnerCourse.lessons[0].chapters.find((item: any) => item.id === chapterId).blocks.find((block: any) => block.id === blockId);
      const serverKey = findServerValidatedChoiceKey(course, blockId);
      const wrongOption = sourceQuiz.options.find((option: any) => option.id !== sourceQuiz.correctAnswer);

      expect(serverKey, `${blockId} needs exactly one server-resolvable key`).toEqual({
        correctAnswer: sourceQuiz.correctAnswer,
        explanation: sourceQuiz.explanation,
      });
      expect(learnerQuiz.serverValidated).toBe(true);
      expect(learnerQuiz.correctAnswer).toBeUndefined();
      expect(learnerQuiz.explanation).toBeUndefined();
      expect(wrongOption.id).not.toBe(serverKey?.correctAnswer);
      expect(wrongOption.id === serverKey?.correctAnswer, `${blockId} false answer must not pass`).toBe(false);
      expect(sourceQuiz.correctAnswer === serverKey?.correctAnswer, `${blockId} correct answer must pass`).toBe(true);
    }

    // The secured evaluator is wired for serverValidated blocks, and completion
    // is emitted only when that evaluator returns correct=true. The chapter gate
    // then requires every single-choice ID in completedExercises before advancing.
    expect(lessonViewerSource).toContain('onEvaluate={block.serverValidated ? async (selectedId) => validateServerChoice.mutateAsync');
    expect(singleChoiceSource).toContain('if (result.correct && onCorrect) onCorrect(id);');
    expect(lessonViewerSource).toContain('if (scIds.length > 0 && !scIds.every((id: string) => isScopedInteractionComplete(completedExercises');
  });
});
