import { describe, expect, it } from "vitest";
import { isSequentialCourseCardLocked, isSequentialCourseRouteLocked, isSequentialLessonLocked } from "./learningAccess";

describe("sequential learning access", () => {
  it("keeps a future, unstarted course locked for learners", () => {
    expect(isSequentialCourseCardLocked({
      previousCourseCompleted: false,
      courseCompleted: false,
      courseStarted: false,
      role: "user",
    })).toBe(true);
    expect(isSequentialCourseRouteLocked({ previousCourseCompleted: false, role: "user" })).toBe(true);
  });

  it("lets administrators open any course without changing learner locking", () => {
    expect(isSequentialCourseCardLocked({
      previousCourseCompleted: false,
      courseCompleted: false,
      courseStarted: false,
      role: "admin",
    })).toBe(false);
    expect(isSequentialCourseRouteLocked({ previousCourseCompleted: false, role: "admin" })).toBe(false);
  });

  it("lets administrators open a future lesson while keeping it locked for learners", () => {
    expect(isSequentialLessonLocked({ lessonIndex: 2, nextUnlocked: 0, role: "user" })).toBe(true);
    expect(isSequentialLessonLocked({ lessonIndex: 2, nextUnlocked: 0, role: "admin" })).toBe(false);
  });

  it("keeps admins-apprenants on the learner sequence", () => {
    expect(isSequentialCourseCardLocked({
      previousCourseCompleted: false,
      courseCompleted: false,
      courseStarted: false,
      role: "admin_learner",
    })).toBe(true);
    expect(isSequentialCourseRouteLocked({ previousCourseCompleted: false, role: "admin_learner" })).toBe(true);
    expect(isSequentialLessonLocked({ lessonIndex: 2, nextUnlocked: 0, role: "admin_learner" })).toBe(true);
  });

  it("keeps completed and in-progress learner cards accessible", () => {
    expect(isSequentialCourseCardLocked({
      previousCourseCompleted: false,
      courseCompleted: true,
      courseStarted: false,
      role: "user",
    })).toBe(false);
    expect(isSequentialCourseCardLocked({
      previousCourseCompleted: false,
      courseCompleted: false,
      courseStarted: true,
      role: "user",
    })).toBe(false);
  });
});
