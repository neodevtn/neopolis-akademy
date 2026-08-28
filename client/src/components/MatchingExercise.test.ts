import { describe, expect, it } from 'vitest';
import { isPlacementComplete, isPlacementCorrect } from './MatchingExercise';

const cards = [
  { id: 'augmentation', text: { fr: 'Analyse', en: 'Analysis' }, correctBucket: 'human' },
  { id: 'automation', text: { fr: 'Rapport', en: 'Report' }, correctBucket: 'automatic' },
];

describe('tri de cartes', () => {
  it('n’autorise la soumission que lorsque chaque carte est placée', () => {
    expect(isPlacementComplete(cards, { augmentation: 'human' })).toBe(false);
    expect(isPlacementComplete(cards, { augmentation: 'human', automation: 'automatic' })).toBe(true);
  });

  it('ne considère comme réussi que le classement entièrement correct', () => {
    expect(isPlacementCorrect(cards, { augmentation: 'human', automation: 'human' })).toBe(false);
    expect(isPlacementCorrect(cards, { augmentation: 'human', automation: 'automatic' })).toBe(true);
  });
});
