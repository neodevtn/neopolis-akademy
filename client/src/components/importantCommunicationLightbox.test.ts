import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("communication importante responsive", () => {
  it("réserve une zone défilante au contenu et conserve les actions obligatoires dans le dialogue", () => {
    const component = fs.readFileSync("client/src/components/ImportantCommunicationLightbox.tsx", "utf8");

    expect(component).toContain("flex max-h-[88vh] flex-col overflow-hidden");
    expect(component).toContain("min-h-0 flex-1 overflow-y-auto");
    expect(component).toContain("flex shrink-0 cursor-pointer");
    expect(component).toContain("w-full shrink-0 gap-2");
  });
});
