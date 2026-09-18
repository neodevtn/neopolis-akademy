import { describe, expect, it } from "vitest";
import { sentryDsn } from "../client/src/lib/sentryClient";

const SENTRY_PROJECT_ENDPOINT =
  "https://sentry.neopolis-dev.com/api/0/projects/neopolis-development/neopolis-akademy/";

describe("Sentry on-premise feedback integration credential", () => {
  it("uses a canonical Sentry project endpoint", () => {
    expect(new URL(sentryDsn).pathname).toBe("/102");
  });

  it(
    "authentifie le jeton d’intégration à portée minimale auprès du projet Neopolis Akademy",
    async () => {
      const token = process.env.SENTRY_FEEDBACK_INTEGRATION_TOKEN;
      expect(token, "Le jeton Sentry sécurisé doit être présent côté serveur").toBeTruthy();

      const response = await fetch(SENTRY_PROJECT_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      expect(response.status, "Le jeton Sentry doit pouvoir lire le projet autorisé").toBe(200);
      const project = (await response.json()) as { slug?: string };
      expect(project.slug).toBe("neopolis-akademy");
    },
    15_000,
  );
});
