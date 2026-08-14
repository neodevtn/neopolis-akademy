import { describe, expect, it } from "vitest";
import { tiptapDocumentToMarkdown } from "./wysiwygMarkdown";

describe("tiptapDocumentToMarkdown", () => {
  it("préserve les listes à puces et numérotées dans le Markdown publié", () => {
    const document = {
      type: "doc",
      content: [
        { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Premier point" }] }] }] },
        { type: "orderedList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Première étape" }] }] }] },
      ],
    };
    expect(tiptapDocumentToMarkdown(document)).toContain("- Premier point");
    expect(tiptapDocumentToMarkdown(document)).toContain("1. Première étape");
  });
});
