const isProduction = import.meta.env.MODE === "production";
export const sentryDsn = "https://f1beaf088d01628e72b6cc5b96511906@sentry.neopolis-dev.com/102";
export const sentryProject = { organization: "neopolis-development", slug: "neopolis-akademy" };
let initialized = false;
let initializationPromise: Promise<typeof import("@sentry/react")> | null = null;

/** Loads the shared Sentry client once, without injecting a second feedback widget. */
export function ensureSentryClient() {
  if (!initializationPromise) {
    initializationPromise = import("@sentry/react").then((Sentry) => {
      if (!initialized) {
        Sentry.init({
          dsn: sentryDsn,
          integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false, maskAllInputs: false }),
            Sentry.feedbackIntegration({ autoInject: false }),
          ],
          tracesSampleRate: isProduction ? 0.2 : 1.0,
          replaysSessionSampleRate: isProduction ? 0.1 : 0.0,
          replaysOnErrorSampleRate: 1.0,
          environment: import.meta.env.MODE,
        });
        initialized = true;
      }
      return Sentry;
    }).catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }
  return initializationPromise;
}
