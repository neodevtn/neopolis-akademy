import { describe, expect, it } from "vitest";
import { preparePrivateMessageAttachmentUpload } from "./privateMessagingAttachments";

function base64(bytes: number[]) {
  return Buffer.from(bytes).toString("base64");
}

describe("pièces jointes de messagerie privée", () => {
  it("accepte une image PNG dont la signature correspond au type déclaré", () => {
    const prepared = preparePrivateMessageAttachmentUpload({
      filename: "capture écran.png",
      mimeType: "image/png",
      base64: base64([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]),
    });
    expect(prepared.mimeType).toBe("image/png");
    expect(prepared.filename).toBe("capture_ecran.png");
  });

  it("refuse un contenu dont les octets ne correspondent pas au type MIME annoncé", () => {
    expect(() => preparePrivateMessageAttachmentUpload({
      filename: "fichier.pdf",
      mimeType: "application/pdf",
      base64: base64([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    })).toThrow("ne correspond pas au type déclaré");
  });

  it("refuse les formats non autorisés avant tout stockage", () => {
    expect(() => preparePrivateMessageAttachmentUpload({
      filename: "document.svg",
      mimeType: "image/svg+xml" as never,
      base64: Buffer.from("<svg></svg>").toString("base64"),
    })).toThrow("Seules les images et les PDF");
  });
});
