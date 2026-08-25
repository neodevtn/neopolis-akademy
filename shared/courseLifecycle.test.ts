import { describe, expect, it } from "vitest";
import { canLearnerOpenLifecycle, lifecycleStatusLabel } from "./courseLifecycle";

describe("cycle de vie des cours", () => {
  it("autorise uniquement les cours actifs pour les apprenants", () => {
    expect(canLearnerOpenLifecycle("active")).toBe(true);
    expect(canLearnerOpenLifecycle("disabled")).toBe(false);
    expect(canLearnerOpenLifecycle("archived")).toBe(false);
  });

  it("reste rétrocompatible lorsque le cours n’a pas encore d’état persistant", () => {
    expect(canLearnerOpenLifecycle(undefined)).toBe(true);
    expect(lifecycleStatusLabel("archived")).toBe("Archivé");
  });
});
