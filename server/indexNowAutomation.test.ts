import { describe, expect, it, vi } from "vitest";
import {
  INDEXNOW_AUTOMATION_ENDPOINT,
  buildContentUpdateRevision,
  buildDeploymentIndexNowRevision,
  indexNowRetryDelay,
  isSuccessfulIndexNowStatus,
  submitIndexNowUrls,
} from "./indexNowAutomation";

const urls = [
  "https://akademy.neodev.click/",
  "https://akademy.neodev.click/formations-ia",
];

describe("IndexNow automation", () => {
  it("creates a stable deployment revision and a distinct revision for each content save", () => {
    const first = buildDeploymentIndexNowRevision();
    const second = buildDeploymentIndexNowRevision();
    expect(first.revision).toMatch(/^[a-f0-9]{64}$/);
    expect(first).toEqual(second);

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-19T21:00:00Z"));
    const contentA = buildContentUpdateRevision("course.update", "course-a");
    vi.setSystemTime(new Date("2026-09-19T21:00:01Z"));
    const contentB = buildContentUpdateRevision("course.update", "course-a");
    vi.useRealTimers();
    expect(contentA).not.toBe(contentB);
  });

  it("accepts IndexNow 200/202 responses and sends canonical URLs once", async () => {
    const fetchMock = vi.fn(async () => new Response("", { status: 202 }));
    const result = await submitIndexNowUrls([...urls, urls[0]], fetchMock as typeof fetch);
    expect(result).toEqual({ urlCount: 2, statuses: [202] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(INDEXNOW_AUTOMATION_ENDPOINT);
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    const payload = JSON.parse(String(request.body));
    expect(payload.urlList).toEqual(urls);
  });

  it("rejects provider failures and uses bounded exponential retry delays", async () => {
    const fetchMock = vi.fn(async () => new Response("verification pending", { status: 403 }));
    await expect(submitIndexNowUrls(urls, fetchMock as typeof fetch)).rejects.toMatchObject({ httpStatus: 403 });
    expect(isSuccessfulIndexNowStatus(200)).toBe(true);
    expect(isSuccessfulIndexNowStatus(202)).toBe(true);
    expect(isSuccessfulIndexNowStatus(429)).toBe(false);
    expect(indexNowRetryDelay(1)).toBe(30_000);
    expect(indexNowRetryDelay(99)).toBe(21_600_000);
  });
});
