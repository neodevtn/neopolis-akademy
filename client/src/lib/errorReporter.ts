/**
 * Client-side Error Reporter
 * Captures unhandled errors, promise rejections, and React error boundaries
 * Reports them to the server for admin monitoring
 */

interface ErrorReport {
  message: string;
  stack?: string;
  source: 'window' | 'promise' | 'boundary' | 'manual' | 'react_critical';
  url: string;
  userAgent: string;
  timestamp: number;
  componentStack?: string;
  criticalPattern?: string;
}

const ERROR_ENDPOINT = '/api/trpc/system.reportError?batch=1';
const MAX_REPORTS_PER_SESSION = 20;
const DEBOUNCE_MS = 2000;

// ─── Critical React patterns that need immediate alerting ────────────────────
const CRITICAL_REACT_PATTERNS = [
  {
    name: 'duplicate_key',
    pattern: /Encountered two children with the same key/i,
    label: '🔑 Duplicate React key',
    hint: 'A list component has duplicate keys — items may be duplicated or omitted.',
  },
  {
    name: 'hooks_order_changed',
    pattern: /React has detected a change in the order of Hooks|Rendered more hooks than during the previous render/i,
    label: '🪝 Hooks order violation',
    hint: 'A hook is called conditionally or after an early return — component will crash.',
  },
  {
    name: 'invalid_hook_call',
    pattern: /Invalid hook call|Hooks can only be called inside/i,
    label: '🪝 Invalid hook call',
    hint: 'A hook is called outside a React component or custom hook.',
  },
  {
    name: 'too_many_rerenders',
    pattern: /Too many re-renders/i,
    label: '♾️ Infinite re-render loop',
    hint: 'A setState is called unconditionally during render — infinite loop.',
  },
];

function detectCriticalPattern(message: string) {
  return CRITICAL_REACT_PATTERNS.find(p => p.pattern.test(message)) || null;
}

let reportCount = 0;
let lastReportTime = 0;
const reportedErrors = new Set<string>();

function getErrorFingerprint(error: ErrorReport): string {
  return `${error.message}::${error.source}::${(error.stack || '').slice(0, 100)}`;
}

// Patterns to ignore (build/deploy artifacts, not real bugs)
const IGNORED_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'Loading module from',
  'Loading chunk',
  'ChunkLoadError',
];

function shouldIgnoreError(message: string): boolean {
  return IGNORED_PATTERNS.some(pattern => message.includes(pattern));
}

async function sendReport(report: ErrorReport): Promise<void> {
  // Ignore build/deploy errors (stale chunks after new deployment)
  if (shouldIgnoreError(report.message)) return;

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
            message: (report.criticalPattern
              ? `[${report.criticalPattern}] ${report.message}`
              : report.message).slice(0, 500),
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
  // React Error Boundaries consume rendering exceptions before they reach the
  // browser's global error event. Load Sentry only at error time so the
  // monitoring SDK does not delay the public landing page's first render.
  void import("@sentry/react")
    .then((Sentry) => Sentry.captureException(error, {
      tags: {
        source: "ErrorBoundary",
        error_kind: "react_boundary",
      },
      contexts: componentStack
        ? { react: { componentStack } }
        : undefined,
    }))
    .catch(() => undefined);

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
    const msg = event.message || 'Unknown error';
    const critical = detectCriticalPattern(msg);
    sendReport({
      message: msg,
      stack: event.error?.stack,
      source: critical ? 'react_critical' : 'window',
      url: event.filename || window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      criticalPattern: critical?.label,
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const critical = detectCriticalPattern(message);
    sendReport({
      message,
      stack,
      source: critical ? 'react_critical' : 'promise',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      criticalPattern: critical?.label,
    });
  });

  // Intercept console.error to catch React warnings about duplicate keys and hooks order
  // React logs these as console.error, not as thrown errors
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    originalConsoleError(...args);
    const msg = args.map(a => (typeof a === 'string' ? a : '')).join(' ');
    const critical = detectCriticalPattern(msg);
    if (critical) {
      sendReport({
        message: msg.slice(0, 500),
        source: 'react_critical',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        criticalPattern: critical.label,
      });
    }
  };

  console.info('[ErrorReporter] Initialized - monitoring for client-side errors');
}
