import { afterEach, describe, expect, it, vi } from "vitest";

describe("analytics consent synchronization", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    Reflect.deleteProperty(globalThis, "window");
  });

  it("émet la transition accordée même lorsque gtag existe déjà", async () => {
    vi.stubEnv("VITE_GA4_MEASUREMENT_ID", "measurement-test");
    vi.resetModules();

    const dataLayer: unknown[] = [];
    const localStorage = { getItem: () => "accepted" };
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        dataLayer,
        localStorage,
        location: { href: "https://akademy.neodev.click/", origin: "https://akademy.neodev.click" },
      },
    });

    const analytics = await import("./analytics");
    window.gtag = analytics.createDataLayerGtag(dataLayer);
    analytics.resetAnalyticsForTests();
    analytics.updateAnalyticsConsent(true);
    await Promise.resolve();

    const commands = dataLayer.map((entry) => Array.from(entry as ArrayLike<unknown>));
    expect(commands).toEqual(expect.arrayContaining([
      ["consent", "update", expect.objectContaining({ analytics_storage: "granted", ad_storage: "denied" })],
      ["event", "page_view", expect.objectContaining({ page_path: "/" })],
    ]));
  });
});
