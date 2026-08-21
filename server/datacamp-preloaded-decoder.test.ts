import { describe, expect, it } from "vitest";
import transitModule from "transit-js";
import { decodePreloadedState } from "../scripts/datacamp-preloaded-decoder.mjs";

const transit = (transitModule as any).default || transitModule;

describe("decodePreloadedState", () => {
  it("décode une charge Transit HTML-encodée sans exécuter le JavaScript source", () => {
    const payload = transit.writer("json").write({ exercise: { cards: ["A", "B"], answer: "A" } });
    const source = `window.PRELOADED_STATE = ${JSON.stringify(payload.replace(/"/g, "&quot;"))};`;
    expect(decodePreloadedState(source)).toEqual({ exercise: { cards: ["A", "B"], answer: "A" } });
  });

  it("refuse une charge tronquée plutôt que d’inventer une correction", () => {
    expect(() => decodePreloadedState('window.PRELOADED_STATE = "[Truncated]";')).toThrow(/tronqué/);
  });
});
