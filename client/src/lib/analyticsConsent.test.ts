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

  it("autorise une page vue minimale sous consentement refusé mais bloque les événements détaillés", async () => {
    vi.stubEnv("VITE_GA4_MEASUREMENT_ID", "measurement-test");
    vi.resetModules();

    const dataLayer: unknown[] = [];
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        dataLayer,
        localStorage: { getItem: () => null },
        location: { href: "https://akademy.neodev.click/formations-ia?ref=private", origin: "https://akademy.neodev.click" },
      },
    });

    const analytics = await import("./analytics");
    window.gtag = analytics.createDataLayerGtag(dataLayer);
    analytics.resetAnalyticsForTests();

    expect(analytics.trackPageView()).toBe(true);
    expect(analytics.trackEvent("view_course", { course_id: "course_01" })).toBe(false);
    expect(dataLayer.map((entry) => Array.from(entry as ArrayLike<unknown>))).toEqual([
      ["event", "page_view", expect.objectContaining({ page_location: "https://akademy.neodev.click/formations-ia" })],
    ]);
  });
});
