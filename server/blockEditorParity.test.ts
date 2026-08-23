import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { BLOCK_REGISTRY } from "../shared/blockRegistry";
import { getEditorFields } from "../client/src/components/admin/blockEditorParity";

const internalKeys = new Set(["type", "id", "label", "source_page", "order", "mediaUnavailable", "optionalMediaUnavailable"]);

function visit(value: unknown, output: Record<string, unknown>[]) {
  if (Array.isArray(value)) return value.forEach((item) => visit(item, output));
  if (!value || typeof value !== "object") return;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.type === "string") output.push(candidate);
  Object.values(candidate).forEach((item) => visit(item, output));
}

describe("course block editor parity", () => {
  it("exposes every persisted non-internal field of every published block", () => {
    const coursesDir = path.join(process.cwd(), "client/public/data/courses");
    const blocks: Record<string, unknown>[] = [];
    for (const file of fs.readdirSync(coursesDir).filter((name) => name.endsWith(".json"))) {
      visit(JSON.parse(fs.readFileSync(path.join(coursesDir, file), "utf8")), blocks);
    }
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      const declared = BLOCK_REGISTRY.find((definition) => definition.type === block.type)?.schema || [];
      const exposed = new Set(getEditorFields(block, declared).map((field) => field.key));
      for (const [key, value] of Object.entries(block)) {
        if (!internalKeys.has(key) && value !== undefined && value !== null && value !== "") expect(exposed).toContain(key);
      }
    }
  });
});
