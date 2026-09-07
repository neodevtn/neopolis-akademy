import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getInvitationByToken: vi.fn(),
  getUserByEmail: vi.fn(),
  setUserPasswordHash: vi.fn(),
  applyInvitationGroupsToUser: vi.fn(),
  markInvitationAccepted: vi.fn(),
  authenticateRequest: vi.fn(),
}));

vi.mock("./db", () => ({
  getInvitationByToken: mocks.getInvitationByToken,
  getUserByEmail: mocks.getUserByEmail,
  setUserPasswordHash: mocks.setUserPasswordHash,
  applyInvitationGroupsToUser: mocks.applyInvitationGroupsToUser,
  markInvitationAccepted: mocks.markInvitationAccepted,
}));
vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));

import { registerAuthRoutes } from "./auth";

const pendingInvitation = { email: "person@example.test", name: "Person", status: "pending", expiresAt: new Date(Date.now() + 60_000) };

async function post(path: string, body: object) {
  const app = express();
  app.use(express.json());
  registerAuthRoutes(app);
  const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  try {
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    return await fetch(`http://127.0.0.1:${port}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

describe("acceptation sécurisée d’invitation", () => {
  afterEach(() => vi.resetAllMocks());

  it("ne modifie jamais le mot de passe d’un compte existant depuis une invitation bearer", async () => {
    mocks.getInvitationByToken.mockResolvedValue(pendingInvitation);
    mocks.getUserByEmail.mockResolvedValue({ id: 42, openId: "local_existing", email: pendingInvitation.email, name: "Person" });
    const response = await post("/api/auth/accept-invitation", { token: "token_test", password: "mot-de-passe-solide" });
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ code: "EXISTING_ACCOUNT_LOGIN_REQUIRED" });
    expect(mocks.setUserPasswordHash).not.toHaveBeenCalled();
    expect(mocks.applyInvitationGroupsToUser).not.toHaveBeenCalled();
    expect(mocks.markInvitationAccepted).not.toHaveBeenCalled();
  });

  it("réclame une invitation seulement après authentification du compte correspondant", async () => {
    mocks.getInvitationByToken.mockResolvedValue(pendingInvitation);
    mocks.authenticateRequest.mockResolvedValue({ id: 42, email: pendingInvitation.email, name: "Person" });
    const response = await post("/api/auth/claim-invitation", { token: "token_test" });
    expect(response.status).toBe(200);
    expect(mocks.applyInvitationGroupsToUser).toHaveBeenCalledWith("token_test", 42);
    expect(mocks.markInvitationAccepted).toHaveBeenCalledWith("token_test");
  });

  it("refuse une revendication lorsque l’adresse authentifiée ne correspond pas", async () => {
    mocks.getInvitationByToken.mockResolvedValue(pendingInvitation);
    mocks.authenticateRequest.mockResolvedValue({ id: 43, email: "other@example.test", name: "Other" });
    const response = await post("/api/auth/claim-invitation", { token: "token_test" });
    expect(response.status).toBe(403);
    expect(mocks.applyInvitationGroupsToUser).not.toHaveBeenCalled();
    expect(mocks.markInvitationAccepted).not.toHaveBeenCalled();
  });
});
