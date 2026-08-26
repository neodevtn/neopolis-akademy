import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const databaseSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");

describe("branchements Full access", () => {
  it("protège les trois flux de compte sans groupe", () => {
    expect(databaseSource).toContain('source: "account_upsert"');
    expect(databaseSource).toContain('source: "invitation_fallback"');
    expect(databaseSource).toContain('source: "access_fallback"');
  });

  it("conserve une trace durable pour les affectations automatiques et manuelles", () => {
    expect(databaseSource).toContain('actionType: "learner_group_full_access_assigned"');
    expect(databaseSource).toContain('actionType: "learner_group_full_access_manually_assigned"');
  });
});
