import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  isRegisteredProjectHeartbeatJob: vi.fn(),
  processPendingIndexNowSubmissions: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));
vi.mock("./db", () => ({
  getProjectHeartbeatTaskUid: vi.fn(),
  isRegisteredProjectHeartbeatJob: mocks.isRegisteredProjectHeartbeatJob,
  registerProjectHeartbeatJob: vi.fn(),
}));
vi.mock("./indexNowAutomation", () => ({
  processPendingIndexNowSubmissions: mocks.processPendingIndexNowSubmissions,
}));
vi.mock("./_core/heartbeat", () => ({
  createHeartbeatJob: vi.fn(),
  listHeartbeatJobs: vi.fn(),
  updateHeartbeatJob: vi.fn(),
}));

import { scheduledIndexNowRetryHandler } from "./scheduledIndexNow";

function responseRecorder() {
  const state = { status: 200, body: undefined as unknown };
  const response = {
    status(code: number) { state.status = code; return response; },
    json(body: unknown) { state.body = body; return response; },
  };
  return { response, state };
}

describe("scheduled IndexNow retry", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects direct requests that are not authenticated cron callbacks", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: false, taskUid: null });
    const { response, state } = responseRecorder();
    await scheduledIndexNowRetryHandler({} as never, response as never);
    expect(state.status).toBe(403);
    expect(mocks.processPendingIndexNowSubmissions).not.toHaveBeenCalled();
  });

  it("rejects unknown scheduled job identities", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "unknown" });
    mocks.isRegisteredProjectHeartbeatJob.mockResolvedValue(false);
    const { response, state } = responseRecorder();
    await scheduledIndexNowRetryHandler({} as never, response as never);
    expect(state.status).toBe(403);
    expect(mocks.processPendingIndexNowSubmissions).not.toHaveBeenCalled();
  });

  it("processes due submissions for the registered retry heartbeat", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "registered" });
    mocks.isRegisteredProjectHeartbeatJob.mockResolvedValue(true);
    mocks.processPendingIndexNowSubmissions.mockResolvedValue({ processed: 1, busy: false });
    const { response, state } = responseRecorder();
    await scheduledIndexNowRetryHandler({} as never, response as never);
    expect(state.status).toBe(200);
    expect(state.body).toEqual({ ok: true, processed: 1, busy: false });
  });
});
