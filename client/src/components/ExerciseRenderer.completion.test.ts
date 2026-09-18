import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(process.cwd(), 'client/src/components/ExerciseRenderer.tsx'), 'utf8');

describe('ExerciseRenderer completion contract', () => {
  it('can require an entirely correct choice set before completing a checkpoint', () => {
    expect(source).toContain('completionRequiresCorrectAnswer?: boolean');
    expect(source).toContain('hasExactCorrectChoiceSet(shuffledOptions, selectedOptions)');
    expect(source).toContain('const localShouldComplete = !exercise.completionRequiresCorrectAnswer || selectedAnswersAreCorrect;');
    expect(source).toContain('if (shouldComplete && !serverSubmissionRequired) await onComplete?.(exercise.id, answer, Array.from(selectedOptions));');
  });

  it('falls back to the exact English interaction type outside French', () => {
    expect(source).toContain("TYPE_LABELS[interactionType]?.en || 'Written Response'");
  });
});
