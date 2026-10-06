import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";

const mocks = vi.hoisted(() => ({
  getInvitation: vi.fn(), registerGuest: vi.fn(), acceptInvitation: vi.fn(),
  getUserByEmail: vi.fn(), authenticate: vi.fn(), createSessionToken: vi.fn(),
}));
vi.mock("./db", () => ({ getUserByEmail: mocks.getUserByEmail }));
vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.authenticate, createSessionToken: mocks.createSessionToken } }));
vi.mock("./directExamInvitations", () => ({
  getDirectExamInvitationByToken: mocks.getInvitation,
  registerDirectExamGuest: mocks.registerGuest,
  acceptDirectExamInvitation: mocks.acceptInvitation,
  examInvitationTitle: () => "Claude Developer",
  examInvitationDestination: () => "/mock-exam/claude_certified_developer_foundations",
}));
import { registerAuthRoutes } from "./auth";
const token = "f".repeat(64);
const invitation = { status: "pending", email: "guest@example.test", certificationId: "claude_certified_developer_foundations", name: null };

async function request(path: string, method: "GET" | "POST", body?: object) {
  const app = express(); app.use(express.json()); registerAuthRoutes(app);
  const listener = await new Promise<ReturnType<typeof app.listen>>((resolve) => { const server = app.listen(0, "127.0.0.1", () => resolve(server)); });
  try {
    const address = listener.address();
    const port = typeof address === "object" && address ? address.port : 0;
    return await fetch(`http://127.0.0.1:${port}${path}`, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  } finally { await new Promise<void>((resolve) => listener.close(() => resolve())); }
}

describe("inscription et activation d’une invitation d’examen", () => {
  afterEach(() => vi.resetAllMocks());
  it("valide une invitation sans expiresAt ni divulgation du jeton ou d’un corrigé", async () => {
    mocks.getInvitation.mockResolvedValue(invitation);
    mocks.getUserByEmail.mockResolvedValue(null);
    const response = await request(`/api/auth/validate-exam-invitation?token=${token}`, "GET");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toMatchObject({ status: "pending", email: "guest@example.test", existingAccount: false });
    expect(JSON.stringify(data)).not.toContain(token);
  });
  it("rejette le lien révoqué et tout token non conforme", async () => {
    mocks.getInvitation.mockResolvedValue({ ...invitation, status: "revoked" });
    expect((await request(`/api/auth/validate-exam-invitation?token=${token}`, "GET")).status).toBe(410);
  });
  it("refuse les profils invités incomplets avant de créer un compte", async () => {
    const response = await request("/api/auth/register-exam-guest", "POST", { token, password: "a-good-password" });
    expect(response.status).toBe(400);
    expect(mocks.registerGuest).not.toHaveBeenCalled();
  });
  it("crée une session apprenant seulement après profil complet et transaction réussie", async () => {
    mocks.registerGuest.mockResolvedValue({ openId: "local_guest_1", name: "Ada Lovelace", destination: "/mock-exam/claude_certified_developer_foundations" });
    mocks.createSessionToken.mockResolvedValue("session-token");
    const response = await request("/api/auth/register-exam-guest", "POST", { token, firstName: "Ada", lastName: "Lovelace", phone: "+21612345678", password: "a-good-password" });
    expect(response.status).toBe(200);
    expect((await response.json()).destination).toBe("/mock-exam/claude_certified_developer_foundations");
    expect(response.headers.get("set-cookie")).toContain("session-token");
    expect(mocks.registerGuest).toHaveBeenCalledWith(expect.objectContaining({ token, firstName: "Ada", phone: "+21612345678", passwordHash: expect.any(String) }));
    expect(mocks.createSessionToken).toHaveBeenCalledTimes(1);
  });
  it("ne revendique jamais un accès pour un compte qui n’est pas le destinataire", async () => {
    mocks.authenticate.mockResolvedValue({ id: 51, email: "other@example.test" });
    mocks.acceptInvitation.mockRejectedValue(new TRPCError({ code: "FORBIDDEN", message: "Mauvais compte" }));
    const response = await request("/api/auth/claim-exam-invitation", "POST", { token });
    expect(response.status).toBe(403);
    expect(mocks.acceptInvitation).toHaveBeenCalledWith({ token, userId: 51 });
  });
});
