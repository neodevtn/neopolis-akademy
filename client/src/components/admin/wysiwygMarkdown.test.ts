import { describe, expect, it } from "vitest";
import { normalizeEditableMarkdown, tiptapDocumentToMarkdown } from "./wysiwygMarkdown";

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

  it("convertit le HTML historique d’un communiqué en Markdown éditable", () => {
    expect(normalizeEditableMarkdown("<h2>Parcours</h2><p><strong>Orientation</strong> utile.</p>")).toBe("## Parcours\n\n**Orientation** utile.");
  });

  it("conserve le contenu déjà au format Markdown", () => {
    expect(normalizeEditableMarkdown("## Parcours\n\n**Orientation** utile.")).toBe("## Parcours\n\n**Orientation** utile.");
  });
});
