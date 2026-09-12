export const LEARNER_DASHBOARD_TABS = [
  "journey",
  "growth",
  "orientation",
  "my-path",
  "evolution",
  "achievements",
  "skills",
  "catalog",
  "parrainage",
  "recommended",
  "communications",
  "messages",
] as const;

export type LearnerDashboardTab = (typeof LEARNER_DASHBOARD_TABS)[number];
export type LearnerJourneySection = "orientation" | "progress" | "evolution";
export type LearnerGrowthSection = "achievements" | "skills";

export function getLearnerDashboardTab(search: string): LearnerDashboardTab {
  const requestedTab = new URLSearchParams(search).get("tab");
  if (requestedTab === "parainnage" || requestedTab === "referrals") return "parrainage";
  if (requestedTab === "orientation" || requestedTab === "my-path" || requestedTab === "evolution") return "journey";
  if (requestedTab === "achievements" || requestedTab === "skills") return "growth";
  return LEARNER_DASHBOARD_TABS.includes(requestedTab as LearnerDashboardTab)
    ? (requestedTab as LearnerDashboardTab)
    : "journey";
}

export function getLearnerJourneySection(search: string): LearnerJourneySection {
  const requestedTab = new URLSearchParams(search).get("tab");
  if (requestedTab === "orientation") return "orientation";
  if (requestedTab === "evolution") return "evolution";
  return "progress";
}

export function getLearnerGrowthSection(search: string): LearnerGrowthSection {
  return new URLSearchParams(search).get("tab") === "skills" ? "skills" : "achievements";
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
