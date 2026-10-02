import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-assessment-summary",
      email: "admin-assessment-summary@neopolis.test",
      name: "Administrateur test",
      loginMethod: "password",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {}, cookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("Administration pédagogique — résumés légers", () => {
  it("renvoie des compteurs d’examen sans le contenu ni les clés des questions", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const summary = await caller.adminContent.getMockExamQuestionSummary();

    expect(summary.length).toBeGreaterThan(0);
    expect(summary.every((item) => Number.isInteger(item.questionCount) && item.questionCount >= 0 && Number.isInteger(item.domainCount) && item.domainCount >= 0)).toBe(true);
    expect(JSON.stringify(summary)).not.toMatch(/correctChoiceIds|explanation|rationale|choices/);
  });

  it("renvoie les compteurs de quiz par cours sans les questions individuelles", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const summary = await caller.adminContent.getQuizBankSummary();

    expect(summary.length).toBeGreaterThan(0);
    expect(summary.every((item) => item.courseId.length > 0 && Number.isInteger(item.bankCount) && Number.isInteger(item.questionCount))).toBe(true);
  });

  it("renvoie deux pages administrateur distinctes sans transférer la banque entière", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const certificationId = "claude_certified_developer_foundations";
    const first = await caller.adminContent.getMockExamQuestionPage({ certificationId, offset: 0, limit: 100 });
    const second = await caller.adminContent.getMockExamQuestionPage({ certificationId, offset: 100, limit: 100 });
    expect(first.total).toBeGreaterThanOrEqual(200);
    expect(first.questions).toHaveLength(100);
    expect(second.questions).toHaveLength(100);
    expect(new Set([...first.questions, ...second.questions].map((question) => question.id)).size).toBe(200);
    const sample = await caller.adminContent.getMockExamSample({ certificationId });
    expect(sample.availableQuestions).toBe(first.total);
    expect(sample.questions).toHaveLength(53);
  });

  it("refuse l’accès à la page de corrigés à un apprenant", async () => {
    const context = createAdminContext();
    const caller = appRouter.createCaller({ ...context, user: { ...context.user!, role: "user" } });
    await expect(caller.adminContent.getMockExamQuestionPage({ certificationId: "claude_certified_developer_foundations", offset: 0, limit: 10 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("Administration pédagogique — parcours distincts", () => {
  const contentManager = readFileSync(new URL("../client/src/pages/AdminContentManager.tsx", import.meta.url), "utf8");
  const adminNavigation = readFileSync(new URL("../client/src/components/AdminNavbar.tsx", import.meta.url), "utf8");

  it("expose des modes séparés pour banques, examens et quiz/checkpoints", () => {
    for (const mode of ["question-banks", "exam-configurations", "quiz-banks"]) {
      expect(contentManager).toContain(`"${mode}"`);
      expect(adminNavigation).toContain(`mode=${mode}`);
    }
  });

  it("utilise les résumés légers dans les tableaux de pilotage", () => {
    expect(contentManager).toContain("getMockExamQuestionSummary.useQuery");
    expect(contentManager).toContain("getQuizBankSummary.useQuery");
    expect(contentManager).toContain("getMockExamQuestionPage.useQuery");
    expect(contentManager).toContain("getMockExamSample.useQuery");
    expect(contentManager).toContain('viewMode === "quiz-simulate" || viewMode === "edit-quiz" || viewMode === "edit-course"');
  });
});
