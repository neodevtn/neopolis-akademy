/**
 * Client-side Error Reporter
 * Captures unhandled errors, promise rejections, and React error boundaries
 * Reports them to the server for admin monitoring
 */

interface ErrorReport {
  message: string;
  stack?: string;
  source: 'window' | 'promise' | 'boundary' | 'manual';
  url: string;
  userAgent: string;
  timestamp: number;
  componentStack?: string;
}

const ERROR_ENDPOINT = '/api/trpc/system.reportError?batch=1';
const MAX_REPORTS_PER_SESSION = 20;
const DEBOUNCE_MS = 2000;

let reportCount = 0;
let lastReportTime = 0;
const reportedErrors = new Set<string>();

function getErrorFingerprint(error: ErrorReport): string {
  return `${error.message}::${error.source}::${(error.stack || '').slice(0, 100)}`;
}

async function sendReport(report: ErrorReport): Promise<void> {
  // Rate limiting
  if (reportCount >= MAX_REPORTS_PER_SESSION) return;
  const now = Date.now();
  if (now - lastReportTime < DEBOUNCE_MS) return;

  // Deduplication
  const fingerprint = getErrorFingerprint(report);
  if (reportedErrors.has(fingerprint)) return;

  reportedErrors.add(fingerprint);
  reportCount++;
  lastReportTime = now;

  try {
    await fetch(ERROR_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        "0": {
          json: {
            message: report.message.slice(0, 500),
            stack: (report.stack || '').slice(0, 2000),
            source: report.source,
            url: report.url,
            timestamp: report.timestamp,
            componentStack: (report.componentStack || '').slice(0, 1000),
          }
        }
      }),
    });
  } catch {
    // Silently fail - don't cause more errors
  }
}

/**
 * Report an error from React ErrorBoundary
 */
export function reportBoundaryError(error: Error, componentStack?: string): void {
  sendReport({
    message: error.message,
    stack: error.stack,
    source: 'boundary',
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    componentStack,
  });
}

/**
 * Report an error manually (e.g., from catch blocks)
 */
export function reportError(error: Error | string, context?: string): void {
  const msg = typeof error === 'string' ? error : error.message;
  const stack = typeof error === 'string' ? undefined : error.stack;
  sendReport({
    message: context ? `[${context}] ${msg}` : msg,
    stack,
    source: 'manual',
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  });
}

/**
 * Initialize global error listeners
 * Call once at app startup
 */
export function initErrorReporter(): void {
  // Capture unhandled errors
  window.addEventListener('error', (event) => {
    sendReport({
      message: event.message || 'Unknown error',
      stack: event.error?.stack,
      source: 'window',
      url: event.filename || window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    sendReport({
      message,
      stack,
      source: 'promise',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });
  });

  console.info('[ErrorReporter] Initialized - monitoring for client-side errors');
}
