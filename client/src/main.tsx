import * as Sentry from "@sentry/react";
import { trpc } from "@/lib/trpc";
import { initErrorReporter } from "@/lib/errorReporter";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import { clearStaleClientBundleRecovery, retryStaleClientBundle } from "./lib/chunkRecovery";
import "./index.css";

// Initialize Sentry for error monitoring, performance & user feedback
const isProduction = import.meta.env.MODE === "production";

Sentry.init({
  dsn: "https://f1beaf088d01628e72b6cc5b96511906@sentry.neopolis-dev.com//102",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
      maskAllInputs: false,
    }),
    Sentry.feedbackIntegration({
      colorScheme: "light",
      buttonLabel: "Signaler un problème",
      submitButtonLabel: "Envoyer",
      cancelButtonLabel: "Annuler",
      formTitle: "Signaler un problème",
      nameLabel: "Nom",
      namePlaceholder: "Votre nom",
      emailLabel: "Email",
      emailPlaceholder: "votre@email.com",
      messageLabel: "Description",
      messagePlaceholder: "Décrivez le problème rencontré...",
      successMessageText: "Merci pour votre retour !",
      isNameRequired: true,
      isEmailRequired: true,
      // Neopolis brand styling
      themeLight: {
        background: "#ffffff",
        foreground: "#1a1f36",
        accentBackground: "#1e3a5f",
        accentForeground: "#ffffff",
        inputBackground: "#f8f9fc",
        inputForeground: "#1a1f36",
        inputBorder: "#e2e4ea",
        inputBorderFocus: "#1e3a5f",
        inputOutlineFocus: "rgba(30, 58, 95, 0.2)",
        formBorderRadius: "12px",
        submitBackground: "#1e3a5f",
        submitBackgroundHover: "#162d4a",
        submitForeground: "#ffffff",
        submitBorder: "#1e3a5f",
        submitOutlineFocus: "rgba(30, 58, 95, 0.3)",
        cancelBackground: "transparent",
        cancelBackgroundHover: "#f8f9fc",
        cancelForeground: "#1a1f36",
        cancelBorder: "#e2e4ea",
      },
      triggerLabel: "Signaler un problème",
      triggerAriaLabel: "Ouvrir le formulaire de feedback",
    }),
  ],
  // Performance Monitoring — 0.2 in production, 1.0 in development
  tracesSampleRate: isProduction ? 0.2 : 1.0,
  // Session Replay
  replaysSessionSampleRate: isProduction ? 0.1 : 0.0,
  replaysOnErrorSampleRate: 1.0,
  // Environment
  environment: import.meta.env.MODE,
});

// Initialize client-side error monitoring
initErrorReporter();

// A cached HTML document can point to a removed Vite chunk immediately after a
// deployment. Recover once instead of showing an ErrorBoundary MIME failure.
window.addEventListener("vite:preloadError", (event) => {
  const preloadEvent = event as unknown as { payload?: unknown };
  if (retryStaleClientBundle(preloadEvent.payload || preloadEvent)) event.preventDefault();
});
window.setTimeout(clearStaleClientBundleRecovery, 10_000);

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Don't redirect if already on login page
  if (window.location.pathname === "/login" || window.location.pathname === "/demo-login") return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        // Preview auto-login fallback: when the browser blocks iframe cookies
        // (Safari ITP / private browsing / WebView), the runtime mirrors the
        // session into sessionStorage so we can forward it as a Bearer token.
        // The regular OAuth cookie flow keeps working and takes priority server-side.
        try {
          const raw = sessionStorage.getItem("manus-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
            const token = pair?.trim().slice(prefix.length);
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
          }
        } catch {
          // sessionStorage unavailable
        }
        return {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
