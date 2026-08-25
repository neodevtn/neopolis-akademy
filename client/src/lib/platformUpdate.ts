const ENTRY_BUNDLE_PATTERN = /<script[^>]+src=["'](\/assets\/index-[^"']+\.js)["']/i;

export function extractEntryBundle(html: string): string | null {
  return html.match(ENTRY_BUNDLE_PATTERN)?.[1] ?? null;
}

export function shouldShowPlatformUpdate(
  loadedBundle: string | null,
  availableBundle: string | null,
): boolean {
  return Boolean(loadedBundle && availableBundle && loadedBundle !== availableBundle);
}

export function extractPlatformVersion(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const version = (payload as Record<string, unknown>).version;
  return typeof version === "string" && version.trim() ? version : null;
}

export function shouldShowVersionUpdate(
  loadedVersion: string | null,
  availableVersion: string | null,
): boolean {
  return Boolean(loadedVersion && availableVersion && loadedVersion !== availableVersion);
}

export function isLearnerLearningRoute(pathname: string): boolean {
  return pathname === "/training" || pathname.startsWith("/training/") || pathname.startsWith("/mock-exam/");
}
