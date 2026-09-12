import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminNotification: vi.fn(),
  createPrivateConversation: vi.fn(),
  changePrivateConversationStatus: vi.fn(),
  completePrivateNotificationState: vi.fn(),
  createPrivateNotificationState: vi.fn(),
  getPrivateConversationDetail: vi.fn(),
  getPrivateNotificationRecipients: vi.fn(),
  listAdminPrivateConversations: vi.fn(),
  listLearnerPrivateConversations: vi.fn(),
  markPrivateConversationRead: vi.fn(),
  publishPrivateMessagingEvent: vi.fn(),
  recordPrivateNotificationEvent: vi.fn(),
  sendPrivateMessage: vi.fn(),
  sendPrivateMessageNotificationEmail: vi.fn(),
}));

vi.mock("./notificationsDb", () => ({ createAdminNotification: mocks.createAdminNotification }));
vi.mock("./privateMessagingDb", () => ({
  createPrivateConversation: mocks.createPrivateConversation,
  changePrivateConversationStatus: mocks.changePrivateConversationStatus,
  completePrivateNotificationState: mocks.completePrivateNotificationState,
  createPrivateNotificationState: mocks.createPrivateNotificationState,
  getPrivateConversationDetail: mocks.getPrivateConversationDetail,
  getPrivateNotificationRecipients: mocks.getPrivateNotificationRecipients,
  listAdminPrivateConversations: mocks.listAdminPrivateConversations,
  listLearnerPrivateConversations: mocks.listLearnerPrivateConversations,
  markPrivateConversationRead: mocks.markPrivateConversationRead,
  recordPrivateNotificationEvent: mocks.recordPrivateNotificationEvent,
  sendPrivateMessage: mocks.sendPrivateMessage,
}));
vi.mock("./privateMessagingRealtime", () => ({ publishPrivateMessagingEvent: mocks.publishPrivateMessagingEvent }));
vi.mock("./email", () => ({ sendPrivateMessageNotificationEmail: mocks.sendPrivateMessageNotificationEmail }));

import { privateMessagingRouter } from "./privateMessagingRouter";

const learner = { id: 71, name: "Apprenant", email: "learner@example.test", role: "user" } as any;
const admin = { id: 72, name: "Administrateur", email: "admin@example.test", role: "admin" } as any;
const callerFor = (user: any) => privateMessagingRouter.createCaller({ user, req: {} as any, res: {} as any });

describe("routeur de messagerie privée", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listLearnerPrivateConversations.mockResolvedValue([]);
    mocks.listAdminPrivateConversations.mockResolvedValue([]);
    mocks.getPrivateNotificationRecipients.mockResolvedValue([]);
    mocks.createPrivateConversation.mockResolvedValue({ conversationId: 501, messageId: 601, authorRole: "learner" });
    mocks.changePrivateConversationStatus.mockResolvedValue({ conversation: { id: 501, learnerId: learner.id, status: "closed" }, changed: true });
    mocks.markPrivateConversationRead.mockResolvedValue({ success: true });
  });

  it("isole la liste apprenant sur son propre identifiant", async () => {
    await expect(callerFor(learner).getMine()).resolves.toEqual([]);
    expect(mocks.listLearnerPrivateConversations).toHaveBeenCalledWith(learner.id);
  });

  it("refuse l’inbox et la création au nom d’un apprenant pour un rôle non administratif", async () => {
    await expect(callerFor(learner).getAdminInbox()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(callerFor(learner).createForLearner({ learnerId: 99, subject: "Sujet valide", body: "Message valide", source: "admin" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.createPrivateConversation).not.toHaveBeenCalled();
  });

  it("autorise l’administrateur à cibler le dossier d’un apprenant côté serveur", async () => {
    await expect(callerFor(admin).getAdminInbox({ learnerId: learner.id, status: "open", limit: 20 })).resolves.toEqual([]);
    expect(mocks.listAdminPrivateConversations).toHaveBeenCalledWith({ userId: admin.id, role: admin.role }, { learnerId: learner.id, status: "open", limit: 20 });
  });

  it("accepte un signalement apprenant, le persiste avant diffusion et notifie seulement après création", async () => {
    await expect(callerFor(learner).createMine({ subject: "Signalement de problème", body: "Le lecteur reste bloqué après validation.", source: "problem_report" })).resolves.toMatchObject({ conversationId: 501 });
    expect(mocks.createPrivateConversation).toHaveBeenCalledWith(expect.objectContaining({ learnerId: learner.id, source: "problem_report", actor: { userId: learner.id, role: learner.role } }));
    expect(mocks.publishPrivateMessagingEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "conversation.created", conversationId: 501, learnerId: learner.id, audience: "admins" }));
  });

  it("rejette les sujets et messages hors des limites du contrat partagé", async () => {
    await expect(callerFor(learner).createMine({ subject: "ok", body: "message", source: "learner" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(callerFor(learner).createMine({ subject: "Sujet valide", body: "", source: "learner" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
