/** Un compte sans appartenance reçoit le groupe système Full access. */
export function needsDefaultLearnerGroup(membershipCount: number): boolean {
  return membershipCount === 0;
}

export function getNewLearnerGroupMemberIds(existingUserIds: number[], nextUserIds: number[]): number[] {
  const existing = new Set(existingUserIds);
  return Array.from(new Set(nextUserIds)).filter((userId) => !existing.has(userId));
}
