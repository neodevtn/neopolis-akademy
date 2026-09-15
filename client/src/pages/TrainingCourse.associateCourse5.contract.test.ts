import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const course = JSON.parse(
  fs.readFileSync(
    path.join(root, 'client/public/data/courses/claude_certified_associate_foundations__05.json'),
    'utf8',
  ),
);
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'client/src/data/trainingIndex.json'), 'utf8'));
const lesson = course.lessons[0];

describe('Associate Foundations course 5 contract', () => {
  it('preserves the eight-screen configuration sequence and the official duration', () => {
    const catalogCourse = catalog.courses.find((item: { id: string }) => item.id === course.courseId);
    expect(lesson.chapters).toHaveLength(8);
    expect(lesson.title).toEqual({
      en: 'Configuration & Knowledge Management',
      fr: 'Configuration et gestion des connaissances',
    });
    expect(catalogCourse.title).toEqual(lesson.title);
    expect(catalogCourse.officialDurationMinutes).toBe(47);
    expect(lesson.chapters[0].blocks[0].body.en).toContain('**Official duration:** 47 minutes');
    expect(lesson.chapters[0].blocks[0].body.fr).toContain('**Durée officielle :** 47 minutes');
    expect(lesson.chapters[0].blocks[0].body.fr).not.toContain('15-25 minutes');
  });

  it('keeps the five in-screen deterministic quiz questions and removes historical free-text artifacts', () => {
    const quiz = lesson.chapters.find((chapter: { id: string }) => chapter.id === 'chapter_05');
    const questions = quiz.blocks.filter((block: { type: string }) => block.type === 'single_choice_exercise');
    expect(course.exercises).toEqual([]);
    expect(questions.map((question: { id: string }) => question.id)).toEqual(['q1', 'q2', 'q3', 'q4', 'q5']);
    expect(questions.map((question: { correctAnswer: string }) => question.correctAnswer)).toEqual(['b', 'c', 'c', 'c', 'b']);
    expect(questions.every((question: { options: unknown[]; explanation: { en: string; fr: string } }) => (
      question.options.length === 4 && Boolean(question.explanation.en) && Boolean(question.explanation.fr)
    ))).toBe(true);
    expect(questions[1].options.find((option: { id: string }) => option.id === 'b').text.fr).toBe(
      'Claude exige que l’e-mail soit importé dans la knowledge base avant de pouvoir interagir avec lui.',
    );
  });

  it('keeps Anthropic product terminology and restores every identified card completion', () => {
    const projects = lesson.chapters.find((chapter: { id: string }) => chapter.id === 'chapter_01');
    const connectors = lesson.chapters.find((chapter: { id: string }) => chapter.id === 'chapter_02');
    const instructions = lesson.chapters.find((chapter: { id: string }) => chapter.id === 'chapter_03');
    const maintenance = lesson.chapters.find((chapter: { id: string }) => chapter.id === 'chapter_04');
    const card = (chapter: any, front: string) => chapter.blocks.find((block: any) => block.type === 'flip_cards').cards.find((item: any) => item.front.en === front);

    expect(card(projects, 'Knowledge base').front.fr).toBe('knowledge base');
    expect(card(projects, 'Skills').front.fr).toBe('Skills');
    expect(card(projects, 'Scoped Memory').front.fr).toBe('Scoped Memory');
    expect(projects.blocks[0].body.fr).toContain('\nSkills\n\nProcédures répétables');
    expect(projects.blocks[0].body.fr).toContain('la Scoped Memory assure la continuité');
    expect(card(projects, 'Configuring Claude Projects').back.fr).toContain('la Scoped Memory assure la continuité.');
    expect(card(projects, 'Choosing the right mechanism').back.en).toContain('rather than configured inside a single Project.');
    expect(card(projects, 'Choosing the right mechanism').back.fr).toContain('plutôt que d’être configurée dans un seul Project.');
    expect(card(connectors, 'Capability boundaries').back.en).toContain('before you build a workflow on it.');
    expect(card(connectors, 'Capability boundaries').back.fr).toContain('construire un flux de travail qui en dépend.');
    expect(card(instructions, 'Anticipate the use cases').back.en).toContain('needing the same corrections each time.');
    expect(card(instructions, 'Anticipate the use cases').back.fr).toContain('nécessiter les mêmes corrections à chaque fois.');
    expect(card(maintenance, 'Review cadence').back.en).toContain('output quality slipping for no visible reason.');
    expect(card(maintenance, 'Review cadence').back.fr).toContain('dégradation de la qualité des résultats sans raison visible.');
    expect(maintenance.blocks[0].body.fr).toContain('Un projet de rapport récurrent commence à produire des résultats légèrement incorrects.');
    expect(card(maintenance, 'Skills versioning').back.en).toContain('a maintenance problem, not a prompting problem.');
    expect(card(maintenance, 'Skills versioning').back.fr).toContain('problème de maintenance, pas d’un problème de prompting.');
    expect(card(maintenance, 'Memory lifecycle').back.en).toContain('matters more than the volume.');
    expect(card(maintenance, 'Memory lifecycle').back.fr).toContain('importe davantage que le volume.');
    const frenchStrings: string[] = [];
    const collectFrenchStrings = (value: unknown) => {
      if (Array.isArray(value)) value.forEach(collectFrenchStrings);
      else if (value && typeof value === 'object') {
        for (const [key, nestedValue] of Object.entries(value)) {
          if (key === 'fr' && typeof nestedValue === 'string') frenchStrings.push(nestedValue);
          else collectFrenchStrings(nestedValue);
        }
      }
    };
    collectFrenchStrings(lesson);
    expect(frenchStrings.join('\n')).not.toMatch(/Cite the source|Be professional|Use a formal register|Make the reports good and accurate|For every figure/i);
    expect(frenchStrings.join('\n')).not.toContain('Une équipe Project configure');
    expect(frenchStrings.join('\n')).toContain('Scoped Memory pour la continuité.');
    expect(lesson.recommendedVideosManaged).toBe(false);
    expect(lesson.recommendedVideos || []).toEqual([]);
  });
});
