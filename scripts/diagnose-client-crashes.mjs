import { writeFileSync } from "node:fs";
import { chromium } from "playwright-core";

const baseUrl = (process.env.CLIENT_CRASH_QA_URL || "https://akademy.neodev.click").replace(/\/$/, "");
const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;
const sinceDays = Math.max(1, Math.min(30, Number(process.env.CLIENT_CRASH_DAYS || 7)));
const outputPath = process.env.CLIENT_CRASH_OUTPUT || "/tmp/neopolis-client-crash-summary.json";

if (!email || !password) throw new Error("QA_ADMIN_EMAIL et QA_ADMIN_PASSWORD sont requis.");

function sanitizeText(value) {
  return String(value || "")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/https?:\/\/[^\s)]+/gi, "[url]")
    .replace(/\b\d{7,}\b/g, "[id]")
    .replace(/(token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=[masked]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

function safePath(value) {
  try {
    return new URL(value).pathname.replace(/\d{4,}/g, ":id");
  } catch {
    return "/unknown";
  }
}

function browserFamily(userAgent) {
  const value = String(userAgent || "");
  if (/Edg\//.test(value)) return "Edge";
  if (/Firefox\//.test(value)) return "Firefox";
  if (/CriOS\//.test(value)) return "Chrome iOS";
  if (/Chrome\//.test(value)) return "Chrome";
  if (/Safari\//.test(value)) return "Safari";
  return "Other";
}

function firstStackFrame(stack) {
  return sanitizeStack(stack, 1);
}

function sanitizeStack(value, limit = 4) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, limit)
    .map((line) => line
      .replace(/https?:\/\/[^/\s)]+/gi, "")
      .replace(/\?[^\s):]+/g, "")
      .replace(/\b\d{7,}\b/g, "[id]"))
    .join(" | ")
    .slice(0, 500);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
});

try {
  const headers = { "x-neopolis-qa-probe": "1" };
  const context = await browser.newContext({ extraHTTPHeaders: headers });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers });
  if (!login.ok()) throw new Error(`Connexion administrateur refusée (${login.status()}).`);
  const sessionCookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!sessionCookie) throw new Error("La connexion administrateur n’a pas fourni de session.");
  await context.addCookies([{ name: "app_session_id", value: sessionCookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);

  const input = encodeURIComponent(JSON.stringify({ json: { limit: 200, since: Date.now() - sinceDays * 86_400_000 } }));
  const response = await context.request.get(`${baseUrl}/api/trpc/system.getClientErrors?input=${input}`, { headers });
  if (!response.ok()) throw new Error(`Lecture du monitoring refusée (${response.status()}).`);
  const payload = await response.json();
  const errors = payload?.result?.data?.json || payload?.result?.data || [];
  if (!Array.isArray(errors)) throw new Error("Réponse du monitoring illisible.");

  const grouped = new Map();
  for (const error of errors) {
    const message = sanitizeText(error.message);
    const path = safePath(error.url);
    const source = sanitizeText(error.source);
    const key = `${source}|${path}|${message}`;
    const receivedAt = Number(error.receivedAt || 0);
    const current = grouped.get(key) || {
      source,
      path,
      message,
      frame: firstStackFrame(error.stack),
      stackPreview: sanitizeStack(error.stack),
      componentPreview: sanitizeStack(error.componentStack),
      browser: browserFamily(error.userAgent),
      count: 0,
      firstSeen: receivedAt,
      lastSeen: receivedAt,
    };
    current.count += 1;
    current.firstSeen = Math.min(current.firstSeen || receivedAt, receivedAt || current.firstSeen);
    current.lastSeen = Math.max(current.lastSeen || 0, receivedAt);
    grouped.set(key, current);
  }

  const signatures = [...grouped.values()]
    .sort((left, right) => right.lastSeen - left.lastSeen)
    .map((entry) => ({
      ...entry,
      firstSeen: entry.firstSeen ? new Date(entry.firstSeen).toISOString() : null,
      lastSeen: entry.lastSeen ? new Date(entry.lastSeen).toISOString() : null,
    }));
  const summary = { generatedAt: new Date().toISOString(), sinceDays, total: errors.length, signatureCount: signatures.length, signatures };
  writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
  console.table(signatures.map(({ source, path, message, count, lastSeen }) => ({ source, path, message, count, lastSeen })));
  console.log(JSON.stringify({ total: summary.total, signatureCount: summary.signatureCount, outputPath }, null, 2));
  await context.close();
} finally {
  await browser.close();
}
