import { describe, expect, it } from "vitest";

describe("Google Analytics 4 configuration", () => {
  it("expose un identifiant de mesure valide sans dépendre de la disponibilité réseau de Google", () => {
    const measurementId = process.env.VITE_GA4_MEASUREMENT_ID;
    expect(measurementId).toMatch(/^G-[A-Z0-9]{8,}$/);
  });
});
