import { isEvaluationGateLocked } from '@shared/evaluationRules';

type CheckpointBlock = { type?: string; exerciseId?: string };

export function getCheckpointGateState({
  blocks = [],
  completedExercises,
  required = true,
  configuredThreshold,
  reviewMode = false,
}: {
  blocks?: CheckpointBlock[];
  completedExercises: Set<string>;
  required?: boolean;
  configuredThreshold?: number;
  reviewMode?: boolean;
}) {
  const checkpointIds = blocks
    .filter((block) => block.type === 'checkpoint')
    .map((block, index) => block.exerciseId || `checkpoint_${index}`);
  const completedCorrectAnswers = checkpointIds.filter((id) => completedExercises.has(id)).length;

  return {
    checkpointIds,
    locked: isEvaluationGateLocked({
      totalQuestions: checkpointIds.length,
      completedCorrectAnswers,
      configuredThreshold,
      required,
      reviewMode,
    }),
  };
}
