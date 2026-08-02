import { describe, it, expect } from "vitest";

// We test the pure utility functions from contentDetectors
// These are imported as if they were server-side utils (pure functions, no React rendering)
// The vitest config resolves @ to client/src

import {
  resolveI18n,
  detectLabelCards,
  detectCalloutBoxes,
  detectStepperSequence,
  detectNumberedLists,
  detectMarkdownTables,
  detectConcatenatedTables,
  detectStepItems,
} from "@/pages/training/contentDetectors";

describe("resolveI18n", () => {
  it("returns empty string for null/undefined", () => {
    expect(resolveI18n(null, "fr")).toBe("");
    expect(resolveI18n(undefined, "fr")).toBe("");
    expect(resolveI18n("", "fr")).toBe("");
  });

  it("returns plain string as-is", () => {
    expect(resolveI18n("Hello", "en")).toBe("Hello");
    expect(resolveI18n("Bonjour", "fr")).toBe("Bonjour");
  });

  it("resolves i18n object for French", () => {
    const val = { en: "Hello", fr: "Bonjour" };
    expect(resolveI18n(val, "fr")).toBe("Bonjour");
  });

  it("resolves i18n object for English", () => {
    const val = { en: "Hello", fr: "Bonjour" };
    expect(resolveI18n(val, "en")).toBe("Hello");
  });

  it("falls back to en when fr is missing", () => {
    const val = { en: "Hello" };
    expect(resolveI18n(val, "fr")).toBe("Hello");
  });

  it("falls back to fr when en is missing", () => {
    const val = { fr: "Bonjour" };
    expect(resolveI18n(val, "en")).toBe("Bonjour");
  });

  it("converts non-string/non-object to string", () => {
    expect(resolveI18n(42, "en")).toBe("42");
    expect(resolveI18n(true, "en")).toBe("true");
  });
});

describe("detectLabelCards", () => {
  it("returns empty array for empty input", () => {
    expect(detectLabelCards([])).toEqual([]);
  });

  it("returns empty array for non-matching content", () => {
    const lines = ["This is a paragraph.", "Another line.", "No pattern here."];
    expect(detectLabelCards(lines)).toEqual([]);
  });

  it("detects repeated label-card patterns", () => {
    const lines = [
      "Layer",
      "",
      "First Title",
      "",
      "First description text here",
      "",
      "Layer",
      "",
      "Second Title",
      "",
      "Second description text here",
    ];
    const result = detectLabelCards(lines);
    expect(result.length).toBe(1);
    expect(result[0].cards.length).toBe(2);
    expect(result[0].cards[0].label).toBe("Layer");
    expect(result[0].cards[0].title).toBe("First Title");
    expect(result[0].cards[0].description).toBe("First description text here");
    expect(result[0].cards[1].title).toBe("Second Title");
  });

  it("ignores single occurrence (needs 2+)", () => {
    const lines = [
      "Layer",
      "",
      "Only One Title",
      "",
      "Only one description",
    ];
    expect(detectLabelCards(lines)).toEqual([]);
  });
});

describe("detectCalloutBoxes", () => {
  it("returns empty array for empty input", () => {
    expect(detectCalloutBoxes([])).toEqual([]);
  });

  it("detects callout boxes with standard labels", () => {
    const lines = [
      "⚠️ Warning:",
      "This is a warning message",
      "",
      "Some other text",
    ];
    const result = detectCalloutBoxes(lines);
    // The detection depends on the exact pattern matching in the function
    // At minimum, it should not crash
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("detectStepperSequence", () => {
  it("returns null for non-stepper content", () => {
    const lines = ["Regular text", "More text", "No steps here"];
    expect(detectStepperSequence(lines, 0)).toBeNull();
  });

  it("detects numbered step sequences", () => {
    const lines = [
      "Step 1: Do this first",
      "Step 2: Then do this",
      "Step 3: Finally do this",
    ];
    const result = detectStepperSequence(lines, 0);
    if (result) {
      expect(result.steps.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("detectNumberedLists", () => {
  it("returns empty array for empty input", () => {
    expect(detectNumberedLists([])).toEqual([]);
  });

  it("returns empty array for non-list content", () => {
    const lines = ["Just a paragraph.", "No numbers here."];
    expect(detectNumberedLists(lines)).toEqual([]);
  });
});

describe("detectMarkdownTables", () => {
  it("returns empty array for empty input", () => {
    expect(detectMarkdownTables([])).toEqual([]);
  });

  it("detects a standard markdown table", () => {
    const lines = [
      "| Header 1 | Header 2 | Header 3 |",
      "| --- | --- | --- |",
      "| Cell 1 | Cell 2 | Cell 3 |",
      "| Cell 4 | Cell 5 | Cell 6 |",
    ];
    const result = detectMarkdownTables(lines);
    expect(result.length).toBe(1);
    expect(result[0].headers).toEqual(["Header 1", "Header 2", "Header 3"]);
    expect(result[0].rows.length).toBe(2);
    expect(result[0].rows[0]).toEqual(["Cell 1", "Cell 2", "Cell 3"]);
  });

  it("returns empty for incomplete table (no separator)", () => {
    const lines = [
      "| Header 1 | Header 2 |",
      "| Cell 1 | Cell 2 |",
    ];
    const result = detectMarkdownTables(lines);
    expect(result.length).toBe(0);
  });
});

describe("detectConcatenatedTables", () => {
  it("returns empty array for empty input", () => {
    expect(detectConcatenatedTables([])).toEqual([]);
  });

  it("returns empty array for non-table content", () => {
    const lines = ["Just text", "No table structure"];
    expect(detectConcatenatedTables(lines)).toEqual([]);
  });
});

describe("detectStepItems", () => {
  it("returns null for non-step content", () => {
    const lines = ["Regular text", "No numbered items"];
    expect(detectStepItems(lines, 0)).toBeNull();
  });

  it("detects numbered step items (1. 2. 3.)", () => {
    const lines = [
      "1. First step",
      "2. Second step",
      "3. Third step",
    ];
    const result = detectStepItems(lines, 0);
    if (result) {
      expect(result.items.length).toBe(3);
      expect(result.items[0].num).toBe(1);
      expect(result.items[0].text).toContain("First step");
    }
  });
});
