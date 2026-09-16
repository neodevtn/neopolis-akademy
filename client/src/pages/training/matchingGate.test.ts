import { describe, expect, it } from "vitest";
import { getRequiredMatchingInteractionIds } from "./matchingGate";

describe("getRequiredMatchingInteractionIds", () => {
  it("inclut les bloc standards de tri et d’association avec leurs identifiants de rendu", () => {
    expect(getRequiredMatchingInteractionIds([
      { type: "content" },
      { type: "bucket_sort", id: "permission_gate" },
      { type: "matching" },
      { type: "matching", id: "mcp_scope_gate" },
    ])).toEqual(["permission_gate", "matching_2", "mcp_scope_gate"]);
  });

  it("ignore les blocs non interactifs", () => {
    expect(getRequiredMatchingInteractionIds([
      { type: "content" },
      { type: "flip_cards" },
      { type: "single_choice_exercise", id: "checkpoint" },
    ])).toEqual([]);
  });
});
