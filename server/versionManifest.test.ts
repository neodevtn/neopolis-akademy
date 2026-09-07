import { describe, expect, it } from "vitest";
import { versionFromApplicationDocument } from "./versionManifest";

describe("runtime version manifest", () => {
  it("produit une version stable pour le même document livré", () => {
    const document = '<script type="module" src="/assets/index-current.js"></script>';
    expect(versionFromApplicationDocument(document)).toBe(versionFromApplicationDocument(document));
  });

  it("change lorsque le document pointe vers un nouveau bundle", () => {
    const current = versionFromApplicationDocument('<script type="module" src="/assets/index-current.js"></script>');
    const next = versionFromApplicationDocument('<script type="module" src="/assets/index-next.js"></script>');
    expect(next).not.toBe(current);
  });
});
