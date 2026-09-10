import { describe, expect, it } from "vitest";
import { validateCatalogIndex } from "./catalogValidation";

const valid = { certifications: [{ id: "cert", group: "group" }], courses: [{ id: "course", certId: "cert" }], categories: [{ id: "group" }] };

describe("catalog validation", () => {
  it("accepts consistent certification, course and category links", () => expect(validateCatalogIndex(valid)).toBeNull());
  it("accepts internal visual attributes and rejects external image URLs", () => {
    expect(validateCatalogIndex({ ...valid, certifications: [{ ...valid.certifications[0], visualAssets: { cardPath: "/api/assets/card.png", socialPath: "/manus-storage/social.png" } }] })).toBeNull();
    expect(validateCatalogIndex({ ...valid, certifications: [{ ...valid.certifications[0], visualAssets: { socialPath: "https://external.example/image.png" } }] })).toContain("visuel invalide");
  });
  it("rejects a duplicate category", () => expect(validateCatalogIndex({ ...valid, categories: [{ id: "group" }, { id: "group" }] })).toContain("catégorie"));
  it("rejects an unknown certification referenced by a course", () => expect(validateCatalogIndex({ ...valid, courses: [{ id: "course", certId: "missing" }] })).toContain("certification absente"));
});
