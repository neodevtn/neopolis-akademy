import { afterEach, describe, expect, it, vi } from "vitest";

describe("analytics consent synchronization", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "document");
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

  it("met la destination en file avant d’injecter le script gtag", async () => {
    vi.stubEnv("VITE_GA4_MEASUREMENT_ID", "measurement-test");
    vi.resetModules();

    const dataLayer: unknown[] = [];
    const script = { async: false, src: "", onload: () => undefined, onerror: () => undefined };
    let commandsAtAppend: unknown[][] = [];
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        dataLayer,
        localStorage: { getItem: () => null },
        location: { href: "https://akademy.neodev.click/", origin: "https://akademy.neodev.click" },
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        createElement: () => script,
        head: {
          appendChild: () => {
            commandsAtAppend = dataLayer.map((entry) => Array.from(entry as ArrayLike<unknown>));
            script.onload();
          },
        },
      },
    });

    const analytics = await import("./analytics");
    expect(await analytics.initializeAnalytics()).toBe(true);
    expect(commandsAtAppend.map((entry) => entry.slice(0, 2))).toEqual([
      ["consent", "default"],
      ["js", expect.any(Date)],
      ["config", "measurement-test"],
    ]);
  });

  it("restaure la balise Manus de mesure d’audience après consentement", async () => {
    vi.stubEnv("VITE_GA4_MEASUREMENT_ID", "measurement-test");
    vi.stubEnv("VITE_ANALYTICS_ENDPOINT", "https://manus-analytics.com/");
    vi.stubEnv("VITE_ANALYTICS_WEBSITE_ID", "website-test");
    vi.resetModules();

    const appended: Array<{ defer: boolean; src: string; attributes: Record<string, string> }> = [];
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        dataLayer: [],
        gtag: () => undefined,
        localStorage: { getItem: () => "accepted" },
        location: { href: "https://akademy.neodev.click/", origin: "https://akademy.neodev.click" },
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        querySelector: () => null,
        createElement: () => {
          const script = {
            defer: false,
            src: "",
            attributes: {} as Record<string, string>,
            setAttribute(name: string, value: string) { this.attributes[name] = value; },
          };
          return script;
        },
        head: { appendChild: (script: { defer: boolean; src: string; attributes: Record<string, string> }) => appended.push(script) },
      },
    });

    const analytics = await import("./analytics");
    expect(await analytics.initializeAnalytics()).toBe(true);
    expect(appended).toEqual([
      expect.objectContaining({
        defer: true,
        src: "https://manus-analytics.com/umami",
        attributes: expect.objectContaining({
          "data-website-id": "website-test",
          "data-neopolis-manus-analytics": "true",
        }),
      }),
    ]);
  });

  it("ne charge pas la mesure Manus sans consentement explicite", async () => {
    vi.stubEnv("VITE_ANALYTICS_ENDPOINT", "https://manus-analytics.com");
    vi.stubEnv("VITE_ANALYTICS_WEBSITE_ID", "website-test");
    vi.resetModules();

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { localStorage: { getItem: () => "refused" } },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { querySelector: () => null, createElement: vi.fn(), head: { appendChild: vi.fn() } },
    });

    const analytics = await import("./analytics");
    expect(analytics.initializeManusAnalytics()).toBe(false);
    expect(document.head.appendChild).not.toHaveBeenCalled();
  });

  it("garde la mesure Manus disponible si GA4 est indisponible", async () => {
    vi.stubEnv("VITE_GA4_MEASUREMENT_ID", "");
    vi.stubEnv("VITE_ANALYTICS_ENDPOINT", "https://manus-analytics.com");
    vi.stubEnv("VITE_ANALYTICS_WEBSITE_ID", "website-test");
    vi.resetModules();

    const appended: Array<{ src: string }> = [];
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { localStorage: { getItem: () => "accepted" } },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        querySelector: () => null,
        createElement: () => ({ defer: false, src: "", setAttribute: () => undefined }),
        head: { appendChild: (script: { src: string }) => appended.push(script) },
      },
    });

    const analytics = await import("./analytics");
    expect(await analytics.initializeAnalytics()).toBe(false);
    expect(appended).toEqual([expect.objectContaining({ src: "https://manus-analytics.com/umami" })]);
  });
});
