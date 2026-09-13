import { describe, expect, it } from "vitest";
import { dispatchSupportHubAction, SUPPORT_HUB_EVENT, type SupportHubEventDetail } from "./supportHub";

describe("support hub action relay", () => {
  it("relays a requested assistance action without coupling it to an interface", () => {
    const target = new EventTarget();
    let received: SupportHubEventDetail | null = null;
    target.addEventListener(SUPPORT_HUB_EVENT, (event) => {
      received = (event as CustomEvent<SupportHubEventDetail>).detail;
    });

    dispatchSupportHubAction({ action: "new-conversation" }, target);

    expect(received).toEqual({ action: "new-conversation" });
  });

  it("carries a conversation identifier only when reopening an existing private thread", () => {
    const target = new EventTarget();
    let received: SupportHubEventDetail | null = null;
    target.addEventListener(SUPPORT_HUB_EVENT, (event) => {
      received = (event as CustomEvent<SupportHubEventDetail>).detail;
    });

    dispatchSupportHubAction({ action: "open-conversation", conversationId: 42 }, target);

    expect(received).toEqual({ action: "open-conversation", conversationId: 42 });
  });
});
