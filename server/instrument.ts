import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://f1beaf088d01628e72b6cc5b96511906@sentry.neopolis-dev.com//102",
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  integrations: [
    Sentry.httpIntegration(),
    Sentry.expressIntegration(),
  ],
});
