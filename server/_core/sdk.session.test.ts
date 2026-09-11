import { describe, expect, it } from "vitest";

import { sdk } from "./sdk";

describe("jetons de session locaux", () => {
  it("préserve la version de session signée afin que les comptes dont les identifiants viennent de changer restent authentifiés", async () => {
    const token = await sdk.signSession({
      openId: "local_session_version_test",
      appId: "neopolis-akademy-test",
      name: "Compte de test",
      sessionVersion: 3,
    }, { expiresInMs: 60_000 });

    await expect(sdk.verifySession(token)).resolves.toMatchObject({
      openId: "local_session_version_test",
      sessionVersion: 3,
    });
  });
});
