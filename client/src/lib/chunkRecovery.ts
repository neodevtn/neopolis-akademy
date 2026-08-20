const RECOVERY_KEY = "neopolis:stale-client-bundle-recovery";

export function isStaleClientBundleError(error: unknown): boolean {
  const message = error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error || "");
  return /text\/html.{0,80}(javascript|module).{0,80}mime|\bload failed\b|failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|vite:preloaderror/i.test(message);
}

/**
 * A stale React tree can also surface as a DOM insertion failure after a
 * deployment. This is retried once, just like a lazy-chunk failure, so a
 * learner does not remain blocked by a session loaded before the update.
 */
export function isRecoverableClientRenderError(error: unknown): boolean {
  if (isStaleClientBundleError(error)) return true;
  const message = error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error || "");
  return /failed to execute .?insertbefore.? on .?node.?|node before which the new node is to be inserted is not a child/i.test(message);
}

/**
 * Retries once after a deployment when a cached HTML page references an old
 * hashed JavaScript chunk. A second failure remains visible instead of looping.
 */
export function retryStaleClientBundle(error: unknown): boolean {
  if (typeof window === "undefined" || !isRecoverableClientRenderError(error)) return false;

  try {
    const retryKey = `${RECOVERY_KEY}:${window.location.pathname}`;
    if (window.sessionStorage.getItem(retryKey)) return false;
    window.sessionStorage.setItem(retryKey, "1");
    const recoveryUrl = new URL(window.location.href);
    recoveryUrl.searchParams.set("client-recovery", String(Date.now()));
    window.location.replace(recoveryUrl.toString());
    return true;
  } catch {
    return false;
  }
}

export function clearStaleClientBundleRecovery() {
  if (typeof window === "undefined") return;
  try {
    const retryKey = `${RECOVERY_KEY}:${window.location.pathname}`;
    window.sessionStorage.removeItem(retryKey);
  } catch {
    // Storage may be unavailable in a privacy-restricted browser context.
  }
}
