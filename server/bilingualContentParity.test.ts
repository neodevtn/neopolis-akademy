import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const COURSE_DIRECTORY = path.resolve(import.meta.dirname, "..", "client", "public", "data", "courses");
const IGNORED_PATH_PARTS = new Set([
  "videoId", "watchUrl", "embedUrl", "url", "sourceUrl", "mp4Url", "hlsUrl", "audioUrl",
  "subtitleUrlEn", "subtitleUrlFr", "download_url", "asset_path", "sha256", "id", "courseId",
]);

function words(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function collectSubstantiveDivergences(value: unknown, file: string, trace: string[] = [], findings: string[] = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectSubstantiveDivergences(item, file, [...trace, String(index)], findings));
    return findings;
  }
  if (!value || typeof value !== "object") return findings;

  const candidate = value as Record<string, unknown>;
  if (typeof candidate.en === "string" && typeof candidate.fr === "string" && !trace.some((part) => IGNORED_PATH_PARTS.has(part))) {
    const enWords = words(candidate.en);
    const frWords = words(candidate.fr);
    const longest = Math.max(enWords, frWords);
    const shortest = Math.min(enWords, frWords);
    if (longest >= 40 && shortest / longest < 0.58) findings.push(`${file}:${trace.join(".")} (${enWords} EN words / ${frWords} FR words)`);
  }

  for (const [key, child] of Object.entries(candidate)) collectSubstantiveDivergences(child, file, [...trace, key], findings);
  return findings;
}

describe("published bilingual course content parity", () => {
  it("does not reduce one learner language to a summary of substantive content in the other", () => {
    const findings = fs.readdirSync(COURSE_DIRECTORY)
      .filter((file) => file.endsWith(".json"))
      .flatMap((file) => collectSubstantiveDivergences(JSON.parse(fs.readFileSync(path.join(COURSE_DIRECTORY, file), "utf8")), file));
    expect(findings).toEqual([]);
  });
});
