export type AuditableLearningEvent = {
  courseId?: string | null;
  eventType: string;
  durationSeconds?: number | null;
  createdAt: string | Date;
};

export type CourseActivitySummary = {
  courseId: string;
  activeSeconds: number;
  eventCount: number;
  latestAt: Date;
};

const dayKey = (value: string | Date) => new Date(value).toLocaleDateString("en-CA");

export function summarizeLearningActivity(events: AuditableLearningEvent[]) {
  const byCourse: Record<string, CourseActivitySummary> = {};
  let latestAt: Date | null = null;

  for (const event of events) {
    const eventDate = new Date(event.createdAt);
    if (!latestAt || eventDate > latestAt) latestAt = eventDate;
    if (!event.courseId) continue;

    const summary = byCourse[event.courseId] || {
      courseId: event.courseId,
      activeSeconds: 0,
      eventCount: 0,
      latestAt: new Date(0),
    };
    summary.activeSeconds += event.eventType === "learning_time" ? Number(event.durationSeconds || 0) : 0;
    summary.eventCount += 1;
    if (eventDate > summary.latestAt) summary.latestAt = eventDate;
    byCourse[event.courseId] = summary;
  }

  return {
    activeDays: new Set(events.map((event) => dayKey(event.createdAt))).size,
    latestAt,
    courseActivity: Object.values(byCourse).sort((left, right) => right.latestAt.getTime() - left.latestAt.getTime()),
  };
}

export function buildRecentDailyActivity(events: AuditableLearningEvent[], dayCount = 7, now = new Date()) {
  return Array.from({ length: dayCount }, (_, offset) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (dayCount - 1 - offset));
    const key = dayKey(date);
    const matchingEvents = events.filter((event) => dayKey(event.createdAt) === key);
    return {
      key,
      label: date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""),
      durationSeconds: matchingEvents.reduce((sum, event) => sum + (event.eventType === "learning_time" ? Number(event.durationSeconds || 0) : 0), 0),
      eventCount: matchingEvents.length,
    };
  });
}
