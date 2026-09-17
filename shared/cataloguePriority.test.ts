import { describe, expect, it } from "vitest";
import { cataloguePriorityTier, compareCataloguePriority } from "./cataloguePriority";

describe("catalogue priority", () => {
  const beginner = { id: "prompting_intro", title: { fr: "Initiation au prompting" }, level: { fr: "Débutant" }, totalActivities: 28 };
  const finance = { id: "finance_excel", title: { fr: "Analyse financière avec Excel" }, level: { fr: "Intermédiaire" }, totalActivities: 31 };
  const short = { id: "short_path", title: { fr: "Découvrir les outils IA" }, level: { fr: "Intermédiaire" }, totalActivities: 10 };
  const longAdvanced = { id: "advanced_rag", title: { fr: "Systèmes RAG avancés" }, level: { fr: "Avancé" }, totalActivities: 52 };

  it("follows the requested beginner, finance/Excel, short, then advanced-long sequence", () => {
    expect([longAdvanced, short, finance, beginner].sort(compareCataloguePriority)).toEqual([beginner, finance, short, longAdvanced]);
  });

  it("uses short duration only after beginner and finance/Excel relevance", () => {
    expect(cataloguePriorityTier(beginner)).toBe(0);
    expect(cataloguePriorityTier(finance)).toBe(1);
    expect(cataloguePriorityTier(short)).toBe(2);
    expect(cataloguePriorityTier(longAdvanced)).toBe(3);
  });
});
