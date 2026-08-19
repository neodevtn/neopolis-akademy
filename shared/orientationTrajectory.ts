export type OrientationTrajectoryContribution = { awardedAt: Date | string; points: number };

export type OrientationTrajectoryPoint = {
  date: string;
  planned: number;
  actual: number | null;
};

export function buildOrientationTrajectory(input: {
  startedAt: Date | string | null;
  targetDate: string | null;
  targetPoints: number;
  contributions: OrientationTrajectoryContribution[];
  now?: Date;
}): { available: boolean; reason?: string; points: OrientationTrajectoryPoint[]; targetDate?: string } {
  if (!input.startedAt || !input.targetDate || input.targetPoints <= 0) {
    return { available: false, reason: "Définissez une échéance de certification pour comparer l’avancement réel à la trajectoire prévue.", points: [] };
  }
  const startedAt = new Date(input.startedAt);
  const targetAt = new Date(`${input.targetDate}T23:59:59`);
  const now = input.now || new Date();
  if (Number.isNaN(startedAt.getTime()) || Number.isNaN(targetAt.getTime()) || targetAt <= startedAt) {
    return { available: false, reason: "L’échéance cible doit être postérieure au démarrage du parcours.", points: [] };
  }

  const plotEnd = now > targetAt ? now : targetAt;
  const pointCount = 7;
  const interval = (plotEnd.getTime() - startedAt.getTime()) / (pointCount - 1);
  const ordered = [...input.contributions]
    .map((contribution) => ({ at: new Date(contribution.awardedAt), points: Number(contribution.points) || 0 }))
    .filter((contribution) => !Number.isNaN(contribution.at.getTime()))
    .sort((left, right) => left.at.getTime() - right.at.getTime());

  return {
    available: true,
    targetDate: input.targetDate,
    points: Array.from({ length: pointCount }, (_, index) => {
      const at = new Date(startedAt.getTime() + interval * index);
      const planned = Math.max(0, Math.min(100, ((at.getTime() - startedAt.getTime()) / (targetAt.getTime() - startedAt.getTime())) * 100));
      const actual = at <= now
        ? Math.max(0, Math.min(100, (ordered.filter((contribution) => contribution.at <= at).reduce((sum, contribution) => sum + contribution.points, 0) / input.targetPoints) * 100))
        : null;
      return { date: at.toISOString().slice(0, 10), planned: Math.round(planned), actual: actual === null ? null : Math.round(actual) };
    }),
  };
}
