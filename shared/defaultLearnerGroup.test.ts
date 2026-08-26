import { describe, expect, it } from "vitest";
import { getNewLearnerGroupMemberIds, needsDefaultLearnerGroup } from "./defaultLearnerGroup";

describe("needsDefaultLearnerGroup", () => {
  it("affecte Full access uniquement lorsqu’aucun groupe n’existe", () => {
    expect(needsDefaultLearnerGroup(0)).toBe(true);
    expect(needsDefaultLearnerGroup(1)).toBe(false);
    expect(needsDefaultLearnerGroup(3)).toBe(false);
  });
});

describe("getNewLearnerGroupMemberIds", () => {
  it("journalise uniquement les nouvelles affectations manuelles", () => {
    expect(getNewLearnerGroupMemberIds([4, 8], [8, 11, 11, 15])).toEqual([11, 15]);
  });
});
