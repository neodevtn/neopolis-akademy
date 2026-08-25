import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("pipeline QA de publication", () => {
  const root = resolve(import.meta.dirname, "..");
  const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  const script = readFileSync(resolve(root, "scripts/run-publication-qa.mjs"), "utf8");

  it("expose une commande de prépublication dédiée", () => {
    expect(packageJson.scripts["qa:publish"]).toBe("node scripts/run-publication-qa.mjs");
  });

  it("bloque sur les validations structurelles et les matrices navigateur", () => {
    for (const stage of ["typescript", "course_validation", "unit_tests", "interaction_audit", "block_qa_desktop", "block_qa_mobile"]) {
      expect(script).toContain(`name: "${stage}"`);
    }
    expect(script).toContain("Publication QA bloquée");
  });
});
