import { describe, expect, it } from "vitest";
import { canIssueTrainingCredential, isCertifyingTraining, isLearningPath, isMockExamEligible } from "./trainingEligibility";

describe("training eligibility", () => {
  const fde = { trainingFormat: "formation", contentKind: "learning_path", certificationStatus: "non_certifying", assessmentPolicy: "none", credentialPolicy: "none" };
  it("makes a non-certifying learning path ineligible for exams and credentials", () => {
    expect(isLearningPath(fde)).toBe(true);
    expect(isCertifyingTraining(fde)).toBe(false);
    expect(isMockExamEligible(fde)).toBe(false);
    expect(canIssueTrainingCredential(fde)).toBe(false);
  });
  it("keeps legacy certification-preparation behavior until explicitly migrated", () => {
    expect(isCertifyingTraining({ trainingFormat: "certification_preparation" })).toBe(true);
    expect(isMockExamEligible({ trainingFormat: "certification_preparation" })).toBe(true);
  });
});
