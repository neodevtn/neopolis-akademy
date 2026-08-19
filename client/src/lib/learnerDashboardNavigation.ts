export const LEARNER_DASHBOARD_TABS = [
  "orientation",
  "my-path",
  "achievements",
  "skills",
  "catalog",
  "recommended",
  "communications",
] as const;

export type LearnerDashboardTab = (typeof LEARNER_DASHBOARD_TABS)[number];

export function getLearnerDashboardTab(search: string): LearnerDashboardTab {
  const requestedTab = new URLSearchParams(search).get("tab");
  return LEARNER_DASHBOARD_TABS.includes(requestedTab as LearnerDashboardTab)
    ? (requestedTab as LearnerDashboardTab)
    : "my-path";
}

/**
 * L’orientation est une étape prioritaire, jamais un verrou de navigation.
 * Cette politique ne dépend volontairement pas de l’ancienneté du compte.
 */
export function getLearnerOrientationAccess(needsOrientation: boolean) {
  return {
    showReminder: needsOrientation,
    canUseAllTabs: true,
  } as const;
}
