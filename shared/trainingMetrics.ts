export type TrainingMetricCertification = {
  group?: string;
  exerciseLabel?: { en?: string; fr?: string } | string;
  totalActivities?: number;
  totalExercises?: number;
};

export function usesActivityTotals(certification: TrainingMetricCertification): boolean {
  if (certification.group === "datacamp_partner") return true;
  const label = typeof certification.exerciseLabel === "string"
    ? certification.exerciseLabel
    : `${certification.exerciseLabel?.en || ""} ${certification.exerciseLabel?.fr || ""}`;
  const declaresActivities = /activities|activit[eé]s/i.test(label);
  return declaresActivities && Number(certification.totalActivities || 0) > Number(certification.totalExercises || 0);
}
