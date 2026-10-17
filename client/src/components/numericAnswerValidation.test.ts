import { describe, expect, it } from "vitest";
import { getNumericAnswerFeedback, isNumericAnswerCorrect, parseUnambiguousNumber } from "./numericAnswerValidation";

describe("numeric answer validation", () => {
  it("accepts one locale decimal separator and rejects ambiguous group formatting", () => {
    expect(parseUnambiguousNumber("12,5")).toBe(12.5);
    expect(parseUnambiguousNumber("12.5")).toBe(12.5);
    expect(parseUnambiguousNumber("1,234.56")).toBeNull();
    expect(parseUnambiguousNumber("1.234,56")).toBeNull();
  });

  it("applies the published tolerance as an absolute value for every unit", () => {
    const eur = { expected_value: 100, unit: "EUR", tolerance: 0.01 };
    expect(isNumericAnswerCorrect(eur, "99.99")).toBe(true);
    expect(isNumericAnswerCorrect(eur, "100,01")).toBe(true);
    expect(isNumericAnswerCorrect(eur, "101")).toBe(false);
    expect(isNumericAnswerCorrect({ expected_value: 12.5, unit: "%", tolerance: 0.1 }, "12,6")).toBe(true);
  });

  it("shows only the factual expected answer and tolerance when no authored feedback exists", () => {
    expect(getNumericAnswerFeedback({ expected_value: 42, unit: "lignes", tolerance: 0 }, "fr")).toBe("Réponse attendue : 42 lignes.");
    expect(getNumericAnswerFeedback({ expected_value: 100, unit: "EUR", tolerance: 0.01 }, "en")).toContain("Applied tolerance: ±0.01 EUR");
  });
});
