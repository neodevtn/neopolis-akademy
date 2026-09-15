import { describe, expect, it } from 'vitest';
import { hasExactCorrectChoiceSet } from './exerciseCompletion';

const options = [
  { id: 'a', correct: false },
  { id: 'b', correct: true },
  { id: 'c', correct: false },
];

describe('hasExactCorrectChoiceSet', () => {
  it('rejects a distractor and accepts only the complete correct set', () => {
    expect(hasExactCorrectChoiceSet(options, new Set(['a']))).toBe(false);
    expect(hasExactCorrectChoiceSet(options, new Set(['b']))).toBe(true);
  });

  it('rejects an empty bank and a partial multi-choice selection', () => {
    expect(hasExactCorrectChoiceSet([], new Set())).toBe(false);
    expect(hasExactCorrectChoiceSet([{ id: 'a', correct: true }, { id: 'b', correct: true }], new Set(['a']))).toBe(false);
  });
});
