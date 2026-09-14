import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const coursesDir = resolve(process.cwd(), "client/public/data/courses");

function collectUnlocalizedStrings(value: unknown, results: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectUnlocalizedStrings(item, results));
    return results;
  }
  if (!value || typeof value !== "object") return results;
  const localized = value as { en?: unknown; fr?: unknown };
  if (typeof localized.en === "string" && typeof localized.fr === "string" && localized.en.trim() === localized.fr.trim() && localized.en.length > 18 && /[A-Za-z]{5,}/.test(localized.en)) {
    results.push(localized.en);
  }
  Object.values(value).forEach((child) => collectUnlocalizedStrings(child, results));
  return results;
}

describe("localisation des cours Anthropic à forte densité anglaise", () => {
  it("traduit les textes pédagogiques de Claude 101 et Claude Code tout en conservant les commandes techniques", async () => {
    const [claude101, claudeCode101, claudeCodeAction] = await Promise.all(
      ["claude_101__01", "claude_code_101__01", "claude_code_in_action__01"].map(async (courseId) =>
        JSON.parse(await readFile(resolve(coursesDir, `${courseId}.json`), "utf8")),
      ),
    );

    expect(claude101.lessons[0].description.fr).toMatch(/assistant IA d[’']Anthropic/);
    expect(claude101.lessons[0].chapters[0].title.fr).toBe("Premiers pas avec Claude !");
    expect(claudeCode101.lessons[0].chapters[0].title.fr).not.toBe(claudeCode101.lessons[0].chapters[0].title.en);
    expect(claudeCodeAction.lessons[0].chapters[0].title.fr).not.toBe(claudeCodeAction.lessons[0].chapters[0].title.en);

    expect(collectUnlocalizedStrings(claude101)).toHaveLength(0);
    expect(collectUnlocalizedStrings(claudeCode101)).toHaveLength(0);
    expect(collectUnlocalizedStrings(claudeCodeAction)).toHaveLength(0);
  });
});
