import { chromium } from "playwright-core";

const baseUrl = (process.env.LEARNER_COMMUNICATIONS_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.QA_EMAIL;
const password = process.env.QA_PASSWORD;
if (!email || !password) throw new Error("QA_EMAIL et QA_PASSWORD sont requis.");

const input = encodeURIComponent(JSON.stringify({ 0: { json: null } }));
const endpoint = `${baseUrl}/api/trpc/training.getCommunications?batch=1&input=${input}`;
const readCommunications = async (context) => {
  const response = await context.request.get(endpoint, { headers: { "x-neopolis-qa-probe": "1" } });
  if (!response.ok()) throw new Error(`Lecture des communiqués refusée (${response.status()}).`);
  const payload = await response.json();
  return payload[0]?.result?.data?.json;
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" } });
  if (!login.ok()) throw new Error(`Connexion apprenant refusée (${login.status()}).`);
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!cookie) throw new Error("Cookie de session apprenant absent.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  const before = await readCommunications(context);
  if (!Array.isArray(before?.items) || before.items.length < 2) throw new Error(`Historique de communiqués incomplet : ${before?.items?.length || 0} élément(s) visible(s).`);
  const importantId = before.pendingImportant?.[0]?.id;
  const page = await context.newPage();
  await page.goto(`${baseUrl}/training?tab=communications`, { waitUntil: "domcontentloaded" });
  if (importantId) {
    await page.getByText("Communication importante").waitFor({ state: "visible", timeout: 15_000 });
    await page.waitForTimeout(700);
    const after = await readCommunications(context);
    const important = after.items.find((item) => item.id === importantId);
    if (!important?.isRead || important.isAcknowledged) throw new Error(`État important incohérent après ouverture : lu=${important?.isRead}, accusé=${important?.isAcknowledged}.`);
    console.table({ visibleCommunications: after.items.length, unreadCount: after.unreadCount, importantRead: important.isRead, importantAcknowledged: important.isAcknowledged });
  } else {
    await page.getByText("Communiqués").first().waitFor({ state: "visible", timeout: 15_000 });
    console.table({ visibleCommunications: before.items.length, unreadCount: before.unreadCount, importantRead: "already acknowledged", importantAcknowledged: true });
  }
  await context.close();
} finally {
  await browser.close();
}
