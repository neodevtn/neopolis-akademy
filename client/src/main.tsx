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
import { initializeAnalytics, trackPageView } from "./lib/analytics";
import { ensureSentryClient } from "./lib/sentryClient";
import "./index.css";

// Recover before Sentry and the app-level reporters observe a stale Vite chunk.
// This handles the Safari `unhandledrejection: Load failed` path that does not
// reach React's ErrorBoundary after an asset hash changes during a deployment.
const recoverStaleBundleRejection = (event: PromiseRejectionEvent) => {
  if (retryStaleClientBundle(event.reason)) event.preventDefault();
};
window.addEventListener("unhandledrejection", recoverStaleBundleRejection);

// Start the SDK as an asynchronous import at application bootstrap. It does
// not block React's first render, but it avoids losing errors, traces and
// short sessions while waiting for an interaction or an arbitrary 15-second
// fallback timer.
void ensureSentryClient().catch(() => undefined);

// Initialize the local fallback reporter immediately as well.
initErrorReporter();

// A cached HTML document can point to a removed Vite chunk immediately after a
// deployment. Recover once instead of showing an ErrorBoundary MIME failure.
window.addEventListener("vite:preloadError", (event) => {
  const preloadEvent = event as unknown as { payload?: unknown };
  if (retryStaleClientBundle(preloadEvent.payload || preloadEvent)) event.preventDefault();
});
window.setTimeout(clearStaleClientBundleRecovery, 10_000);
void initializeAnalytics().then((loaded) => {
  if (loaded) trackPageView();
});

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
