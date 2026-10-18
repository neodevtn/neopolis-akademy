import { describe, expect, it } from "vitest";
import { courseBelongsToTraining, getCourseOrderInTraining, getCoursesForTraining } from "./courseTrainingMembership";

describe("course training memberships", () => {
  const shared = { id: "shared", certId: "source", order: 1, trainingMemberships: [{ certificationId: "target", order: 4 }] };
  it("keeps a canonical owner while exposing an ordered secondary training membership", () => {
    expect(courseBelongsToTraining(shared, "source")).toBe(true);
    expect(courseBelongsToTraining(shared, "target")).toBe(true);
    expect(getCourseOrderInTraining(shared, "source")).toBe(1);
    expect(getCourseOrderInTraining(shared, "target")).toBe(4);
  });
  it("orders a training from its contextual membership, never from the owner order", () => {
    const courses = [shared, { id: "core", certId: "target", order: 1 }];
    expect(getCoursesForTraining(courses, "target").map((course) => course.id)).toEqual(["core", "shared"]);
  });
});
