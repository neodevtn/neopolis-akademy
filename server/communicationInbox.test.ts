import { describe, expect, it } from "vitest";
import { isManuallyTargetedCommunication, isUniversalCommunication, paginateLearnerCommunications } from "./adminDb";

describe("durable all-audience communications", () => {
  it("keeps an unqualified all-audience communication visible to new learner accounts", () => {
    expect(isUniversalCommunication({ audience: "all" })).toBe(true);
    expect(isUniversalCommunication(JSON.stringify({ audience: "all", criteriaLogic: "all" }))).toBe(true);
  });

  it("does not treat a targeted audience as a durable global broadcast", () => {
    expect(isUniversalCommunication({ audience: "all", courseId: "course_01" })).toBe(false);
    expect(isUniversalCommunication({ audience: "all", manualEmails: ["learner@example.test"] })).toBe(false);
    expect(isUniversalCommunication({ audience: "learners_started" })).toBe(false);
  });

  it("keeps a manually addressed communication visible regardless of the account role", () => {
    const filter = { audience: "all", manualEmails: ["Admin@Neopolis.dev", "learner@example.test"] };
    expect(isManuallyTargetedCommunication(filter, "admin@neopolis.dev")).toBe(true);
    expect(isManuallyTargetedCommunication(filter, "learner@example.test")).toBe(true);
    expect(isManuallyTargetedCommunication(filter, "other@example.test")).toBe(false);
  });
});

describe("learner communication inbox pagination", () => {
  const items = [
    { id: 3, subject: "Important", body: "<p>Orientation</p>", type: "announcement", isImportant: 1, sentAt: null, createdAt: new Date(), isRead: false, isAcknowledged: false },
    { id: 2, subject: "Bienvenue", body: "<p>Votre parcours</p>", type: "announcement", isImportant: 0, sentAt: null, createdAt: new Date(), isRead: true, isAcknowledged: false },
    { id: 1, subject: "Ressource", body: "<p>Finance</p>", type: "announcement", isImportant: 0, sentAt: null, createdAt: new Date(), isRead: false, isAcknowledged: false },
  ];

  it("filters by unread state and strips markup for inbox search", () => {
    const result = paginateLearnerCommunications(items, { search: "finance", readState: "unread", pageSize: 10 });
    expect(result.total).toBe(1);
    expect(result.items[0]?.id).toBe(1);
  });

  it("returns stable bounded pages for the inbox list", () => {
    const result = paginateLearnerCommunications(items, { page: 4, pageSize: 10 });
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.items).toHaveLength(3);
  });
});
