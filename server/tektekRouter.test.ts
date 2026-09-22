import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  userCanAccessCourse: vi.fn(),
  getOrCreateTekTekConversation: vi.fn(),
  getTekTekRequestsInLastHour: vi.fn(),
  getTekTekUsageOverview: vi.fn(),
  listTekTekConversationsForReview: vi.fn(),
  getTekTekConversationForReview: vi.fn(),
  listTekTekBudgetSettings: vi.fn(),
  listTekTekMessages: vi.fn(),
  upsertTekTekBudgetSetting: vi.fn(),
  appendTekTekMessage: vi.fn(),
  getTekTekTrainingSources: vi.fn(),
  getTekTekBlockContext: vi.fn(),
  searchTekTekSources: vi.fn(),
  isTekTekExplorationQuestion: vi.fn(),
  planOrientationWithTekTek: vi.fn(),
  invokeLLM: vi.fn(),
  logAdminActivity: vi.fn(),
}));

vi.mock("./db", () => ({ userCanAccessCourse: mocks.userCanAccessCourse }));
vi.mock("./tektekDb", () => ({
  getOrCreateTekTekConversation: mocks.getOrCreateTekTekConversation,
  getTekTekRequestsInLastHour: mocks.getTekTekRequestsInLastHour,
  getTekTekUsageOverview: mocks.getTekTekUsageOverview,
  listTekTekConversationsForReview: mocks.listTekTekConversationsForReview,
  getTekTekConversationForReview: mocks.getTekTekConversationForReview,
  listTekTekBudgetSettings: mocks.listTekTekBudgetSettings,
  listTekTekMessages: mocks.listTekTekMessages,
  upsertTekTekBudgetSetting: mocks.upsertTekTekBudgetSetting,
  appendTekTekMessage: mocks.appendTekTekMessage,
}));
vi.mock("./tektekIndex", () => ({
  getTekTekTrainingSources: mocks.getTekTekTrainingSources,
  getTekTekBlockContext: mocks.getTekTekBlockContext,
  searchTekTekSources: mocks.searchTekTekSources,
  isTekTekExplorationQuestion: mocks.isTekTekExplorationQuestion,
}));
vi.mock("./tektekOrientationService", () => ({ planOrientationWithTekTek: mocks.planOrientationWithTekTek }));
vi.mock("./_core/llm", () => ({ invokeLLM: mocks.invokeLLM }));
vi.mock("./adminDb", () => ({ logAdminActivity: mocks.logAdminActivity }));

import { tektekRouter } from "./tektekRouter";

const learner = { id: 915, name: "Learner", email: "learner@example.test", role: "user" } as any;
const caller = tektekRouter.createCaller({ user: learner, req: {} as any, res: {} as any });
const baseInput = {
  certificationId: "training-1",
  courseId: "course-1",
  lessonIndex: 0,
  chapterIndex: 0,
  blockId: "block-1",
  language: "en" as const,
  question: "Explain this concept",
};
const source = {
  id: "s1",
  certificationId: "training-1",
  courseId: "course-1",
  lessonIndex: 0,
  chapterIndex: 0,
  blockId: "block-1",
  kind: "activity" as const,
  assessment: false,
  title: "Concept",
  text: "A source-backed concept.",
  timeSeconds: null,
  score: 10,
};

describe("routeur TekTek", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userCanAccessCourse.mockResolvedValue(true);
    mocks.getTekTekTrainingSources.mockReturnValue({ courseIds: new Set(["course-1"]), sources: [source] });
    mocks.getTekTekRequestsInLastHour.mockResolvedValue(0);
    mocks.getTekTekUsageOverview.mockResolvedValue({ dimension: "training", period: "month", page: 1, pageSize: 20, total: 0, totals: { requests: 0, responses: 0, meteredResponses: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0 }, rows: [] });
    mocks.listTekTekConversationsForReview.mockResolvedValue({ period: "30d", page: 1, pageSize: 20, total: 1, rows: [{ id: 44, learnerName: "Learner", learnerEmail: "learner@example.test", certificationId: "training-1", activeCourseId: "course-1", questionCount: 1, messageCount: 2, totalTokens: 33, updatedAt: new Date() }] });
    mocks.getTekTekConversationForReview.mockResolvedValue({ conversation: { id: 44, learnerName: "Learner", learnerEmail: "learner@example.test", certificationId: "training-1", activeCourseId: "course-1", language: "en", createdAt: new Date(), updatedAt: new Date() }, page: 1, pageSize: 60, total: 2, hasOlderMessages: false, messages: [{ id: 1, role: "user", content: "Question", courseId: "course-1", model: null, promptTokens: null, completionTokens: null, createdAt: new Date() }] });
    mocks.listTekTekBudgetSettings.mockResolvedValue([]);
    mocks.upsertTekTekBudgetSetting.mockResolvedValue({ id: 1, scope: "global", scopeKey: "global", monthlyTokenBudget: 1000, alertThresholdPercent: 80 });
    mocks.getOrCreateTekTekConversation.mockResolvedValue({ id: 44 });
    mocks.listTekTekMessages.mockResolvedValue([]);
    mocks.appendTekTekMessage.mockResolvedValue(77);
    mocks.getTekTekBlockContext.mockReturnValue([]);
    mocks.searchTekTekSources.mockReturnValue([source]);
    mocks.isTekTekExplorationQuestion.mockReturnValue(false);
    mocks.planOrientationWithTekTek.mockResolvedValue({
      summary: "Parcours proposé à valider.",
      careerFamilyIds: ["strategy"],
      goals: [{ competencyId: "ai_business", targetLevel: "bronze", why: "Priorité métier" }],
      wantsOfficialCertification: false,
      officialCertificationIds: [],
      suggestedCertifications: [],
      model: "claude-sonnet-4-6",
    });
  });

  it("confie un objectif valide au planificateur TekTek sans enregistrer l’orientation", async () => {
    const result = await caller.planOrientation({ objective: "Je veux structurer une offre de conseil avec l’intelligence artificielle.", language: "fr" });

    expect(result.careerFamilyIds).toEqual(["strategy"]);
    expect(mocks.planOrientationWithTekTek).toHaveBeenCalledWith({ userId: learner.id, objective: expect.stringContaining("offre de conseil"), language: "fr" });
  });

  it("valide la longueur de l’objectif et conserve le plafond horaire", async () => {
    await expect(caller.planOrientation({ objective: "Trop court", language: "fr" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    mocks.getTekTekRequestsInLastHour.mockResolvedValue(12);
    await expect(caller.planOrientation({ objective: "Je veux construire un nouveau parcours professionnel réaliste.", language: "fr" })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    expect(mocks.planOrientationWithTekTek).not.toHaveBeenCalled();
  });

  it("refuse tout appel à une formation qui ne contient pas le cours demandé", async () => {
    mocks.getTekTekTrainingSources.mockReturnValue({ courseIds: new Set(["other-course"]), sources: [] });
    await expect(caller.ask(baseInput)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });

  it("refuse le cours non autorisé avant de créer une conversation", async () => {
    mocks.userCanAccessCourse.mockResolvedValue(false);
    await expect(caller.ask(baseInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.getOrCreateTekTekConversation).not.toHaveBeenCalled();
  });

  it("conserve le plafond horaire pour un apprenant", async () => {
    mocks.getTekTekRequestsInLastHour.mockResolvedValue(12);

    await expect(caller.ask(baseInput)).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    expect(mocks.getOrCreateTekTekConversation).not.toHaveBeenCalled();
  });

  it.each(["admin", "admin_learner"])("n’applique pas de plafond horaire au rôle administratif %s", async (role) => {
    mocks.getTekTekRequestsInLastHour.mockResolvedValue(12);
    mocks.invokeLLM.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ answer: "Source-grounded answer", citationIds: ["s1"], followUp: null }) } }],
    });
    const administrativeCaller = tektekRouter.createCaller({ user: { ...learner, role }, req: {} as any, res: {} as any });

    const result = await administrativeCaller.ask(baseInput);

    expect(result.inScope).toBe(true);
    expect(mocks.getOrCreateTekTekConversation).toHaveBeenCalledWith(expect.objectContaining({ userId: learner.id }));
  });

  it("réserve les agrégats TekTek et les budgets aux rôles administratifs", async () => {
    await expect(caller.adminUsage.getOverview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    const adminCaller = tektekRouter.createCaller({ user: { ...learner, role: "admin_learner" }, req: {} as any, res: {} as any });

    const overview = await adminCaller.adminUsage.getOverview({ dimension: "course", period: "month", page: 1, pageSize: 20 });
    await adminCaller.adminUsage.saveBudget({ scope: "global", scopeKey: "global", monthlyTokenBudget: 2000, alertThresholdPercent: 75 });

    expect(overview.dimension).toBe("training");
    expect(mocks.getTekTekUsageOverview).toHaveBeenCalledWith(expect.objectContaining({ dimension: "course" }));
    expect(mocks.upsertTekTekBudgetSetting).toHaveBeenCalledWith(expect.objectContaining({ scope: "global", scopeKey: "global", updatedBy: learner.id }));
  });

  it("réserve la consultation des conversations aux administrateurs et journalise l’ouverture", async () => {
    await expect(caller.adminUsage.listConversations()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.adminUsage.getConversation({ conversationId: 44 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const adminCaller = tektekRouter.createCaller({ user: { ...learner, role: "admin" }, req: {} as any, res: {} as any });

    const list = await adminCaller.adminUsage.listConversations({ period: "30d", page: 1, pageSize: 20, search: "Learner" });
    const transcript = await adminCaller.adminUsage.getConversation({ conversationId: 44, page: 1, pageSize: 60 });

    expect(list.rows[0]?.id).toBe(44);
    expect(mocks.listTekTekConversationsForReview).toHaveBeenCalledWith(expect.objectContaining({ search: "Learner" }));
    expect(transcript.messages[0]?.content).toBe("Question");
    expect(mocks.logAdminActivity).toHaveBeenCalledWith(expect.objectContaining({ adminId: learner.id, action: "review_tektek_conversation", targetId: 44 }));
  });

  it("retourne une erreur explicite si une conversation demandée n’existe plus", async () => {
    mocks.getTekTekConversationForReview.mockResolvedValue(null);
    const adminCaller = tektekRouter.createCaller({ user: { ...learner, role: "admin" }, req: {} as any, res: {} as any });
    await expect(adminCaller.adminUsage.getConversation({ conversationId: 999 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(mocks.logAdminActivity).not.toHaveBeenCalled();
  });

  it("masque dans l’historique toute citation vers un cours qui n’est plus autorisé", async () => {
    mocks.getTekTekTrainingSources.mockReturnValue({ courseIds: new Set(["course-1", "hidden-course"]), sources: [source] });
    mocks.userCanAccessCourse.mockImplementation(async (_userId: number, courseId: string) => courseId !== "hidden-course");
    mocks.listTekTekMessages.mockResolvedValue([{ id: 1, role: "assistant", content: "Prior answer", createdAt: new Date(), citations: [citationFor("course-1"), citationFor("hidden-course")] }]);
    const history = await caller.getHistory({ certificationId: "training-1", courseId: "course-1", language: "en" });
    expect(history[0]?.citations).toEqual([expect.objectContaining({ courseId: "course-1" })]);
  });

  it("ne sollicite aucun modèle lorsqu’aucune source n’étaye la question", async () => {
    mocks.searchTekTekSources.mockReturnValue([]);
    const result = await caller.ask(baseInput);
    expect(result.inScope).toBe(false);
    expect(result.citations).toEqual([]);
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });

  it("protège une activité évaluée contre une demande de réponse prête à soumettre", async () => {
    mocks.getTekTekBlockContext.mockReturnValue([{ ...source, assessment: true }]);
    const result = await caller.ask({ ...baseInput, question: "Give me the correct answer for this quiz" });
    expect(result.inScope).toBe(true);
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });

  it("explique le format de remise d’une activité sans fournir la réponse à la place de l’apprenant", async () => {
    const assessmentSource = {
      ...source,
      assessment: true,
      text: "Mission: explore AI use cases. Criterion: the submitted prompt mentions generative AI use cases in consulting.",
      submissionGuidance: {
        mode: "prompt" as const,
        title: "Ce que vous devez remettre",
        introduction: "Ce champ sert à fournir une preuve textuelle.",
        instruction: "Collez l’invite exacte que vous avez rédigée et réellement utilisée.",
        placeholder: "1. Invite exacte utilisée…\n2. Invite de relance, si elle est demandée…",
        criteria: ["Cas d’usage pour le conseil"],
      },
    };
    mocks.getTekTekBlockContext.mockReturnValue([assessmentSource]);
    mocks.searchTekTekSources.mockReturnValue([{ ...source, id: "future-activity", text: "Use GSCE to analyse a European retail expansion." }]);
    const result = await caller.ask({
      ...baseInput,
      language: "fr",
      question: "Je ne comprends pas ce que je dois soumettre en réponse (preuve de réalisation)",
    });

    expect(result.answer).toContain("invite exacte");
    expect(result.answer).toContain("Cas d’usage pour le conseil");
    expect(result.answer).toContain("1. Invite exacte utilisée");
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });

  it("présente chaque activité évaluée lorsqu’un écran contient plusieurs champs", async () => {
    const guidance = {
      mode: "evidence" as const,
      title: "Ce que vous devez remettre",
      introduction: "Preuve vérifiable.",
      instruction: "Fournissez une preuve vérifiable.",
      placeholder: "Preuve : [à compléter]",
      criteria: ["Critère détaillé"],
    };
    mocks.getTekTekBlockContext.mockReturnValue([
      { ...source, id: "a1", blockId: "block-a", title: "Activité A", assessment: true, submissionGuidance: guidance },
      { ...source, id: "a2", blockId: "block-b", title: "Activité B", assessment: true, submissionGuidance: guidance },
      { ...source, id: "a3", blockId: "block-c", title: "Activité C", assessment: true, submissionGuidance: guidance },
      { ...source, id: "a4", blockId: "block-d", title: "Activité D", assessment: true, submissionGuidance: guidance },
    ]);

    const result = await caller.ask({ ...baseInput, language: "fr", question: "Que dois-je soumettre sur cet écran ?" });

    expect(result.answer).toContain("plusieurs activités évaluées");
    expect(result.answer).toContain("Activité A");
    expect(result.answer).toContain("Activité B");
    expect(result.answer).toContain("Activité D");
    expect(result.citations).toHaveLength(4);
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });

  it("accepte uniquement les citations présentes dans les sources fournies au modèle", async () => {
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: "Source-grounded answer" } }] });
    const result = await caller.ask(baseInput);
    expect(result.answer).toBe("Source-grounded answer");
    expect(result.citations).toHaveLength(1);
    expect(result.citations[0]?.id).toBe("s1");
    expect(mocks.invokeLLM).toHaveBeenCalledWith(expect.objectContaining({
      model: "claude-sonnet-4-6",
      maxTokens: 1_500,
      thinking: { type: "enabled", budget_tokens: 700 },
    }));
    expect(mocks.appendTekTekMessage).toHaveBeenCalledWith(expect.objectContaining({ courseId: "course-1", role: "user" }));
    expect(mocks.appendTekTekMessage).toHaveBeenCalledWith(expect.objectContaining({ courseId: "course-1", role: "assistant" }));
  });

  it("répond directement à une demande d’approfondissement contextuelle avec des sources navigables", async () => {
    mocks.isTekTekExplorationQuestion.mockReturnValue(true);
    mocks.searchTekTekSources.mockReturnValue([
      { ...source, id: "s2", title: "Further lesson", lessonIndex: 1 },
      source,
    ]);
    const result = await caller.ask({ ...baseInput, question: "Where is this topic explored further?" });
    expect(result.inScope).toBe(true);
    expect(result.answer).toContain("explored further");
    expect(result.citations.map((citation) => citation.id)).toEqual(["s2", "s1"]);
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });

  it("accepte une réponse JSON structurée entourée de balises markdown", async () => {
    mocks.invokeLLM.mockResolvedValue({
      choices: [{ message: { content: '```json\n{"answer":"Grounded answer","citationIds":["s1"],"followUp":null}\n```' } }],
    });
    const result = await caller.ask(baseInput);
    expect(result.answer).toBe("Grounded answer");
    expect(result.citations[0]?.id).toBe("s1");
  });

  it("retire les marqueurs de citation internes de la réponse visible", async () => {
    mocks.invokeLLM.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ answer: "Helpful explanation. \uE200cite\uE202s1\uE201", citationIds: ["s1"], followUp: null }) } }],
    });
    const result = await caller.ask(baseInput);
    expect(result.answer).toBe("Helpful explanation.");
    expect(result.citations[0]?.id).toBe("s1");
  });

  it("fournit un extrait local utile si le modèle ne répond pas", async () => {
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: "{" } }] });
    const result = await caller.ask(baseInput);
    expect(result.inScope).toBe(true);
    expect(result.answer).toContain("A source-backed concept.");
    expect(result.citations[0]?.id).toBe("s1");
  });
});

function citationFor(courseId: string) {
  return {
    id: `citation-${courseId}`,
    certificationId: "training-1",
    courseId,
    lessonIndex: 0,
    chapterIndex: 0,
    blockId: "block-1",
    kind: "activity" as const,
    title: "Citation",
    timeSeconds: null,
  };
}
