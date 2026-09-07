import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDb } = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("./db", () => ({ getDb }));

import { exerciseResults, learnerIntegrityReviews, learningEvents, users, videoProgress } from "../drizzle/schema";
import { getIntegrityReviewQueue } from "./integrityService";

describe("getIntegrityReviewQueue", () => {
  beforeEach(() => getDb.mockReset());

  it("charge les signaux en lots tout en conservant le score et la file de revue", async () => {
    const learners = [
      { id: 11, name: "Learner 1", email: "learner1@example.test", blocked: 0, lastSignedIn: null },
      { id: 12, name: "Learner 2", email: "learner2@example.test", blocked: 0, lastSignedIn: null },
    ];
    const events = Array.from({ length: 6 }, (_, index) => ({
      userId: 11,
      eventType: "lesson_completed",
      success: 1,
      score: 100,
      attemptNumber: 1,
      durationSeconds: 0,
      createdAt: new Date(Date.UTC(2026, 0, 1, 8, index)),
    }));
    const reviews = [{ id: 99, userId: 12, status: "review_required", updatedAt: new Date(Date.UTC(2026, 0, 2)) }];
    const select = vi.fn().mockImplementation(() => ({
      from: (table: unknown) => {
        if (table === users) return { where: vi.fn().mockResolvedValue(learners) };
        if (table === learnerIntegrityReviews) return { orderBy: vi.fn().mockResolvedValue(reviews) };
        if (table === learningEvents) return { where: vi.fn().mockReturnValue({ orderBy: vi.fn().mockResolvedValue(events) }) };
        if (table === videoProgress) return { where: vi.fn().mockResolvedValue([{ userId: 11 }]) };
        if (table === exerciseResults) return { where: vi.fn().mockResolvedValue([
          { userId: "11", courseId: "course", moduleId: "exercise", answers: "same-answer" },
          { userId: "11", courseId: "course", moduleId: "exercise", answers: "same-answer" },
          { userId: "11", courseId: "course", moduleId: "exercise", answers: "same-answer" },
        ]) };
        throw new Error("Unexpected table");
      },
    }));
    getDb.mockResolvedValue({ select });

    const queue = await getIntegrityReviewQueue();

    expect(select).toHaveBeenCalledTimes(5);
    expect(queue).toHaveLength(2);
    expect(queue[0]).toMatchObject({ id: 11, assessment: { riskScore: 45 } });
    expect(queue[0].assessment.signals.map((signal) => signal.id)).toEqual(["rapid_success_chain", "repeated_identical_submission"]);
    expect(queue[1]).toMatchObject({ id: 12, assessment: { riskScore: 0 }, review: { id: 99 } });
  });
});
