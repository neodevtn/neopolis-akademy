export type CourseLifecycleStatus = "active" | "disabled" | "archived";

/** Les contenus désactivés ou archivés restent référencés, mais ne peuvent pas être ouverts par un apprenant. */
export function canLearnerOpenLifecycle(status: CourseLifecycleStatus | undefined | null): boolean {
  return !status || status === "active";
}

export function lifecycleStatusLabel(status: CourseLifecycleStatus): string {
  return ({ active: "Publié", disabled: "Désactivé", archived: "Archivé" })[status];
}
