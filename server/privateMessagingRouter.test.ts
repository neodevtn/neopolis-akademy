import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminNotification: vi.fn(),
  createPrivateConversation: vi.fn(),
  changePrivateConversationStatus: vi.fn(),
  completePrivateNotificationState: vi.fn(),
  createPrivateNotificationState: vi.fn(),
  getPrivateConversationDetail: vi.fn(),
  getIntegrityReviewConversationForLearner: vi.fn(),
  getPrivateMessageDeliveryPreferences: vi.fn(),
  getPrivateMessageDeliveryPreferencesForUsers: vi.fn(),
  getPrivateMessagingNotificationCenter: vi.fn(),
  getIntegrityReviewQueue: vi.fn(),
  getPrivateNotificationRecipients: vi.fn(),
  listAdminPrivateConversations: vi.fn(),
  listLearnerPrivateConversations: vi.fn(),
  markPrivateConversationRead: vi.fn(),
  publishPrivateMessagingEvent: vi.fn(),
  recordPrivateNotificationEvent: vi.fn(),
  sendPrivateMessage: vi.fn(),
  sendPrivateMessageNotificationEmail: vi.fn(),
  updatePrivateMessageDeliveryPreferences: vi.fn(),
}));

vi.mock("./notificationsDb", () => ({ createAdminNotification: mocks.createAdminNotification }));
vi.mock("./privateMessagingDb", () => ({
  createPrivateConversation: mocks.createPrivateConversation,
  changePrivateConversationStatus: mocks.changePrivateConversationStatus,
  completePrivateNotificationState: mocks.completePrivateNotificationState,
  createPrivateNotificationState: mocks.createPrivateNotificationState,
  getPrivateConversationDetail: mocks.getPrivateConversationDetail,
  getIntegrityReviewConversationForLearner: mocks.getIntegrityReviewConversationForLearner,
  getPrivateMessageDeliveryPreferences: mocks.getPrivateMessageDeliveryPreferences,
  getPrivateMessageDeliveryPreferencesForUsers: mocks.getPrivateMessageDeliveryPreferencesForUsers,
  getPrivateMessagingNotificationCenter: mocks.getPrivateMessagingNotificationCenter,
  getPrivateNotificationRecipients: mocks.getPrivateNotificationRecipients,
  listAdminPrivateConversations: mocks.listAdminPrivateConversations,
  listLearnerPrivateConversations: mocks.listLearnerPrivateConversations,
  markPrivateConversationRead: mocks.markPrivateConversationRead,
  recordPrivateNotificationEvent: mocks.recordPrivateNotificationEvent,
  sendPrivateMessage: mocks.sendPrivateMessage,
  updatePrivateMessageDeliveryPreferences: mocks.updatePrivateMessageDeliveryPreferences,
}));
vi.mock("./privateMessagingRealtime", () => ({ publishPrivateMessagingEvent: mocks.publishPrivateMessagingEvent }));
vi.mock("./email", () => ({ sendPrivateMessageNotificationEmail: mocks.sendPrivateMessageNotificationEmail }));
vi.mock("./integrityService", () => ({ getIntegrityReviewQueue: mocks.getIntegrityReviewQueue }));

import { privateMessagingRouter } from "./privateMessagingRouter";

const learner = { id: 71, name: "Apprenant", email: "learner@example.test", role: "user" } as any;
const admin = { id: 72, name: "Administrateur", email: "admin@example.test", role: "admin" } as any;
const callerFor = (user: any) => privateMessagingRouter.createCaller({ user, req: {} as any, res: {} as any });

describe("routeur de messagerie privée", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listLearnerPrivateConversations.mockResolvedValue([]);
    mocks.listAdminPrivateConversations.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 25, totalPages: 1 });
    mocks.getPrivateNotificationRecipients.mockResolvedValue([]);
    mocks.getPrivateMessageDeliveryPreferences.mockResolvedValue({ webEnabled: true, emailEnabled: true, soundEnabled: true });
    mocks.getPrivateMessageDeliveryPreferencesForUsers.mockResolvedValue(new Map());
    mocks.getPrivateMessagingNotificationCenter.mockResolvedValue([]);
    mocks.getIntegrityReviewQueue.mockResolvedValue([]);
    mocks.getIntegrityReviewConversationForLearner.mockResolvedValue(null);
    mocks.updatePrivateMessageDeliveryPreferences.mockResolvedValue({ webEnabled: false, emailEnabled: true, soundEnabled: false });
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
    await expect(callerFor(admin).getAdminInbox({ learnerId: learner.id, status: "open", page: 2, pageSize: 20 })).resolves.toMatchObject({ total: 0, page: 1 });
    expect(mocks.listAdminPrivateConversations).toHaveBeenCalledWith({ userId: admin.id, role: admin.role }, { learnerId: learner.id, status: "open", page: 2, pageSize: 20 });
  });

  it("accepte un signalement apprenant, le persiste avant diffusion et notifie seulement après création", async () => {
    await expect(callerFor(learner).createMine({ subject: "Signalement de problème", body: "Le lecteur reste bloqué après validation.", source: "problem_report" })).resolves.toMatchObject({ conversationId: 501 });
    expect(mocks.createPrivateConversation).toHaveBeenCalledWith(expect.objectContaining({ learnerId: learner.id, source: "problem_report", actor: { userId: learner.id, role: learner.role } }));
    expect(mocks.publishPrivateMessagingEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "conversation.created", conversationId: 501, learnerId: learner.id, audience: "admins" }));
  });

  it("renvoie et met à jour les préférences du seul utilisateur authentifié", async () => {
    await expect(callerFor(learner).getNotificationPreferences()).resolves.toMatchObject({ emailEnabled: true });
    await callerFor(learner).updateNotificationPreferences({ webEnabled: false, emailEnabled: true, soundEnabled: false });
    expect(mocks.getPrivateMessageDeliveryPreferences).toHaveBeenCalledWith(learner.id);
    expect(mocks.updatePrivateMessageDeliveryPreferences).toHaveBeenCalledWith(learner.id, { webEnabled: false, emailEnabled: true, soundEnabled: false });
  });

  it("réserve la file de clarification aux administrateurs et exclut les revues écartées", async () => {
    mocks.getIntegrityReviewQueue.mockResolvedValue([
      { id: learner.id, name: learner.name, email: learner.email, assessment: { riskScore: 55, signals: [{ id: "rapid", label: "Activité atypique" }] }, review: { status: "review_required", reviewedAt: null } },
      { id: 99, name: "Écarté", email: "dismissed@example.test", assessment: { riskScore: 80, signals: [{ id: "ignored", label: "Écarté" }] }, review: { status: "dismissed", reviewedAt: null } },
    ]);
    await expect(callerFor(learner).getIntegrityClarificationQueue()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(callerFor(admin).getIntegrityClarificationQueue()).resolves.toEqual([expect.objectContaining({ learnerId: learner.id, riskScore: 55, signalCount: 1 })]);
  });

  it("crée seulement les fils de revue sans doublon pour les apprenants à examiner", async () => {
    mocks.getIntegrityReviewQueue.mockResolvedValue([
      { id: learner.id, name: learner.name, email: learner.email, assessment: { riskScore: 55, signals: [{ id: "rapid", label: "Activité atypique" }] }, review: { status: "review_required", reviewedAt: null } },
      { id: 99, name: "Déjà contacté", email: "existing@example.test", assessment: { riskScore: 80, signals: [{ id: "existing", label: "Activité atypique" }] }, review: { status: "confirmed", reviewedAt: null } },
      { id: 100, name: "Écarté", email: "dismissed@example.test", assessment: { riskScore: 80, signals: [{ id: "dismissed", label: "Écarté" }] }, review: { status: "dismissed", reviewedAt: null } },
    ]);
    mocks.getIntegrityReviewConversationForLearner.mockImplementation(async (id: number) => id === 99 ? { id: 123 } : null);
    await expect(callerFor(learner).createIntegrityClarificationConversations()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(callerFor(admin).createIntegrityClarificationConversations()).resolves.toEqual({ total: 2, created: 1, skipped: 1 });
    expect(mocks.createPrivateConversation).toHaveBeenCalledWith(expect.objectContaining({ learnerId: learner.id, source: "integrity_review", actor: { userId: admin.id, role: admin.role } }));
    expect(mocks.createPrivateConversation).not.toHaveBeenCalledWith(expect.objectContaining({ learnerId: 100 }));
  });

  it("rejette les sujets et messages hors des limites du contrat partagé", async () => {
    await expect(callerFor(learner).createMine({ subject: "ok", body: "message", source: "learner" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(callerFor(learner).createMine({ subject: "Sujet valide", body: "", source: "learner" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
