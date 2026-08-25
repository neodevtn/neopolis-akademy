import { describe, expect, it } from "vitest";
import { normalizeInstructionText } from "./displayText";

describe("normalizeInstructionText", () => {
  it("renders escaped instructional line breaks without changing ordinary text", () => {
    expect(normalizeInstructionText("Une ligne\\nUne autre ligne")).toBe("Une ligne\nUne autre ligne");
    expect(normalizeInstructionText("Texte inchangé")).toBe("Texte inchangé");
    expect(normalizeInstructionText(null)).toBe("");
  });
});
