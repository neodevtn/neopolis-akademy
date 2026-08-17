export type RankDefinition = { id: string; label: string; minPoints: number; color: string; icon: string; sortOrder: number; active?: number };

export const DEFAULT_GAMIFICATION_RANKS: RankDefinition[] = [
  { id: "starting", label: "À démarrer", minPoints: 0, color: "slate", icon: "circle", sortOrder: 10 },
  { id: "emerging", label: "Émergent", minPoints: 5, color: "sky", icon: "sprout", sortOrder: 20 },
  { id: "bronze", label: "Bronze", minPoints: 10, color: "amber", icon: "medal", sortOrder: 30 },
  { id: "silver", label: "Argent", minPoints: 35, color: "slate", icon: "badge-check", sortOrder: 40 },
  { id: "gold", label: "Or", minPoints: 70, color: "yellow", icon: "crown", sortOrder: 50 },
];

export const DEFAULT_GAMIFICATION_SETTINGS = {
  weeklyGoalPoints: 5,
  pointsLabel: "Points de progression Neopolis Akademy",
  rewardNotice: "Ces points valorisent votre progression sur Neopolis Akademy. Ils ne constituent pas des crédits, tokens ou avantages Anthropic et ne sont pas convertibles.",
};

export function getRankForLevel(level: number, ranks: RankDefinition[] = DEFAULT_GAMIFICATION_RANKS) {
  const ordered = [...ranks].filter((rank) => rank.active !== 0).sort((a, b) => a.minPoints - b.minPoints);
  return [...ordered].reverse().find((rank) => level >= rank.minPoints) || ordered[0];
}

export function getNextRank(level: number, ranks: RankDefinition[] = DEFAULT_GAMIFICATION_RANKS) {
  return [...ranks].filter((rank) => rank.active !== 0).sort((a, b) => a.minPoints - b.minPoints).find((rank) => rank.minPoints > level) || null;
}
