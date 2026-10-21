import { describe, expect, it } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import { CATALOGUE_EXCHANGE_PATHS, getCatalogueExchangeSnapshot } from "./catalogueExchange";
import { registerPublicTrainingPages } from "./publicTrainingPages";

describe("export catalogue Akademy → Neopolis v1", () => {
  it.each(["fr", "en-US"] as const)("construit un instantané complet et stable en %s", (locale) => {
    const first = getCatalogueExchangeSnapshot(locale);
    const second = getCatalogueExchangeSnapshot(locale);
    expect(first.snapshot.complete).toBe(true);
    expect(first.snapshot.locale).toBe(locale);
    expect(first.snapshot.total_items).toBe(first.snapshot.items.length);
    expect(first.snapshot.total_items).toBeGreaterThan(0);
    expect(first.body).toBe(second.body);
    expect(first.etag).toBe(second.etag);
    expect(Buffer.byteLength(first.body, "utf8")).toBeLessThan(10 * 1024 * 1024);
    expect(first.snapshot.items.every((item) => ["category", "training", "module"].includes(String(item.entity_type)))).toBe(true);
    expect(first.snapshot.items.filter((item) => item.status === "published").every((item) => typeof item.title === "string" && item.title.length > 0)).toBe(true);
    const localized = first.snapshot.items.filter((item) => item.entity_type !== "category");
    expect(localized.every((item) => String(item.id).endsWith(locale === "fr" ? "__fr" : "__en"))).toBe(true);
    expect(localized.every((item) => String(item.translation_group_id) !== String(item.id))).toBe(true);
    if (locale === "en-US") expect(localized.every((item) => Array.isArray(item.legacy_urls) && item.legacy_urls.length > 0)).toBe(true);
  });

  it("sert le JSON public sans session puis répond 304 avec le même ETag", async () => {
    const app = express();
    registerPublicTrainingPages(app);
    const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
      const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    try {
      const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
      for (const [locale, path] of Object.entries(CATALOGUE_EXCHANGE_PATHS)) {
        const response = await fetch(`${baseUrl}${path}`);
        const body = await response.text();
        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
        expect(response.headers.get("location")).toBeNull();
        expect(response.headers.get("set-cookie")).toBeNull();
        expect(response.headers.get("etag")).toBe(getCatalogueExchangeSnapshot(locale as "fr" | "en-US").etag);
        const payload = JSON.parse(body);
        expect(payload.complete).toBe(true);
        expect(payload.locale).toBe(locale);
        expect(payload.total_items).toBe(payload.items.length);
        const notModified = await fetch(`${baseUrl}${path}`, { headers: { "if-none-match": response.headers.get("etag")! } });
        expect(notModified.status).toBe(304);
        expect(await notModified.text()).toBe("");
        expect(notModified.headers.get("etag")).toBe(response.headers.get("etag"));
      }
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });
});
