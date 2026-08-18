import { describe, expect, it } from "vitest";
import { sendAdminNewApplicationEmail } from "./email";

describe("notification administrative de candidature", () => {
  it("n’appelle aucun fournisseur d’e-mail lorsqu’aucun administrateur actif n’a d’adresse", async () => {
    await expect(sendAdminNewApplicationEmail({
      to: [],
      applicationId: 1,
      firstName: "Test",
      lastName: "Candidate",
      country: "Tunisie",
      sector: "Technologie",
      currentRole: "Analyste",
      scoreTotal: 75,
    })).resolves.toBe(false);
  });
});
