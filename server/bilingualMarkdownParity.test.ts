import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");

describe("published bilingual Markdown parity", () => {
  it("preserves learner-facing headings, lists, emphasis, code blocks, and tables across English and French", () => {
    const output = execFileSync("node", ["scripts/audit-bilingual-markdown-structure.mjs", "--strict"], {
      cwd: root,
      encoding: "utf8",
    });
    expect(output).toContain('"markdownParityFindings": 0');
  });
});
