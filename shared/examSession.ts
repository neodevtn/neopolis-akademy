export function getExamSessionRemainingSeconds(expiresAt: Date | string, nowMs = Date.now()): number {
  const expiryMs = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiryMs)) return 0;
  return Math.max(0, Math.floor((expiryMs - nowMs) / 1000));
}

export function canRestoreExamSession(expiresAt: Date | string, nowMs = Date.now()): boolean {
  return getExamSessionRemainingSeconds(expiresAt, nowMs) > 0;
}
