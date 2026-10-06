import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  getExamDefinition: vi.fn(),
  isCertificationComplete: vi.fn(),
  getCertificationLessonCounts: vi.fn(),
  sendEmail: vi.fn(),
  logAdminActivity: vi.fn(),
}));
vi.mock("./db", () => ({ getDb: mocks.getDb, isCertificationComplete: mocks.isCertificationComplete }));
vi.mock("./examDefinition", () => ({ getExamDefinition: mocks.getExamDefinition, getCertificationLessonCounts: mocks.getCertificationLessonCounts }));
vi.mock("./directExamInvitationEmail", () => ({ sendDirectExamInvitationEmail: mocks.sendEmail }));
vi.mock("./adminDb", () => ({ logAdminActivity: mocks.logAdminActivity }));

import { directExamRouter, getDirectExamAccess, safeExamInvitationOrigin } from "./directExamRouter";
import { acceptDirectExamInvitation, createDirectExamInvitation, examInvitationDestination, getDirectExamInvitationByToken, hashExamInvitationToken, registerDirectExamGuest } from "./directExamInvitations";
import { learnerGroupMemberships, learnerProfiles, users } from "../drizzle/schema";

const CERT = "claude_certified_developer_foundations";
const TOKEN = "1".repeat(64);
const invite = { id: 19, email: "candidate@example.test", certificationId: CERT, tokenHash: hashExamInvitationToken(TOKEN), status: "pending" as const, invitedBy: 1 };
function fakeDb(selections: unknown[][], affectedRows = 1) {
  const values = vi.fn(() => ({ onDuplicateKeyUpdate: async () => [{ affectedRows: 1 }] }));
  const select = vi.fn(() => ({ from: () => ({ where: () => ({ limit: async () => selections.shift() ?? (values.mock.calls.length ? [{ id: 19, status: "pending", tokenHash: values.mock.calls[0][0].tokenHash }] : []) }) }) }));
  const update = vi.fn(() => ({ set: () => ({ where: async () => [{ affectedRows }] }) }));
  const insert = vi.fn(() => ({ values }));
  mocks.getDb.mockResolvedValue({ select, update, insert });
  return { select, update, insert, values };
}
function context(role: "admin" | "user", id: number): TrpcContext {
  return { user: { id, role, email: "candidate@example.test", openId: `test_${id}`, name: "Test", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), loginMethod: "email" }, req: { headers: {}, protocol: "https" }, res: {} } as TrpcContext;
}

describe("accès direct nominatif à un examen (sans expiration automatique)", () => {
  beforeEach(() => { vi.resetAllMocks(); mocks.getExamDefinition.mockResolvedValue({ isPublished: true }); mocks.getCertificationLessonCounts.mockReturnValue({ course_1: 1 }); mocks.isCertificationComplete.mockResolvedValue(false); });

  it("rejette les origines externes et ne redirige jamais vers un autre site", () => {
    expect(() => safeExamInvitationOrigin("https://evil.example", true)).toThrow();
    expect(() => safeExamInvitationOrigin("https://akademy.neodev.click.evil.example", true)).toThrow();
    expect(safeExamInvitationOrigin("https://akademy.neodev.click", true)).toBe("https://akademy.neodev.click");
    expect(safeExamInvitationOrigin("https://neopacademy-6qa7lvjq.manus.space", true)).toBe("https://akademy.neodev.click");
    expect(() => examInvitationDestination("../admin")).toThrow();
  });

  it("refuse un non-administrateur avant tout accès en base", async () => {
    await expect(directExamRouter.createCaller(context("user", 2)).create({ email: "candidate@example.test", certificationId: CERT, origin: "https://akademy.neodev.click", language: "fr" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(directExamRouter.createCaller(context("user", 2)).list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(directExamRouter.createCaller(context("user", 2)).revoke({ id: 19 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.getDb).not.toHaveBeenCalled();
  });

  it("ne journalise une révocation que si un accès a effectivement changé d’état", async () => {
    fakeDb([], 0);
    await expect(directExamRouter.createCaller(context("admin", 1)).revoke({ id: 19 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(mocks.logAdminActivity).not.toHaveBeenCalled();
    fakeDb([], 1);
    await expect(directExamRouter.createCaller(context("admin", 1)).revoke({ id: 19 })).resolves.toBe(true);
    expect(mocks.logAdminActivity).toHaveBeenCalledWith(expect.objectContaining({ action: "revoke_direct_exam_invitation", targetId: 19 }));
  });

  it("crée une invitation sans expiresAt, avec jeton haché, pour un compte existant ou nouveau", async () => {
    const db = fakeDb([[{ id: 2, blocked: 0, role: "user" }], []]);
    const result = await createDirectExamInvitation({ email: "  CANDIDATE@example.test ", certificationId: CERT, invitedBy: 1 });
    expect(result).toMatchObject({ email: "candidate@example.test", certificationId: CERT, existingAccount: true });
    expect(result.token).toMatch(/^[0-9a-f]{64}$/);
    expect(db.values).toHaveBeenCalledWith(expect.objectContaining({ email: "candidate@example.test", tokenHash: hashExamInvitationToken(result.token), status: "pending" }));
    expect(db.values.mock.calls[0][0]).not.toHaveProperty("expiresAt");
    expect(JSON.stringify(db.values.mock.calls[0][0])).not.toContain(result.token);
  });

  it("n’accepte qu’une correspondance stricte du courriel du compte connecté", async () => {
    const db = fakeDb([[invite], [{ email: "another@example.test", blocked: 0 }]]);
    await expect(acceptDirectExamInvitation({ token: TOKEN, userId: 42 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.update).not.toHaveBeenCalled();
  });

  it("accepte pour le compte destinataire sans durée limite et interdit la course avec une révocation", async () => {
    const db = fakeDb([[invite], [{ email: "candidate@example.test", blocked: 0 }]], 1);
    await expect(acceptDirectExamInvitation({ token: TOKEN, userId: 42 })).resolves.toMatchObject({ certificationId: CERT, destination: `/mock-exam/${CERT}` });
    expect(db.update).toHaveBeenCalledTimes(1);
    fakeDb([[invite], [{ email: "candidate@example.test", blocked: 0 }]], 0);
    await expect(acceptDirectExamInvitation({ token: TOKEN, userId: 42 })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("n’accorde pas de droit avec un jeton invalide ou une invitation révoquée", async () => {
    fakeDb([[{ ...invite, status: "revoked" }]]);
    await expect(acceptDirectExamInvitation({ token: TOKEN, userId: 42 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(await getDirectExamInvitationByToken("short-token")).toBeNull();
  });

  it("débloque l’examen seulement avec invitation acceptée, sinon garde le verrou des cours", async () => {
    fakeDb([[], [{ id: 19 }]]);
    const normal = await getDirectExamAccess(42, CERT);
    const invited = await getDirectExamAccess(42, CERT);
    expect(normal).toMatchObject({ allowed: false, direct: false });
    expect(invited).toMatchObject({ allowed: true, direct: true });
    expect(mocks.isCertificationComplete).toHaveBeenCalledTimes(1);
  });

  it("n’inscrit pas un guest si le compte existe déjà, et ne consomme pas l’invitation", async () => {
    const tx = { select: () => ({ from: () => ({ where: () => ({ limit: async () => [{ id: 42 }] }) }) }), insert: vi.fn(), update: vi.fn() };
    mocks.getDb.mockResolvedValue({ select: () => ({ from: () => ({ where: () => ({ limit: async () => [invite] }) }) }), transaction: (fn: (tx: typeof tx) => Promise<unknown>) => fn(tx) });
    await expect(registerDirectExamGuest({ token: TOKEN, firstName: "Ada", lastName: "Lovelace", phone: "+21612345678", passwordHash: "secret-hash" })).rejects.toMatchObject({ code: "CONFLICT" });
    expect(tx.insert).not.toHaveBeenCalled();
    expect(tx.update).not.toHaveBeenCalled();
  });

  it("attribue au guest le rôle apprenant et le groupe standard dans la même transaction que son profil", async () => {
    const selections = [[invite], [], [{ id: 7 }]];
    const inserted: Array<{ table: unknown; values: unknown }> = [];
    const select = () => ({ from: () => ({ where: () => ({ limit: async () => selections.shift() || [] }) }) });
    const tx = {
      select,
      insert: (table: unknown) => ({ values: async (values: unknown) => { inserted.push({ table, values }); return [{ insertId: 88 }]; } }),
      update: () => ({ set: () => ({ where: async () => [{ affectedRows: 1 }] }) }),
    };
    mocks.getDb.mockResolvedValue({ select, transaction: async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx) });
    const result = await registerDirectExamGuest({ token: TOKEN, firstName: "Ada", lastName: "Lovelace", phone: "+21612345678", passwordHash: "hash-verified-by-auth-route" });
    expect(result.destination).toBe(`/mock-exam/${CERT}`);
    expect(inserted.find((entry) => entry.table === users)?.values).toMatchObject({ role: "user", email: invite.email, invitedBy: expect.any(Number) });
    expect(inserted.find((entry) => entry.table === learnerProfiles)?.values).toMatchObject({ userId: 88, firstName: "Ada", lastName: "Lovelace", phone: "+21612345678" });
    expect(inserted.find((entry) => entry.table === learnerGroupMemberships)?.values).toMatchObject({ userId: 88, groupId: 7 });
  });
});
