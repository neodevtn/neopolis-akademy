export type CorrectableChoice = {
  id: string;
  correct: boolean;
};

/**
 * A gated assessment must accept neither a distractor nor a partial set of
 * answers. This deliberately treats an empty option list as non-correct.
 */
export function hasExactCorrectChoiceSet(options: CorrectableChoice[], selectedOptionIds: Set<string>): boolean {
  return options.length > 0 && options.every((option) => selectedOptionIds.has(option.id) === option.correct);
}
