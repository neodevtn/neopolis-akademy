export type AchievementKind = "skill_badge" | "certification";

export function credentialCode(kind: AchievementKind, userId: number, key: string) {
  const prefix = kind === "certification" ? "NEO-CERT" : "NEO-SKILL";
  const safeKey = key.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 52);
  return `${prefix}-${userId}-${safeKey}`;
}

export function isCourseCompleted(completedLessonIndexes: number[], totalLessons: number) {
  if (totalLessons < 1) return false;
  return new Set(completedLessonIndexes.filter((index) => index >= 0 && index < totalLessons)).size >= totalLessons;
}

export function certificationTitle(certificationId: string) {
  const titles: Record<string, string> = {
    claude_certified_associate_foundations: "Claude Certified Associate – Fondations",
    claude_certified_developer_foundations: "Claude Certified Developer – Fondations",
    claude_certified_architect_foundations: "Claude Certified Architect – Fondations",
    claude_certified_architect_professional: "Claude Certified Architect – Professionnel",
  };
  return titles[certificationId] || certificationId.replace(/_/g, " ");
}
