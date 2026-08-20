import { describe, expect, it } from "vitest";
import { isCommunicationDraftEditable } from "./adminDb";

describe("isCommunicationDraftEditable", () => {
  it("autorise uniquement les brouillons non programmés", () => {
    expect(isCommunicationDraftEditable("draft")).toBe(true);
    expect(isCommunicationDraftEditable("scheduled")).toBe(false);
    expect(isCommunicationDraftEditable("sending")).toBe(false);
    expect(isCommunicationDraftEditable("sent")).toBe(false);
  });
});
