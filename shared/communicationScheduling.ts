/** Builds a UTC cron that fires on the next occurrence of the selected month/day/time.
 * The server deletes the job after its first idempotent execution. */
export function toOneShotCommunicationCron(scheduledAt: Date) {
  return `0 ${scheduledAt.getUTCMinutes()} ${scheduledAt.getUTCHours()} ${scheduledAt.getUTCDate()} ${scheduledAt.getUTCMonth() + 1} *`;
}

export function isSchedulableCommunicationDate(scheduledAt: Date, now = Date.now()) {
  const timestamp = scheduledAt.getTime();
  return Number.isFinite(timestamp) && timestamp >= now + 120_000 && timestamp <= now + 366 * 86_400_000;
}
