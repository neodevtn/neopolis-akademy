import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const course = JSON.parse(fs.readFileSync(path.join(root, 'client/public/data/courses/claude_certified_developer_foundations__02.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'client/src/data/trainingIndex.json'), 'utf8'));
const lesson = course.lessons[0];
const expectedChapters = ['chapter_01', 'chapter_03', 'chapter_05', 'chapter_07', 'chapter_09', 'chapter_11', 'chapter_13', 'chapter_15'];

const chapter = (id: string) => lesson.chapters.find((item: { id: string }) => item.id === id);
const body = (id: string) => chapter(id)?.blocks.find((block: { type: string }) => block.type === 'content')?.body;
const chapterFrenchText = (id: string) => JSON.stringify(chapter(id));

describe('Developer Foundations course 2 content contract', () => {
  it('publishes the official duration and twelve standard screens', () => {
    const courseEntry = catalog.courses.find((item: { id: string }) => item.id === course.courseId);
    expect(lesson.officialDurationMinutes).toBe(209);
    expect(courseEntry.officialDurationMinutes).toBe(209);
    expect(lesson.chapters).toHaveLength(12);
    expect(courseEntry.chapterCount).toBe(12);
  });

  it('uses eight contextual single-choice checkpoints and no free-text root exercise', () => {
    expect(course.exercises).toHaveLength(8);
    expect(course.exercises.every((exercise: { interactionType: string; required: boolean; completionRequiresCorrectAnswer: boolean }) => exercise.interactionType === 'single_choice' && exercise.required && exercise.completionRequiresCorrectAnswer)).toBe(true);
    expect(course.exercises.map((exercise: { chapterId: string }) => exercise.chapterId)).toEqual(expectedChapters);
    expect(course.exercises.every((exercise: { options: { correct: boolean }[] }) => exercise.options.filter((option) => option.correct).length === 1)).toBe(true);
    expect(course.exercises.some((exercise: { interactionType: string }) => exercise.interactionType === 'free_text')).toBe(false);
    for (const id of expectedChapters) {
      expect(chapter(id).blocks.some((block: { type: string; exerciseId?: string }) => block.type === 'checkpoint' && block.exerciseId)).toBe(true);
    }
  });

  it('keeps French terminology readable and product names canonical', () => {
    expect(lesson.title.fr).toBe('Prompting prêt pour la production, agents et utilisation d’outils');
    expect(body('chapter_01').fr).toContain('Prompts système, XML, few-shot et contraintes de sortie');
    expect(body('chapter_01').fr).not.toContain('du prose');
    expect(body('chapter_01').fr).toContain('## Symptômes et technique manquante');
    expect(body('chapter_01').fr).toContain('## Principes d’utilisation');
    expect(body('chapter_01').fr).toContain('## Prompt système');
    expect(body('chapter_01').fr).toContain('## Contraintes de sortie');
    expect(body('chapter_01').fr).not.toContain('Ce que vous avez observé — Ce que le prompt manque');
    expect(body('chapter_01').fr).not.toContain('Stack all four techniques');
    expect(body('chapter_01').fr).not.toContain('System Prompts\n\nXML Tags');
    expect(body('chapter_01').fr).not.toContain('une output constraint');
    expect(body('chapter_01').fr).not.toContain('un system prompt');
    expect(body('chapter_01').fr).not.toContain('few‑shot examples');
    expect(body('chapter_01').fr).not.toContain('structured outputs');
    expect(body('chapter_01').fr).toContain('sorties structurées');
    const promptingCheckpoint = course.exercises.find((exercise: { chapterId: string }) => exercise.chapterId === 'chapter_01');
    expect(promptingCheckpoint?.options.map((option) => option.text.fr).join('\n')).not.toContain('system prompt');
    expect(promptingCheckpoint?.correction.fr).not.toContain('system prompt');
    expect(body('chapter_11').fr).toContain('l’humain dans la boucle');
    expect(chapterFrenchText('chapter_15')).toContain('Claude Agent SDK');
    expect(chapterFrenchText('chapter_13')).toContain('Skills');
  });

  it('removes unsourced tutorial video blocks while preserving a factual reference screen', () => {
    const resources = chapter('chapter_11_1');
    expect(resources.title.fr).toBe('Ressources pratiques');
    expect(resources.blocks.some((block: { type: string }) => block.type === 'video')).toBe(false);
    expect(body('chapter_11_1').fr).toContain('Aucune vidéo sans provenance n’est proposée.');
  });

  it('restores generated card backs as complete sentences', () => {
    const cards = lesson.chapters.flatMap((item: { blocks: unknown[] }) => item.blocks)
      .filter((block: { type: string }) => block.type === 'flip_cards')
      .flatMap((block: { cards?: { back?: { fr?: string } }[] }) => block.cards || []);
    expect(cards.filter((card: { back?: { fr?: string } }) => card.back?.fr && card.back.fr.length > 120).every((card: { back: { fr: string } }) => /[.!?…»)\]]$/.test(card.back.fr.trim()))).toBe(true);
  });
});
