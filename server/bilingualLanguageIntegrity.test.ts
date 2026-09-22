import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");

describe("published bilingual learner-language integrity", () => {
  it("contains no French learner prose in English fields, English learner prose in French fields, or ellipsized translations", () => {
    const output = execFileSync("node", ["scripts/audit-bilingual-language-integrity.mjs", "--strict"], {
      cwd: root,
      encoding: "utf8",
    });
    expect(output).toContain('"integrityFindings": 0');
  });
});
