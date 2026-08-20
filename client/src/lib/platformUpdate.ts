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

export function isLearnerLearningRoute(pathname: string): boolean {
  return pathname === "/training" || pathname.startsWith("/training/") || pathname.startsWith("/mock-exam/");
}
