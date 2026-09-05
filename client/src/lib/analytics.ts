const CONSENT_KEY = "neopolis_cookie_consent";
const MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

type GtagCommand = (command: "js" | "config" | "event" | "consent", target: unknown, params?: Record<string, unknown>) => void;
type SafeEventParams = Record<string, string | number | boolean | undefined>;

export const ANALYTICS_EVENT_NAMES = [
  "view_course",
  "begin_course",
  "lesson_start",
  "lesson_complete",
  "chapter_complete",
  "quiz_start",
  "quiz_complete",
  "exercise_start",
  "exercise_complete",
  "download_resource",
  "video_start",
  "video_progress",
  "video_complete",
  "course_progress",
  "course_complete",
  "certificate_mock_start",
  "certificate_mock_complete",
  "certificate_earned",
  "search",
  "login",
  "sign_up",
  "application_start",
  "application_step",
  "application_submit",
  "cta_click",
  "share_click",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagCommand;
  }
}

const ALLOWED_EVENT_PARAMS = new Set([
  "content_type",
  "content_id",
  "certification_id",
  "course_id",
  "course_slug",
  "category_slug",
  "language",
  "level",
  "lesson_slug",
  "lesson_index",
  "chapter_index",
  "progress_percent",
  "search_category",
  "result_count",
  "method",
  "application_stage",
  "format",
  "completion_source",
  "role_type",
  "resource_type",
  "resource_name_sanitized",
  "video_id",
  "score_band",
  "passed",
  "status",
]);

const ALLOWED_QUERY_PARAMS = new Set(["tab", "lesson", "chapter"]);
const trackedPageLocations = new Set<string>();
const trackedEventKeys = new Set<string>();
let scriptPromise: Promise<void> | null = null;

function looksLikePersonalOrSensitiveValue(value: string) {
  return /\b[\w.+-]+@[\w-]+\.[\w.-]+\b|https?:\/\/|\b(?:token|password|bearer|secret)\b|(?:\+?\d[\s.-]?){7,}\d/.test(value);
}

export function hasAnalyticsConsent(storage: Pick<Storage, "getItem"> | null = typeof window === "undefined" ? null : window.localStorage) {
  return storage?.getItem(CONSENT_KEY) === "accepted";
}

export function sanitizeAnalyticsParams(params: SafeEventParams = {}) {
  const safe: Record<string, string | number | boolean> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (!ALLOWED_EVENT_PARAMS.has(key) || value === undefined) return;
    if (typeof value === "string") {
      const cleaned = value.replace(/[\r\n\t]/g, " ").trim().slice(0, 120);
      if (!cleaned || /^(?:token|password|email|phone|name)$/i.test(key) || looksLikePersonalOrSensitiveValue(cleaned)) return;
      safe[key] = cleaned;
      return;
    }
    if (typeof value === "number") {
      if (Number.isFinite(value)) safe[key] = Math.round(value * 100) / 100;
      return;
    }
    safe[key] = Boolean(value);
  });
  return safe;
}

export function sanitizeAnalyticsLocation(input: string, origin = typeof window === "undefined" ? "https://akademy.neodev.click" : window.location.origin) {
  const url = new URL(input, origin);
  const safeParams = new URLSearchParams();
  Array.from(url.searchParams.entries()).forEach(([key, value]) => {
    if (ALLOWED_QUERY_PARAMS.has(key) && /^[a-z0-9_-]{1,40}$/i.test(value)) safeParams.set(key, value);
  });
  const query = safeParams.toString();
  return `${url.origin}${url.pathname}${query ? `?${query}` : ""}`;
}

function dispatchGtag(command: Parameters<GtagCommand>[0], target: Parameters<GtagCommand>[1], params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return false;
  window.gtag(command, target, params);
  return true;
}

export function initializeAnalytics() {
  if (typeof window === "undefined" || !MEASUREMENT_ID || !hasAnalyticsConsent()) return Promise.resolve(false);
  if (window.gtag) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise.then(() => true);

  window.dataLayer = window.dataLayer || [];
  window.gtag = ((command, target, params) => {
    window.dataLayer?.push([command, target, params]);
  }) as GtagCommand;
  dispatchGtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  dispatchGtag("consent", "update", { analytics_storage: "granted" });
  dispatchGtag("js", new Date());
  dispatchGtag("config", MEASUREMENT_ID, { send_page_view: false, anonymize_ip: true });

  scriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
  return scriptPromise.then(() => true);
}

export function updateAnalyticsConsent(granted: boolean) {
  if (typeof window === "undefined") return;
  if (granted) {
    void initializeAnalytics().then(() => trackPageView());
    return;
  }
  dispatchGtag("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
}

export function trackEvent(name: AnalyticsEventName, params: SafeEventParams = {}) {
  if (!hasAnalyticsConsent() || !MEASUREMENT_ID) return false;
  return dispatchGtag("event", name, sanitizeAnalyticsParams(params));
}

/**
 * Émet un événement une seule fois pour une clé fonctionnelle stable. Cette
 * clé de déduplication reste exclusivement locale et n’est jamais envoyée.
 */
export function trackEventOnce(name: AnalyticsEventName, key: string, params: SafeEventParams = {}) {
  if (trackedEventKeys.has(key)) return false;
  const tracked = trackEvent(name, params);
  if (tracked) trackedEventKeys.add(key);
  return tracked;
}

export function trackPageView(location = typeof window === "undefined" ? "/" : window.location.href) {
  if (!hasAnalyticsConsent() || !MEASUREMENT_ID) return false;
  const pageLocation = sanitizeAnalyticsLocation(location);
  if (trackedPageLocations.has(pageLocation)) return false;
  trackedPageLocations.add(pageLocation);
  return dispatchGtag("event", "page_view", {
    page_location: pageLocation,
    page_path: new URL(pageLocation).pathname,
    page_title: typeof document === "undefined" ? "Neopolis Akademy" : document.title.slice(0, 120),
  });
}

export function resetAnalyticsForTests() {
  trackedPageLocations.clear();
  trackedEventKeys.clear();
  scriptPromise = null;
}
