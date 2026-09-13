import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  userCanAccessCourse: vi.fn(),
  getOrCreateTekTekConversation: vi.fn(),
  getTekTekRequestsInLastHour: vi.fn(),
  listTekTekMessages: vi.fn(),
  appendTekTekMessage: vi.fn(),
  getTekTekTrainingSources: vi.fn(),
  getTekTekBlockContext: vi.fn(),
  searchTekTekSources: vi.fn(),
  invokeLLM: vi.fn(),
}));

vi.mock("./db", () => ({ userCanAccessCourse: mocks.userCanAccessCourse }));
vi.mock("./tektekDb", () => ({
  getOrCreateTekTekConversation: mocks.getOrCreateTekTekConversation,
  getTekTekRequestsInLastHour: mocks.getTekTekRequestsInLastHour,
  listTekTekMessages: mocks.listTekTekMessages,
  appendTekTekMessage: mocks.appendTekTekMessage,
}));
vi.mock("./tektekIndex", () => ({
  getTekTekTrainingSources: mocks.getTekTekTrainingSources,
  getTekTekBlockContext: mocks.getTekTekBlockContext,
  searchTekTekSources: mocks.searchTekTekSources,
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
    mocks.getOrCreateTekTekConversation.mockResolvedValue({ id: 44 });
    mocks.listTekTekMessages.mockResolvedValue([]);
    mocks.appendTekTekMessage.mockResolvedValue(77);
    mocks.getTekTekBlockContext.mockReturnValue([]);
    mocks.searchTekTekSources.mockReturnValue([source]);
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
