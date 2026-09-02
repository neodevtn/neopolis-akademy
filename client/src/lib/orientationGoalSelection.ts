export const MAX_ORIENTATION_GOALS = 5;

export type OrientationGoal = {
  competencyId: string;
  targetLevel: "bronze" | "silver" | "gold";
};

export function canAddOrientationGoal(goals: OrientationGoal[], competencyId: string): boolean {
  return goals.some((goal) => goal.competencyId === competencyId) || goals.length < MAX_ORIENTATION_GOALS;
}

export function toggleOrientationGoal(goals: OrientationGoal[], competencyId: string): OrientationGoal[] {
  if (goals.some((goal) => goal.competencyId === competencyId)) {
    return goals.filter((goal) => goal.competencyId !== competencyId);
  }

  if (goals.length >= MAX_ORIENTATION_GOALS) {
    return goals;
  }

  return [...goals, { competencyId, targetLevel: "bronze" }];
}
