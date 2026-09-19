import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const viewer = readFileSync(resolve(process.cwd(), "client/src/pages/training/LessonViewer.tsx"), "utf8");
const orientation = readFileSync(resolve(process.cwd(), "client/src/components/OrientationPanel.tsx"), "utf8");
const service = readFileSync(resolve(process.cwd(), "server/tektekOrientationService.ts"), "utf8");

describe("contrat de mise en avant et onboarding TekTek", () => {
  it("affiche TekTek dans le header, le footer et l’introduction du premier écran", () => {
    expect(viewer).toContain('placement="header"');
    expect(viewer).toContain('placement="footer"');
    expect(viewer).toContain('placement="introduction"');
    expect(viewer).toContain("lessonIndex === 0 && currentChapter === 0");
  });

  it("ne persiste jamais automatiquement un brouillon IA", () => {
    expect(orientation).toContain("const generateTekTekDraft = async");
    expect(orientation).toContain("const applyTekTekDraft = () =>");
    expect(orientation).toContain("setCareerFamilyIds(tektekDraft.careerFamilyIds.slice(0, 4))");
    expect(orientation).toContain("const saveGoals = () => onSaveGoals");
    expect(orientation).not.toMatch(/generateTekTekDraft[\s\S]{0,700}onSaveGoals\(/);
  });

  it("utilise exclusivement Claude Sonnet et un schéma JSON strict", () => {
    expect(service).toContain('model: "claude-sonnet-4-6"');
    expect(service).toContain('type: "json_schema"');
    expect(service).toContain("strict: true");
    expect(service).not.toMatch(/openrouter|gpt-|deepseek|ollama/i);
  });
});
