import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  userCanAccessCourse: vi.fn(),
  getOrCreateTekTekConversation: vi.fn(),
  getTekTekRequestsInLastHour: vi.fn(),
  getTekTekUsageOverview: vi.fn(),
  listTekTekBudgetSettings: vi.fn(),
  listTekTekMessages: vi.fn(),
  upsertTekTekBudgetSetting: vi.fn(),
  appendTekTekMessage: vi.fn(),
  getTekTekTrainingSources: vi.fn(),
  getTekTekBlockContext: vi.fn(),
  searchTekTekSources: vi.fn(),
  isTekTekExplorationQuestion: vi.fn(),
  invokeLLM: vi.fn(),
}));

vi.mock("./db", () => ({ userCanAccessCourse: mocks.userCanAccessCourse }));
vi.mock("./tektekDb", () => ({
  getOrCreateTekTekConversation: mocks.getOrCreateTekTekConversation,
  getTekTekRequestsInLastHour: mocks.getTekTekRequestsInLastHour,
  getTekTekUsageOverview: mocks.getTekTekUsageOverview,
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
vi.mock("./_core/llm", () => ({ invokeLLM: mocks.invokeLLM }));

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
    mocks.listTekTekBudgetSettings.mockResolvedValue([]);
    mocks.upsertTekTekBudgetSetting.mockResolvedValue({ id: 1, scope: "global", scopeKey: "global", monthlyTokenBudget: 1000, alertThresholdPercent: 80 });
    mocks.getOrCreateTekTekConversation.mockResolvedValue({ id: 44 });
    mocks.listTekTekMessages.mockResolvedValue([]);
    mocks.appendTekTekMessage.mockResolvedValue(77);
    mocks.getTekTekBlockContext.mockReturnValue([]);
    mocks.searchTekTekSources.mockReturnValue([source]);
    mocks.isTekTekExplorationQuestion.mockReturnValue(false);
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

  it("accepte uniquement les citations présentes dans les sources fournies au modèle", async () => {
    mocks.invokeLLM.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ answer: "Source-grounded answer", citationIds: ["s1", "external"], followUp: null }) } }],
    });
    const result = await caller.ask(baseInput);
    expect(result.answer).toBe("Source-grounded answer");
    expect(result.citations).toHaveLength(1);
    expect(result.citations[0]?.id).toBe("s1");
    expect(mocks.invokeLLM).toHaveBeenCalledWith(expect.objectContaining({
      model: "claude-sonnet-4-6",
      maxTokens: 1_500,
      thinking: { type: "enabled", budget_tokens: 700 },
      responseFormat: expect.objectContaining({
        json_schema: expect.objectContaining({
          schema: expect.objectContaining({
            properties: expect.objectContaining({
              citationIds: expect.objectContaining({ items: expect.objectContaining({ enum: ["s1"] }) }),
              followUp: { type: ["string", "null"] },
            }),
          }),
        }),
      }),
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

  it("fournit les passages les plus pertinents si la synthèse structurée est inutilisable", async () => {
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: "{" } }] });
    const result = await caller.ask(baseInput);
    expect(result.inScope).toBe(true);
    expect(result.answer).toContain("relevant passages");
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
